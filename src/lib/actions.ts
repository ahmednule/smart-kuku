"use server";

import {
  addDiseaseFormSchema,
  addPestFormSchema,
  addProductFormSchema,
  contactFormSchema,
  editPestFormSchema,
  editProductFormSchema,
  registerSupplierFormSchema,
} from "./schemas";
import {
  initialAddPestFormState,
  initialAddProductFormState,
  initialDiseaseFormState,
  initialEditPestFormState,
  initialEditProductFormState,
  initialFormState,
  initialSupplierFormState,
  ScanStatus,
} from "./constants";
import {
  AddDiseaseForm,
  AddPestForm,
  AddProductForm,
  ContactForm,
  EditPestForm,
  EditProductForm,
  RegisterSupplierForm,
  ResourceType,
} from "./types";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "./prisma";
import { Role, ScanType, SupplierStatus } from "@/generated/prisma/enums";
import { getServerSupabase, getSupabasePublicUrl } from "./supabase";
import removeMarkdown from "remove-markdown";
import {
  arraysAreEqualUnordered,
  getResourceDescription,
  getResourceName,
} from "./utils";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";

const supabase = getServerSupabase();
const GEMINI_MODEL = "gemini-2.5-flash";

const getGoogleApiKey = () => {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing required environment variable: GOOGLE_API_KEY");
  }

  return apiKey;
};

const gemini = new GoogleGenAI({ apiKey: getGoogleApiKey() });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getModelText = (response: any): string => {
  const text =
    typeof response?.text === "function" ? response.text() : response?.text;

  if (typeof text !== "string") {
    throw new Error("Gemini returned an empty response");
  }

  return text;
};

const parseUploadedImage = (formData: FormData) => {
  const rawImage = formData.get("image");

  if (!rawImage || typeof rawImage !== "string") {
    throw new Error("Please upload one image before scanning.");
  }

  let parsedImage: any;
  try {
    parsedImage = JSON.parse(rawImage);
  } catch {
    throw new Error("Invalid image payload. Please re-upload your image.");
  }

  if (!parsedImage?.data) {
    throw new Error("Image data is missing. Please upload the image again.");
  }

  return parsedImage;
};

const getGeminiScanErrorMessage = (error: unknown): string => {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;

  const rawMessage =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  if (
    status === 429 ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.toLowerCase().includes("quota exceeded")
  ) {
    return "Gemini quota reached. Please retry shortly.";
  }

  if (
    status === 403 &&
    (rawMessage.includes("SERVICE_DISABLED") ||
      rawMessage.includes("Generative Language API has not been used"))
  ) {
    return "Gemini API is not enabled for this project yet.";
  }

  if (status === 401 || rawMessage.toLowerCase().includes("api key")) {
    return "Invalid GOOGLE_API_KEY configuration for Gemini.";
  }

  return ScanStatus.ERROR;
};

export const scanPestImage = async (
  formState: string,
  formData: FormData
): Promise<string> => {
  let parsedImage: any;
  try {
    parsedImage = parseUploadedImage(formData);
  } catch (error) {
    return error instanceof Error ? error.message : ScanStatus.ERROR;
  }

  const session = await auth();
  const user = session?.user;
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
             text: "Analyze the uploaded image carefully and determine whether it shows a poultry bird (such as a hen, chicken, broiler, layer, chick, or any domestic fowl). If the image does NOT clearly show a poultry bird, respond with exactly: Error: This is not a poultry bird. If the bird appears healthy with no visible pest infestation, respond with exactly: Error: No pest detected on this bird. If a pest infestation is detected (e.g. mites, lice, fleas, worms, ticks), return only this format: first line = pest name in singular and bold (**Name**). Then provide five sections with bold headings in this exact order: **Description**, **Damage**, **Control**, **Treatment**. Keep all guidance practical and specific for smallholder poultry farmers in Kenya.",
            },
            {
              inlineData: {
                mimeType: parsedImage.type || "image/jpeg",
                data: parsedImage.data,
              },
            },
          ],
        },
      ],
    });
    const res = getModelText(response);

    // Handle image not pest
   if (res.toLowerCase().includes("error: this is not a poultry bird") || res.toLowerCase().includes("error: no pest detected"))
  return ScanStatus.IMAGENOTPEST;

    if (user?.role !== Role.CUSTOMER) return res;

    // Upload image to Supabase
    const imageBuffer = Buffer.from(parsedImage.data, "base64");
    const folderName = `customer/${user!.id}/pests`;
    const fileName = `${folderName}/${Date.now()}_${parsedImage.name}`;
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: parsedImage.type,
      });

    const pestName = getResourceName(res);
    const pestDescription = getResourceDescription(res);

    // Store scan in database
    await prisma.scan.create({
      data: {
        name: pestName,
        description: pestDescription,
        customerId: user!.id!,
        url: getSupabasePublicUrl(imageData?.fullPath),
        type: ScanType.PEST,
      },
    });

    // Store pest in database
    const isPestStored = await prisma.pest.findFirst({
      where: {
        slug: pestName.toLowerCase().replace(/\s/g, "-"),
      },
    });

    // TODO: Upload image to its own folder later and not use customer scan reference

    if (!isPestStored)
      await prisma.pest.create({
        data: {
          name: pestName,
          text: pestDescription,
          images: [getSupabasePublicUrl(imageData?.fullPath)],
          slug: pestName.toLowerCase().replace(/\s/g, "-"),
        },
      });

    revalidatePath("/resources");

    return res;
  } catch (error) {
    console.error("Pest scan failed:", error);
    return getGeminiScanErrorMessage(error);
  }
};

export const scanDiseaseImage = async (
  formState: string,
  formData: FormData
): Promise<string> => {
  let parsedImage: any;
  try {
    parsedImage = parseUploadedImage(formData);
  } catch (error) {
    return error instanceof Error ? error.message : ScanStatus.ERROR;
  }

  const session = await auth();
  const user = session?.user;

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
text: "Analyze the uploaded image carefully and determine whether it shows a poultry bird (such as a hen, chicken, broiler, layer, chick, or any domestic fowl). If the image does NOT clearly show a poultry bird, respond with exactly: Error: This is not a poultry bird. If the bird appears healthy with no visible signs of disease, respond with exactly: Error: No disease detected on this bird. If a disease is detected (e.g. Newcastle disease, Gumboro, Coccidiosis, Marek's disease, Fowl pox, Fowl typhoid, Infectious Bronchitis), return only this format: first line = disease name in singular and bold (**Name**). Then provide five sections with bold headings in this exact order: **Cause**, **Symptoms**, **Impact**, **Control**, **Treatment**. Keep all guidance practical and specific for smallholder poultry farmers in Kenya.",
            },
            {
              inlineData: {
                mimeType: parsedImage.type || "image/jpeg",
                data: parsedImage.data,
              },
            },
          ],
        },
      ],
    });
    const res = getModelText(response);

    // Handle image not disease
    if (res.toLowerCase().includes("error: this is not a poultry bird") || res.toLowerCase().includes("error: no disease detected"))
  return ScanStatus.IMAGENOTDISEASE;

    if (user?.role !== Role.CUSTOMER) return res;

    // Upload image to Supabase
    const imageBuffer = Buffer.from(parsedImage.data, "base64");
    const folderName = `customer/${user!.id}/diseases`;
    const fileName = `${folderName}/${Date.now()}_${parsedImage.name}`;
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: parsedImage.type,
      });

    const diseaseName = getResourceName(res);
    const diseaseDescription = getResourceDescription(res);

    // Store scan in database
    await prisma.scan.create({
      data: {
        name: diseaseName,
        description: diseaseDescription,
        customerId: user!.id!,
        url: getSupabasePublicUrl(imageData?.fullPath),
        type: ScanType.DISEASE,
      },
    });

    // Store disease in database
    const isDiseaseStored = await prisma.disease.findFirst({
      where: {
        slug: diseaseName.toLowerCase().replace(/\s/g, "-"),
      },
    });

    // TODO: Upload image to its own folder later and not use customer scan reference

    if (!isDiseaseStored)
      await prisma.disease.create({
        data: {
          name: diseaseName,
          text: diseaseDescription,
          images: [getSupabasePublicUrl(imageData?.fullPath)],
          slug: diseaseName.toLowerCase().replace(/\s/g, "-"),
        },
      });

    revalidatePath("/resources");

    return res;
  } catch (error) {
    console.error("Disease scan failed:", error);
    return getGeminiScanErrorMessage(error);
  }
};

export const sendEmail = async (
  formState: ContactForm,
  formData: FormData
): Promise<ContactForm> => {
  const name = formData.get("name");
  const recipientEmail = formData.get("email");
  const message = formData.get("message");

  const { success, data, error } = contactFormSchema.safeParse({
    name,
    email: recipientEmail,
    message,
  });

  if (!success) {
    return {
      ...initialFormState,
      name: error.flatten().fieldErrors.name?.[0] ?? "",
      email: error.flatten().fieldErrors.email?.[0] ?? "",
      message: error.flatten().fieldErrors.message?.[0] ?? "",
    };
  }

  try {
    const orgEmail = process.env.ORG_EMAIL ?? process.env.ORG_EMAI;
    const appPassword = process.env.APP_PASSWORD;

    if (!orgEmail || !appPassword) {
      return {
        ...initialFormState,
        db: "Missing APP_PASSWORD or ORG_EMAIL/ORG_EMAI in environment variables",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: orgEmail,
        pass: appPassword,
      },
    });

    await transporter.sendMail({
      from: `KukuSmart Contact <${orgEmail}>`,
      to: orgEmail,
      replyTo: data.email,
      subject: `Contact form submission from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
      html: `
        <div style="background-color:#064e3b;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;box-shadow:0 10px 25px rgba(0,0,0,0.14);">
            <h2 style="margin:0 0 10px;color:#0a0e14;font-size:24px;line-height:1.25;">KukuSmart Contact Form Submission</h2>
            <p style="margin:0 0 18px;color:#475569;">You have a new contact form submission:</p>

            <p style="margin:0 0 4px;color:#1f2937;"><strong>Name:</strong></p>
            <p style="margin:0 0 14px;color:#475569;">${escapeHtml(data.name)}</p>

            <p style="margin:0 0 4px;color:#1f2937;"><strong>Email:</strong></p>
            <p style="margin:0 0 14px;color:#475569;">${escapeHtml(data.email)}</p>

            <p style="margin:0 0 4px;color:#1f2937;"><strong>Message:</strong></p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.6;color:#475569;">${escapeHtml(data.message)}</p>
          </div>
        </div>
      `,
    });

    return {
      ...initialFormState,
      db: "success",
    };
  } catch (error) {
    return {
      ...initialFormState,
      db: "Error sending email, please try again",
    };
  }
};

export const deleteUser = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to delete a user");

  try {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to delete user" + error.message);
  }

  revalidatePath("/", "layout");
};

export const deleteScan = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.CUSTOMER)
    throw new Error("You must be a customer to delete your previous scan");

  try {
    await prisma.scan.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to delete scan" + error.message);
  }

  revalidatePath("/customer/scan-history");
};

export const addPest = async (
  formState: AddPestForm,
  formData: FormData
): Promise<AddPestForm> => {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const control = formData.get("control") as string;
  const damage = formData.get("damage") as string;
  const image = formData.get("image") as any;

  const { success, data, error } = addPestFormSchema.safeParse({
    name,
    description,
    control,
    damage,
    image,
  });

  if (!success) {
    return {
      ...initialFormState,
      name: error.flatten().fieldErrors.name?.[0] ?? "",
      description: error.flatten().fieldErrors.description?.[0] ?? "",
      control: error.flatten().fieldErrors.control?.[0] ?? "",
      damage: error.flatten().fieldErrors.damage?.[0] ?? "",
      image: error.flatten().fieldErrors.image?.[0] ?? "",
    };
  }

  const parsedImage = JSON.parse(image);
  const imageBuffer = Buffer.from(parsedImage.data, "base64");

  try {
    const folderName = `pests/${name}`;
    const fileName = `${folderName}/${Date.now()}_${parsedImage.name}`;
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: parsedImage.type,
      });

    if (error) {
      throw error;
    }
    return {
      ...initialAddPestFormState,
      db: "success",
    };
  } catch (error) {
    return {
      ...initialAddPestFormState,
      db: "Error adding pest, please try again",
    };
  }
};

export const addDisease = async (
  formState: AddDiseaseForm,
  formData: FormData
): Promise<AddDiseaseForm> => {
  const name = formData.get("name") as string;
  const cause = formData.get("cause") as string;
  const symptoms = formData.get("symptoms") as string;
  const impact = formData.get("impact") as string;
  const control = formData.get("control") as string;
  const image = formData.get("image") as any;

  const { success, data, error } = addDiseaseFormSchema.safeParse({
    name,
    cause,
    symptoms,
    impact,
    control,
    image,
  });

  if (!success) {
    return {
      ...initialDiseaseFormState,
      name: error.flatten().fieldErrors.name?.[0] ?? "",
      cause: error.flatten().fieldErrors.control?.[0] ?? "",
      symptoms: error.flatten().fieldErrors.symptoms?.[0] ?? "",
      impact: error.flatten().fieldErrors.impact?.[0] ?? "",
      control: error.flatten().fieldErrors.control?.[0] ?? "",
      image: error.flatten().fieldErrors.image?.[0] ?? "",
    };
  }

  const parsedImage = JSON.parse(image);
  const imageBuffer = Buffer.from(parsedImage.data, "base64");

  try {
    const folderName = `diseases/${name}`;
    const fileName = `${folderName}/${Date.now()}_${parsedImage.name}`;
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: parsedImage.type,
      });

    if (error) {
      throw error;
    }
    return {
      ...initialDiseaseFormState,
      db: "success",
    };
  } catch (error) {
    return {
      ...initialDiseaseFormState,
      db: "Error adding disease, please try again",
    };
  }
};

export const deletePest = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to delete a pest");

  try {
    await prisma.pest.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to delete pest" + error.message);
  }

  redirect("/resources/pests");
};

export const deleteDisease = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to delete a disease");

  try {
    await prisma.disease.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to delete disease" + error.message);
  }

  redirect("/resources/diseases");
};

export const editPest = async ({
  id,
  content,
}: {
  id: string;
  content: string;
}) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to edit a pest");

  try {
    await prisma.pest.update({
      where: {
        id: id,
      },
      data: {
        text: content,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to edit pest" + error.message);
  }

  revalidatePath(`/resources/pests/${id}`);
};

export const editDisease = async ({
  id,
  content,
}: {
  id: string;
  content: string;
}) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to edit a disease");

  try {
    await prisma.disease.update({
      where: {
        id: id,
      },
      data: {
        text: content,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to edit disease" + error.message);
  }

  revalidatePath(`/resources/diseases/${id}`);
};

export const deleteAllScans = async () => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.CUSTOMER)
    throw new Error(
      "You must be logged in as a customer to delete your previous scans"
    );

  try {
    await prisma.scan.deleteMany({
      where: {
        customerId: user!.id!,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to delete scans" + error.message);
  }

  revalidatePath("/customer/scan-history");
};

// Receives 2 scan ids, fetches their images, sends them to Gemini, and returns a progress summary.
export const trackProgress = async ({
  image1,
  image2,
}: {
  image1: string;
  image2: string;
}) => {
  const session = await auth();
  const user = session?.user;

  if (!user) throw new Error("You must be logged in to track progress");

  const image1Url = await prisma.scan.findFirst({
    where: {
      id: image1,
    },
  });

  const image2Url = await prisma.scan.findFirst({
    where: {
      id: image2,
    },
  });

  try {
    if (!image1Url?.url || !image2Url?.url) {
      return ScanStatus.ERROR;
    }

    const [firstImageResponse, secondImageResponse] = await Promise.all([
      fetch(image1Url.url),
      fetch(image2Url.url),
    ]);

    if (!firstImageResponse.ok || !secondImageResponse.ok) {
      return ScanStatus.ERROR;
    }

    const [firstImageBuffer, secondImageBuffer] = await Promise.all([
      firstImageResponse.arrayBuffer(),
      secondImageResponse.arrayBuffer(),
    ]);

    const firstImageBase64 = Buffer.from(firstImageBuffer).toString("base64");
    const secondImageBase64 = Buffer.from(secondImageBuffer).toString("base64");

    const firstImageMimeType =
      firstImageResponse.headers.get("content-type") || "image/jpeg";
    const secondImageMimeType =
      secondImageResponse.headers.get("content-type") || "image/jpeg";

    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "You are an agricultural AI assistant. You have been given the 2 images, track the progress of the plant disease over time. The first image is the initial scan of the plant disease and the second image is the latest scan of the plant disease. Provide a detailed response on how the plant disease has progressed over time. If the progress has not improved or has become worse, then notify the user about it as well. If the images are of different diseases or are just different plants altogether, notify the user with a response of one sentence. Do not give a response like feel free to ask because it's a one way input",
            },
            {
              inlineData: {
                mimeType: firstImageMimeType,
                data: firstImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: secondImageMimeType,
                data: secondImageBase64,
              },
            },
          ],
        },
      ],
    });

    return getModelText(response);
  } catch (error) {
    return ScanStatus.ERROR;
  }
};

export const getTags = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user) return;

  const tags = await prisma.scan.findMany({
    where: {
      customerId: user.id,
      type: ScanType.DISEASE,
    },
    select: {
      tag: true,
    },
    distinct: ["tag"],
  });

  revalidatePath("/");

  return tags;
};

export const uploadImages = async ({
  id,
  files,
  type,
}: {
  id: string;
  files: { name: string; type: string; base64: string }[];
  type: ResourceType;
}) => {
  const session = await auth();
  const user = session?.user;

  if (!user || user.role !== Role.ADMIN) return;

  const images = files.map(async (file) => {
    const base64Data = file.base64.split(",")[1];
    const imageBuffer = Buffer.from(base64Data, "base64");
    const folderName = `resource`;
    const fileName = `${folderName}/${Date.now()}_${file.name}`;
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(fileName, imageBuffer, {
        contentType: file.type,
      });

    if (error) throw new Error("Failed to upload image");

    const imageUrl = getSupabasePublicUrl(imageData.fullPath);

    if (type === ResourceType.PEST) {
      await prisma.pest.update({
        where: { id },
        data: {
          images: {
            push: imageUrl,
          },
        },
      });
    } else if (type === ResourceType.DISEASE) {
      await prisma.disease.update({
        where: { id },
        data: {
          images: {
            push: imageUrl,
          },
        },
      });
    }

    return imageUrl;
  });

  await Promise.all(images);

  revalidatePath(`/resources`);
};

export const deleteImage = async ({
  id,
  imageUrl,
  type,
}: {
  id: string;
  imageUrl: string;
  type: ResourceType;
}) => {
  const session = await auth();
  const user = session?.user;

  if (!user || user.role !== Role.ADMIN) return;

  // Extract the file name from the URL
  const fileName = imageUrl.split("/").pop();

  if (!fileName) {
    throw new Error("Invalid image URL");
  }

  // Delete the file from Supabase storage
  const { error: deleteError } = await supabase.storage
    .from("images")
    .remove([`resource/${fileName}`]);

  if (deleteError) {
    throw new Error("Failed to delete image from storage");
  }

  // Update the database to remove the image URL
  if (type === "Pest") {
    await prisma.pest.update({
      where: { id },
      data: {
        images: {
          set: await prisma.pest
            .findUnique({ where: { id } })
            .then(
              (pest) =>
                pest?.images.filter((img: string) => img !== imageUrl) || []
            ),
        },
      },
    });
  } else if (type === "Disease") {
    await prisma.disease.update({
      where: { id },
      data: {
        images: {
          set: await prisma.disease
            .findUnique({ where: { id } })
            .then(
              (disease) =>
                disease?.images.filter((img: string) => img !== imageUrl) || []
            ),
        },
      },
    });
  }

  revalidatePath(`/resources`);
};

export const registerSupplier = async (
  formState: RegisterSupplierForm,
  formData: FormData
): Promise<RegisterSupplierForm> => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const logo = formData.get("logo") as any;
  const license = formData.get("license") as any;

  const session = await auth();
  const id = session?.user.id;

  const { success, data, error } = registerSupplierFormSchema.safeParse({
    name,
    email,
    address,
    phone,
    logo,
    license,
  });

  if (!success) {
    return {
      ...initialSupplierFormState,
      name: error.flatten().fieldErrors.name?.[0] ?? "",
      email: error.flatten().fieldErrors.email?.[0] ?? "",
      address: error.flatten().fieldErrors.address?.[0] ?? "",
      phone: error.flatten().fieldErrors.phone?.[0] ?? "",
      logo: error.flatten().fieldErrors.logo?.[0] ?? "",
      license: error.flatten().fieldErrors.license?.[0] ?? "",
    };
  }

  const parsedLogo = JSON.parse(logo);
  const parsedLicense = JSON.parse(license);
  const logoBuffer = Buffer.from(parsedLogo.data, "base64");
  const licenseBuffer = Buffer.from(parsedLicense.data, "base64");

  try {
    const folderName = `supplier/${name}`;
    const logoFileName = `${folderName}/${Date.now()}_${parsedLogo.name}`;
    const licenseFileName = `${folderName}/${Date.now()}_${parsedLicense.name}`;
    const { data: logoData, error: logoError } = await supabase.storage
      .from("images")
      .upload(logoFileName, logoBuffer, {
        contentType: parsedLogo.type,
      });
    const { data: licenseData, error: licenseError } = await supabase.storage
      .from("images")
      .upload(licenseFileName, licenseBuffer, {
        contentType: parsedLicense.type,
      });

    if (logoError || licenseError) {
      throw new Error("Failed to upload images");
    }

    await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        status: SupplierStatus.PENDING,
        phone: data.phone,
        logo: getSupabasePublicUrl(logoData.fullPath),
        license: getSupabasePublicUrl(licenseData.fullPath),
      },
    });

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        role: Role.SUPPLIER,
      },
    });

    return {
      ...initialSupplierFormState,
      db: "success",
    };
  } catch (error) {
    return {
      ...initialSupplierFormState,
      db:
        "Error registering supplier: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
};

export const deleteSupplier = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to delete a supplier");

  try {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    throw new Error(
      "Failed to delete supplier: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }

  revalidatePath("/resources/suppliers");
};

export const approveSupplier = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to approve a supplier");

  try {
    await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        status: SupplierStatus.APPROVED,
        approvedBy: user.name,
        approvedAt: new Date(),
        rejectedAt: null,
        rejectedBy: null,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to approve supplier" + error.message);
  }

  revalidatePath("/resources/suppliers");
};

export const rejectSupplier = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to reject a supplier");

  try {
    await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        status: SupplierStatus.REJECTED,
        rejectedBy: user.name,
        rejectedAt: new Date(),
        approvedAt: null,
        approvedBy: null,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to reject supplier" + error.message);
  }

  revalidatePath("/resources/suppliers");
};

export const cancelRejection = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to cancel rejection of a supplier");

  try {
    await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        status: SupplierStatus.PENDING,
        rejectedBy: null,
        rejectedAt: null,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to cancel rejection of supplier" + error.message);
  }

  revalidatePath("/resources/suppliers");
};

export const cancelApproval = async (id: string) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.ADMIN)
    throw new Error("You must be an admin to cancel approval of a supplier");

  try {
    await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        status: SupplierStatus.PENDING,
        approvedBy: null,
        approvedAt: null,
      },
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to cancel approval of supplier" + error.message);
  }

  revalidatePath("/resources/suppliers");
};

export async function addProduct(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const images = formData.getAll("images") as any;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const region = formData.get("region") as string;
  const countryCode = formData.get("countryCode") as string;
  const currencySymbol = formData.get("currencySymbol") as string;

  const session = await auth();
  const user = session?.user;

  const { success, data, error } = addProductFormSchema.safeParse({
    name,
    price,
    description,
    images,
    city,
    country,
    region,
    countryCode,
    currencySymbol,
  });

  if (!success) {
    return {
      ...initialAddProductFormState,
      name: error.flatten().fieldErrors.name?.[0] ?? "",
      price: error.flatten().fieldErrors.price?.[0] ?? "",
      description: error.flatten().fieldErrors.description?.[0] ?? "",
      images: error.flatten().fieldErrors.images?.[0] ?? "",
      city: error.flatten().fieldErrors.city?.[0] ?? "",
      country: error.flatten().fieldErrors.country?.[0] ?? "",
      region: error.flatten().fieldErrors.region?.[0] ?? "",
      countryCode: error.flatten().fieldErrors.countryCode?.[0] ?? "",
      currencySymbol: error.flatten().fieldErrors.currencySymbol?.[0] ?? "",
    };
  }

  // check whether the product with the same name, city, country, region and supplier already exists
  const productSupplier = await prisma.productSupplier.findFirst({
    where: {
      product: {
        name,
      },
      city,
      country,
      region,
      supplierId: user?.id!,
    },
  });

  if (productSupplier) {
    return {
      ...initialAddProductFormState,
      db: "You have already added a similar product in that location.",
    };
  }

  const imageBuffers = images.map((image: any) => {
    const parsedImage = JSON.parse(image);
    return Buffer.from(parsedImage.data, "base64");
  });

  try {
    // check if product exists by name
    const product = await prisma.product.findUnique({
      where: {
        name,
      },
    });

    let productId = product?.id;

    if (!product) {
      // create product if it doesnt exist
      const { id } = await prisma.product.create({
        data: {
          name,
        },
      });

      productId = id;
    }

    const folderName = `products/${name}`;
    const imageUrls = await Promise.all(
      imageBuffers.map(async (imageBuffer: any) => {
        const fileName = `${folderName}/${Date.now()}_${Math.random()}.jpeg`;
        const { data: imageData, error } = await supabase.storage
          .from("images")
          .upload(fileName, imageBuffer, {
            contentType: "image/jpeg",
          });

        if (error) throw error;

        return getSupabasePublicUrl(imageData.fullPath);
      })
    );

    await prisma.productSupplier.create({
      data: {
        price: parseFloat(data.price),
        description: data.description,
        images: imageUrls,
        city: data.city,
        country: data.country,
        region: data.region,
        supplierId: user?.id!,
        productId: productId!,
        countryCode: data.countryCode,
        currencySymbol: data.currencySymbol,
      },
    });

    revalidatePath("/store", "layout");

    return {
      ...initialAddProductFormState,
      db: "success",
    };
  } catch (error) {
    return {
      ...initialAddProductFormState,
      db:
        "Error adding product: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}

export const deleteProduct = async ({
  id,
  imagesUrl,
}: {
  id: string;
  imagesUrl: string[];
}) => {
  const session = await auth();
  const user = session?.user;

  if (user?.role !== Role.SUPPLIER && user?.role !== Role.ADMIN)
    throw new Error("You are not allowed to delete product");

  try {
    await prisma.productSupplier.delete({
      where: {
        id,
      },
    });

    imagesUrl.forEach(async (imageUrl) => {
      const fileName = imageUrl.split("/").pop();
      if (!fileName) {
        throw new Error("Invalid image URL");
      }

      const { error: deleteError } = await supabase.storage
        .from("images")
        .remove([`products/${fileName}`]);

      if (deleteError) {
        throw new Error("Failed to delete image from storage");
      }
    });
  } catch (error) {
    if (error instanceof Error)
      throw new Error("Failed to delete product" + error.message);
  }

  revalidatePath("/supplier/view-products");
};

export async function editProduct(
  prevState: any,
  formData: FormData
): Promise<EditProductForm> {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const images = formData.getAll("images") as any;
  const city = formData.get("city") as string;
  const productSupplierId = formData.get("productSupplierId") as string;
  const country = formData.get("country") as string;
  const region = formData.get("region") as string;
  const countryCode = formData.get("countryCode") as string;
  const currencySymbol = formData.get("currencySymbol") as string;

  const session = await auth();
  const user = session?.user;

  const { success, data, error } = editProductFormSchema.safeParse({
    name,
    price,
    description,
    images,
    city,
    country,
    region,
    productSupplierId,
    countryCode,
    currencySymbol,
  });

  if (!success) {
    return {
      ...initialEditProductFormState,
      productSupplierId:
        error.flatten().fieldErrors.productSupplierId?.[0] ?? "",
      name: error.flatten().fieldErrors.name?.[0] ?? "",
      price: error.flatten().fieldErrors.price?.[0] ?? "",
      description: error.flatten().fieldErrors.description?.[0] ?? "",
      images: error.flatten().fieldErrors.images?.[0] ?? "",
      city: error.flatten().fieldErrors.city?.[0] ?? "",
      country: error.flatten().fieldErrors.country?.[0] ?? "",
      region: error.flatten().fieldErrors.region?.[0] ?? "",
      countryCode: error.flatten().fieldErrors.countryCode?.[0] ?? "",
      currencySymbol: error.flatten().fieldErrors.currencySymbol?.[0] ?? "",
    };
  }

  // check if the database values are the same as the form values
  const productSupplier = await prisma.productSupplier.findFirst({
    where: {
      id: productSupplierId,
    },
    include: {
      product: true,
    },
  });

  const imageUrlToBase64 = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  };

  const base64Images = await Promise.all(
    productSupplier?.images.map(async (imageUrl: string) => {
      return await imageUrlToBase64(imageUrl);
    }) || []
  );

  const imageData = images.map((image: any) => {
    const parsedImage = JSON.parse(image);
    return parsedImage.data;
  });

  // if values are the same, return
  if (
    productSupplier?.product.name === name &&
    productSupplier?.price === parseFloat(price) &&
    productSupplier?.description === description &&
    productSupplier?.city === city &&
    productSupplier?.country === country &&
    productSupplier?.region === region &&
    productSupplier?.supplierId === user?.id &&
    arraysAreEqualUnordered(imageData, base64Images)
  ) {
    return {
      ...initialEditProductFormState,
      db: "No changes were made.",
    };
  }


  const existingProductSupplier = await prisma.productSupplier.findFirst({
    where: {
      product: {
        id: productSupplier?.productId,
      },
      city,
      country,
      region,
      supplierId: user?.id!,
      id: {
        not: productSupplierId,
      },
    },
  });

  if (existingProductSupplier) {
    return {
      ...initialEditProductFormState,
      db: "A similar product in that location already exists.",
    };
  }

  const imageBuffers = images.map((image: any) => {
    const parsedImage = JSON.parse(image);
    return Buffer.from(parsedImage.data, "base64");
  });

  try {
    // delete existing images first
    const existingImages = productSupplier?.images || [];
    const newImages = images || [];

    // Find images that exist in existingImages but not in newImages
    const imagesToDelete = existingImages.filter(
      (img: string) => !newImages.includes(img)
    );

    await Promise.all(
      imagesToDelete?.map(async (imageUrl: string) => {
        const fileName = imageUrl.split("/").pop();
        if (!fileName) console.warn(`Skipping invalid image URL: ${imageUrl}`);

        const { error: deleteError } = await supabase.storage
          .from("images")
          .remove([`products/${productSupplier?.product.name}/${fileName}`]);
        if (deleteError) {
          console.error(
            `Failed to delete image ${fileName}: ${deleteError.message}`
          );
        }
      }) || []
    );
    // upload new images
    const folderName = `products/${name}`;
    const imageUrls = await Promise.all(
      imageBuffers.map(async (imageBuffer: any) => {
        const fileName = `${folderName}/${Date.now()}_${Math.random()}.jpeg`;
        const { data: imageData, error } = await supabase.storage
          .from("images")
          .upload(fileName, imageBuffer, {
            contentType: "image/jpeg",
          });

        if (error) throw error;

        return getSupabasePublicUrl(imageData.fullPath);
      })
    );

    // Check if product exists, if not create it
    const product = await prisma.product.findUnique({
      where: {
        name,
      },
    });

    let productId = product?.id;

    if (!product) {
      const { id } = await prisma.product.create({
        data: {
          name,
        },
      });

      productId = id;
      // Check that there is no supplier linking to the previous product, if so delete the product
      const productSupplierCount = await prisma.productSupplier.count({
        where: {
          productId: productSupplier?.productId,
        },
      });

      if (productSupplierCount === 0) {
        await prisma.product.delete({
          where: {
            id: productSupplier?.productId,
          },
        });
      }
    }

    // Update the product supplier record
    await prisma.productSupplier.update({
      where: {
        id: productSupplierId,
      },
      data: {
        price: parseFloat(data.price),
        description: data.description,
        images: imageUrls,
        city: data.city,
        country: data.country,
        region: data.region,
        supplierId: user?.id!,
        productId,
        countryCode: data.countryCode,
        currencySymbol: data.currencySymbol,
      },
    });

    revalidatePath("/");

    return {
      ...initialEditProductFormState,
      db: "success",
    };
  } catch (error) {
    console.error(error);
    return {
      ...initialEditProductFormState,
      db:
        "Error updating product: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}

export const sendMessage = async (message: string) => {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return "Ask me anything about your poultry farm, for example flock health, feeding, vaccination, water management, housing, egg production, or broiler growth.";
  }

  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are KukuSmart AI, an autonomous poultry advisor for small and medium poultry farms. Answer with practical, step-by-step guidance for poultry only: broilers, layers, chicks, feed, water, housing, vaccination, biosecurity, mortality reduction, egg production, and sales timing. If a question is outside poultry, briefly say you can only help with poultry farm operations.\n\nFarmer question: " +
                normalizedMessage,
            },
          ],
        },
      ],
    });
    return getModelText(response);
  } catch (error) {
    throw new Error(
      "Failed to send message: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};

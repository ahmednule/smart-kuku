"use server";

import { auth } from "@/auth";
import { FlockType, Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { initialFarmSetupState, type FarmSetupState } from "./state";

const farmSetupSchema = z.object({
  farmName: z.string().trim().min(2, "Farm name is required"),
  county: z.string().trim().min(2, "County is required"),
  subCounty: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  preferredLanguage: z.enum(["en-KE", "sw-KE"]),
  locationText: z.string().trim().optional().default(""),
  flockType: z.nativeEnum(FlockType),
  birdCount: z.coerce
    .number({ message: "Bird count is required" })
    .int("Bird count must be a whole number")
    .min(1, "Bird count must be at least 1")
    .max(500000, "Bird count is too large"),
});

export const submitFarmOnboarding = async (
  _prevState: FarmSetupState,
  formData: FormData
): Promise<FarmSetupState> => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== Role.FARMER) {
    return {
      ...initialFarmSetupState,
      db: "You must be logged in as a farmer to continue.",
    };
  }

  const parsed = farmSetupSchema.safeParse({
    farmName: formData.get("farmName"),
    county: formData.get("county"),
    subCounty: formData.get("subCounty"),
    phone: formData.get("phone"),
    preferredLanguage: formData.get("preferredLanguage"),
    locationText: formData.get("locationText"),
    flockType: formData.get("flockType"),
    birdCount: formData.get("birdCount"),
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();

    return {
      ...initialFarmSetupState,
      farmName: fieldErrors.farmName?.[0] || "",
      county: fieldErrors.county?.[0] || "",
      subCounty: fieldErrors.subCounty?.[0] || "",
      phone: fieldErrors.phone?.[0] || "",
      preferredLanguage: fieldErrors.preferredLanguage?.[0] || "",
      locationText: fieldErrors.locationText?.[0] || "",
      flockType: fieldErrors.flockType?.[0] || "",
      birdCount: fieldErrors.birdCount?.[0] || "",
      db: "Please correct the highlighted fields.",
    };
  }

  const values = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.farmer.upsert({
        where: { id: session.user.id },
        update: {
          county: values.county,
          subCounty: values.subCounty || null,
          phone: values.phone || null,
          preferredLanguage: values.preferredLanguage,
        },
        create: {
          id: session.user.id,
          county: values.county,
          subCounty: values.subCounty || null,
          phone: values.phone || null,
          preferredLanguage: values.preferredLanguage,
        },
      });

      const firstFarm = await tx.farm.findFirst({
        where: { farmerId: session.user.id },
        orderBy: { createdAt: "asc" },
        include: {
          flocks: true,
        },
      });

      if (!firstFarm) {
        const createdFarm = await tx.farm.create({
          data: {
            farmerId: session.user.id,
            name: values.farmName,
            locationText: values.locationText || `${values.subCounty || values.county}, ${values.county}`,
          },
        });

        await tx.flock.create({
          data: {
            farmId: createdFarm.id,
            name: `${values.flockType.toLowerCase()} starter flock`,
            type: values.flockType,
            initialBirdCount: values.birdCount,
            currentBirdCount: values.birdCount,
          },
        });

        return;
      }

      if (!firstFarm.locationText && values.locationText) {
        await tx.farm.update({
          where: { id: firstFarm.id },
          data: { locationText: values.locationText },
        });
      }

      if (firstFarm.flocks.length === 0) {
        await tx.flock.create({
          data: {
            farmId: firstFarm.id,
            name: `${values.flockType.toLowerCase()} starter flock`,
            type: values.flockType,
            initialBirdCount: values.birdCount,
            currentBirdCount: values.birdCount,
          },
        });
      }
    });

    revalidatePath("/farmer/dashboard");
    revalidatePath("/profile");
    revalidatePath("/map");

    return {
      ...initialFarmSetupState,
      db: "success",
    };
  } catch {
    return {
      ...initialFarmSetupState,
      db: "Unable to save your farm setup right now. Please try again.",
    };
  }
};
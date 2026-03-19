import { auth } from "@/auth";
import MobileNav from "@/components/ui/MobileNav";
import ModalUI from "@/components/ui/ModalUI";
import SectionHeader from "@/components/ui/SectionHeader";
import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { getServerSupabase, SUPABASE_IMAGES_BUCKET } from "@/lib/supabase";
import Image from "next/image";
import { notFound } from "next/navigation";

const extractMainPoints = (description: string) => {
  const cleaned = description
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const points = cleaned
    .filter((line) =>
      /^(Description|Damage|Control|Treatment|Cause|Symptoms|Impact)\b/i.test(
        line
      )
    )
    .slice(0, 4);

  if (points.length > 0) return points;

  return cleaned.slice(0, 3);
};

const normalizeScanImageUrl = (url: string) =>
  url.replace(
    "/storage/v1/object/public/images/images/",
    "/storage/v1/object/public/images/"
  );

const getObjectPathFromStorageUrl = (url: string) => {
  const normalized = normalizeScanImageUrl(url);

  try {
    const parsed = new URL(normalized);
    const publicPrefix = `/storage/v1/object/public/${SUPABASE_IMAGES_BUCKET}/`;
    const signedPrefix = `/storage/v1/object/sign/${SUPABASE_IMAGES_BUCKET}/`;

    if (parsed.pathname.includes(publicPrefix)) {
      return parsed.pathname.split(publicPrefix)[1] || "";
    }

    if (parsed.pathname.includes(signedPrefix)) {
      return parsed.pathname.split(signedPrefix)[1] || "";
    }
  } catch {
    // Non-URL strings are returned as-is after best-effort normalization below.
  }

  return normalized
    .replace(/^\/+/, "")
    .replace(`${SUPABASE_IMAGES_BUCKET}/`, "");
};

const FarmerScanHistoryPage = async () => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== Role.FARMER) notFound();

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      scan: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const scans = customer?.scan ?? [];
  const supabase = getServerSupabase();
  const scansWithImageUrl = await Promise.all(
    scans.map(async (scan) => {
      const objectPath = getObjectPathFromStorageUrl(scan.url);

      if (!objectPath) {
        return {
          ...scan,
          imageUrl: normalizeScanImageUrl(scan.url),
        };
      }

      const { data, error } = await supabase.storage
        .from(SUPABASE_IMAGES_BUCKET)
        .createSignedUrl(objectPath, 60 * 60 * 24);

      return {
        ...scan,
        imageUrl:
          !error && data?.signedUrl
            ? data.signedUrl
            : normalizeScanImageUrl(scan.url),
      };
    })
  );

  const totalScans = scans.length;
  const pestScans = scans.filter((scan) => scan.type === "PEST").length;
  const diseaseScans = scans.filter((scan) => scan.type === "DISEASE").length;

  const nameCount = scans.reduce<Record<string, number>>((acc, scan) => {
    acc[scan.name] = (acc[scan.name] ?? 0) + 1;
    return acc;
  }, {});

  const topFindings = Object.entries(nameCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <section className="space-y-8">
      <MobileNav />

      <div>
        <SectionHeader as="h1" className="m-0">
          Scan History
        </SectionHeader>
        <p className="mt-3 text-emerald-800 max-w-3xl">
          Track every scan result and use this summary to spot recurring risks
          across your flock.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-emerald-900">Summary Of Main Points</h2>
        {totalScans === 0 ? (
          <p className="text-emerald-700">No scans yet. Start a farm check to build your history.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">
                Total scans: <span className="font-bold">{totalScans}</span>
              </p>
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">
                Pest scans: <span className="font-bold">{pestScans}</span>
              </p>
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">
                Disease scans: <span className="font-bold">{diseaseScans}</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-2">Top findings</p>
              {topFindings.length === 0 ? (
                <p className="text-sm text-emerald-700">No dominant pattern yet.</p>
              ) : (
                <ul className="space-y-1 text-sm text-emerald-800">
                  {topFindings.map(([name, count]) => (
                    <li key={name}>
                      {name}: <span className="font-semibold">{count}</span> occurrence
                      {count !== 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      <div>
        <ModalUI />
      </div>

      {totalScans > 0 && (
        <div className="space-y-4">
          {scansWithImageUrl.map((scan) => {
            const points = extractMainPoints(scan.description);
            return (
              <article
                key={scan.id}
                className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border border-emerald-100">
                    <Image
                      src={scan.imageUrl}
                      alt={scan.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-emerald-900">{scan.name}</h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        {scan.type}
                      </span>
                      <span className="text-xs text-emerald-700">
                        {new Date(scan.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-emerald-900">Main points from this scan</p>
                    <ul className="list-disc pl-5 text-sm text-emerald-800 space-y-1">
                      {points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FarmerScanHistoryPage;
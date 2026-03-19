import { auth } from "@/auth";
import MobileNav from "@/components/ui/MobileNav";
import { MetricSource, Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type DailyCollectionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DailyCollectionsPage = async ({ searchParams }: DailyCollectionsPageProps) => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== Role.FARMER) notFound();

  const params = searchParams ? await searchParams : {};
  const isSaved = params.saved === "1";

  const farms = await prisma.farm.findMany({
    where: { farmerId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      flocks: {
        select: {
          id: true,
          name: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const recentLogs = await prisma.farmMetric.findMany({
    where: {
      farm: {
        farmerId: session.user.id,
      },
    },
    include: {
      farm: {
        select: { name: true },
      },
      flock: {
        select: { name: true },
      },
    },
    orderBy: { recordedAt: "desc" },
    take: 12,
  });

  const createDailyCollection = async (formData: FormData) => {
    "use server";

    const currentSession = await auth();
    if (!currentSession?.user?.id || currentSession.user.role !== Role.FARMER) notFound();

    const farmId = String(formData.get("farmId") || "").trim();
    const flockIdRaw = String(formData.get("flockId") || "").trim();
    const eggsCollectedRaw = String(formData.get("eggsCollected") || "").trim();
    const feedKgRaw = String(formData.get("feedKg") || "").trim();
    const waterLitersRaw = String(formData.get("waterLiters") || "").trim();
    const mortalityCountRaw = String(formData.get("mortalityCount") || "").trim();
    const notesRaw = String(formData.get("notes") || "").trim();

    if (!farmId) {
      redirect("/farmer/daily-collections?saved=0");
    }

    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        farmerId: currentSession.user.id,
      },
      select: { id: true },
    });

    if (!farm) {
      redirect("/farmer/daily-collections?saved=0");
    }

    const eggsCollected = eggsCollectedRaw ? Number(eggsCollectedRaw) : null;
    const feedKg = feedKgRaw ? Number(feedKgRaw) : null;
    const waterLiters = waterLitersRaw ? Number(waterLitersRaw) : null;
    const mortalityCount = mortalityCountRaw ? Number(mortalityCountRaw) : null;

    await prisma.farmMetric.create({
      data: {
        farmId,
        flockId: flockIdRaw || null,
        eggsCollected,
        feedKg,
        waterLiters,
        mortalityCount,
        notes: notesRaw || null,
        source: MetricSource.MANUAL,
      },
    });

    revalidatePath("/farmer/daily-collections");
    redirect("/farmer/daily-collections?saved=1");
  };

  return (
    <section className="space-y-8">
      <MobileNav />

      <div>
        <h1 className="text-3xl font-bold text-emerald-900">Daily Collections</h1>
        <p className="mt-2 text-emerald-700 max-w-3xl">
          Log eggs, feed, water, and mortality daily. This data will power the AI profitability
          assistant so it can show whether your farm is improving or making losses over time.
        </p>
      </div>

      {isSaved && (
        <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800">
          Daily collection saved successfully.
        </p>
      )}

      {farms.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">No farm found yet.</p>
          <p className="mt-2">
            Complete onboarding first so we can attach daily collection records to your farm.
          </p>
        </div>
      ) : (
        <form action={createDailyCollection} className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-emerald-900">
              Farm
              <select
                name="farmId"
                defaultValue={farms[0].id}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-emerald-900">
              Flock (optional)
              <select
                name="flockId"
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
              >
                <option value="">All flocks / Not specific</option>
                {farms.flatMap((farm) =>
                  farm.flocks.map((flock) => (
                    <option key={flock.id} value={flock.id}>
                      {farm.name} - {flock.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium text-emerald-900">
              Eggs collected
              <input
                type="number"
                name="eggsCollected"
                min={0}
                required
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
                placeholder="e.g. 320"
              />
            </label>

            <label className="text-sm font-medium text-emerald-900">
              Feed used (kg)
              <input
                type="number"
                step="0.1"
                min={0}
                name="feedKg"
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
                placeholder="e.g. 45"
              />
            </label>

            <label className="text-sm font-medium text-emerald-900">
              Water used (L)
              <input
                type="number"
                step="0.1"
                min={0}
                name="waterLiters"
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
                placeholder="e.g. 210"
              />
            </label>

            <label className="text-sm font-medium text-emerald-900">
              Mortality count
              <input
                type="number"
                min={0}
                name="mortalityCount"
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
                placeholder="e.g. 2"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-emerald-900 block">
            Notes (optional)
            <textarea
              name="notes"
              rows={3}
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
              placeholder="Any observation for today..."
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
          >
            Save daily collection
          </button>
        </form>
      )}

      <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-emerald-900">Recent entries</h2>
        {recentLogs.length === 0 ? (
          <p className="mt-3 text-emerald-700">No daily records yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-emerald-800">
                <tr className="border-b border-emerald-100">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Farm</th>
                  <th className="py-2 pr-4">Flock</th>
                  <th className="py-2 pr-4">Eggs</th>
                  <th className="py-2 pr-4">Feed (kg)</th>
                  <th className="py-2 pr-4">Water (L)</th>
                  <th className="py-2 pr-4">Mortality</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-emerald-50 text-emerald-700">
                    <td className="py-2 pr-4">{new Date(log.recordedAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{log.farm.name}</td>
                    <td className="py-2 pr-4">{log.flock?.name || "-"}</td>
                    <td className="py-2 pr-4">{log.eggsCollected ?? "-"}</td>
                    <td className="py-2 pr-4">{log.feedKg ?? "-"}</td>
                    <td className="py-2 pr-4">{log.waterLiters ?? "-"}</td>
                    <td className="py-2 pr-4">{log.mortalityCount ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default DailyCollectionsPage;

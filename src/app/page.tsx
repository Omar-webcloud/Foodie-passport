"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toPng } from "html-to-image";
import {
  ArrowDownToLine,
  BadgeCheck,
  Download,
  MapPinned,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import { districts } from "@/data/districts";
import useFoodPassportStore from "@/store/useFoodPassportStore";

const divisionOptions = ["All", ...new Set(districts.map((district) => district.division))];

function getFoodKey(districtId: string, foodId: string) {
  return `${districtId}:${foodId}`;
}

function getDistrictProgress(district: typeof districts[number], triedFoods: Record<string, boolean>) {
  const total = district.foods.length;
  const done = district.foods.filter((food) => triedFoods[getFoodKey(district.id, food.id)]).length;

  if (done === 0) return { total, done, color: "#d6d3d1", status: "Not explored" };
  if (done < total) return { total, done, color: "#f59e0b", status: "Partially explored" };
  return { total, done, color: "#10b981", status: "Fully explored" };
}

const DynamicDistrictMap = dynamic(() => import("@/components/DistrictMap"), {
  ssr: false,
  loading: () => <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-sm text-slate-500">Loading map…</div>,
});

export default function Home() {
  const {
    triedFoods,
    selectedDistrictId,
    setSelectedDistrictId,
    toggleFood,
    resetProgress,
    exportProgress,
    importProgress,
  } = useFoodPassportStore();

  const [query, setQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [isImporting, setIsImporting] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const selectedDistrict = districts.find((district) => district.id === (selectedDistrictId ?? districts[0].id)) ?? districts[0];

  const filteredDistricts = useMemo(() => {
    return districts.filter((district) => {
      const matchesQuery = district.name.toLowerCase().includes(query.toLowerCase()) || district.banglaName.includes(query);
      const matchesDivision = divisionFilter === "All" || district.division === divisionFilter;
      return matchesQuery && matchesDivision;
    });
  }, [query, divisionFilter]);

  const totalFoods = districts.reduce((sum, district) => sum + district.foods.length, 0);
  const totalTried = Object.keys(triedFoods).length;
  const exploredDistricts = new Set(
    districts
      .filter((district) => district.foods.some((food) => triedFoods[getFoodKey(district.id, food.id)]))
      .map((district) => district.id),
  ).size;
  const overallPercentage = totalFoods > 0 ? Math.round((totalTried / totalFoods) * 100) : 0;

  const recentDiscoveries = useMemo(() => {
    return districts
      .flatMap((district) =>
        district.foods
          .filter((food) => triedFoods[getFoodKey(district.id, food.id)])
          .map((food) => ({ district, food })),
      )
      .slice(-5)
      .reverse();
  }, [triedFoods]);

  const achievements = [
    {
      title: "First Bite",
      description: "Try your first regional food.",
      earned: totalTried >= 1,
    },
    {
      title: "Food Explorer",
      description: "Try 10 foods.",
      earned: totalTried >= 10,
    },
    {
      title: "District Discoverer",
      description: "Explore 5 districts.",
      earned: exploredDistricts >= 5,
    },
    {
      title: "Halfway Foodie",
      description: "Complete 50% of the catalog.",
      earned: totalFoods > 0 && totalTried >= totalFoods * 0.5,
    },
    {
      title: "Bangladesh Food Master",
      description: "Try every food in the catalog.",
      earned: totalTried >= totalFoods,
    },
  ];

  const handleDownloadCard = async () => {
    if (!shareRef.current) return;

    const dataUrl = await toPng(shareRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.download = "foodie-passport-card.png";
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const shareText = `I have tasted ${totalTried} of Bangladesh&apos;s regional food experiences.`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Foodie Passport",
          text: shareText,
          url: typeof window !== "undefined" ? window.location.href : "",
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareText);
        } catch {
          // Ignore share/clipboard failures gracefully to avoid surfacing a runtime error.
        }
      }
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "foodie-passport-progress.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const success = importProgress(content);
      if (!success) {
        window.alert("Selected file is not valid Foodie Passport progress JSON.");
      }
    } catch {
      window.alert("Unable to read that file.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf3,_#f8fafc_40%,_#eef2ff_100%)] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-passport backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Bangladesh Food Passport
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Discover Bangladesh, One Bite at a Time.</h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Export JSON
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
              </label>
              <button
                onClick={() => {
                  if (window.confirm("Reset your saved food passport progress?")) {
                    resetProgress();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                Reset progress
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-passport md:p-5">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">District map</p>
                <h2 className="text-2xl font-bold text-slate-900">Food exploration map</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {exploredDistricts} districts explored
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {totalTried} foods tasted
                </div>
              </div>
            </div>
            <DynamicDistrictMap selectedDistrictId={selectedDistrictId} setSelectedDistrictId={setSelectedDistrictId} triedFoods={triedFoods} />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-passport md:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Explore district</p>
                <h2 className="text-2xl font-bold text-slate-900">{selectedDistrict.name}</h2>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {getDistrictProgress(selectedDistrict, triedFoods).status}
              </div>
            </div>

            <div className="mb-5 space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">District</p>
                <p className="mt-2 text-sm text-slate-700">{selectedDistrict.banglaName}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{selectedDistrict.division}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{selectedDistrict.intro}</p>
              </div>

              <div className="space-y-3">
                {selectedDistrict.foods.map((food) => {
                  const checked = Boolean(triedFoods[getFoodKey(selectedDistrict.id, food.id)]);
                  return (
                    <label
                      key={food.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                        checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFood(selectedDistrict.id, food.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-800">{food.name}</span>
                          {checked && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{food.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-passport">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Passport dashboard</p>
                <h2 className="text-2xl font-bold text-slate-900">Your food journey</h2>
              </div>
              <MapPinned className="h-5 w-5 text-amber-500" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Foods tried</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalTried}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Districts explored</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{exploredDistricts}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Catalog size</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalFoods}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Completion</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{overallPercentage}%</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>Progress</span>
                <span>{overallPercentage}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500" style={{ width: `${overallPercentage}%` }} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Recent discoveries</h3>
              {recentDiscoveries.length === 0 ? (
                <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">No foods marked as tried yet. Start with a district and check off a flavour.</p>
              ) : (
                recentDiscoveries.map(({ district, food }) => (
                  <div key={`${district.id}-${food.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold text-slate-800">{food.name}</p>
                      <p className="text-sm text-slate-500">{district.name}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Saved</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-passport">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">District search</p>
                <h2 className="text-2xl font-bold text-slate-900">Browse the map</h2>
              </div>
              <Search className="h-5 w-5 text-slate-500" />
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search districts or Bengali names"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-amber-300 focus:bg-white"
                />
              </div>
              <select
                value={divisionFilter}
                onChange={(event) => setDivisionFilter(event.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-300 focus:bg-white"
              >
                {divisionOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {filteredDistricts.map((district) => {
                const progress = getDistrictProgress(district, triedFoods);
                const isSelected = selectedDistrict.id === district.id;
                return (
                  <button
                    key={district.id}
                    onClick={() => setSelectedDistrictId(district.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                      isSelected ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{district.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{district.division}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">{progress.done}/{progress.total}</p>
                      <div className="mt-1 h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(progress.done / progress.total) * 100}%`, backgroundColor: progress.color }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-passport">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Achievements</p>
                <h2 className="text-2xl font-bold text-slate-900">Milestones</h2>
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.title}
                  className={`rounded-2xl border p-4 ${
                    achievement.earned ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-800">{achievement.title}</span>
                    {achievement.earned ? <BadgeCheck className="h-5 w-5 text-emerald-600" /> : <Trophy className="h-5 w-5 text-slate-400" />}
                  </div>
                  <p className="text-sm text-slate-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-passport">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Shareable card</p>
                <h2 className="text-2xl font-bold text-slate-900">Foodie Passport card</h2>
              </div>
              <Share2 className="h-5 w-5 text-amber-500" />
            </div>

            <div className="space-y-3">
              <div ref={shareRef} className="rounded-[28px] bg-gradient-to-br from-amber-100 via-red-50 to-emerald-50 p-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Foodie Passport</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">Bangladesh Food Passport</h3>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {overallPercentage}% complete
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <p className="text-xl font-bold text-slate-800">I have tasted {totalTried} of Bangladesh&apos;s regional food experiences.</p>
                  <p className="text-sm text-slate-600">{exploredDistricts} of 64 districts explored.</p>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                    <p className="mt-1 text-base font-bold text-slate-800">{totalTried} foods tasted</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{overallPercentage}%</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadCard}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mx-auto mt-4 max-w-7xl pb-2 text-center text-xs text-slate-500">
        <span>Developed by Mohammad Omar</span>
        <span className="mx-2">•</span>
        <a href="https://omar-webcloud.vercel.app/" target="_blank" rel="noreferrer" className="font-medium text-slate-700 underline underline-offset-2">
          Contact
        </a>
      </footer>
    </main>
  );
}

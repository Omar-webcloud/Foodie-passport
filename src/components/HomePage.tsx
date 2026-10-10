"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  BookUser,
  ChevronDown,
  Download,
  Facebook,
  Link,
  MapPinned,
  MessageCircle,
  Search,
  Share2,
  Trash2,
  Trophy,
} from "lucide-react";

import DistrictProgressMap from "@/components/DistrictProgressMap";
import { districts } from "@/data/districts";
import { createPassportCardSvg, loadEmblemDataUrl, renderPassportCardPng } from "@/lib/passport-card-image";
import { sharePreviewVersion } from "@/lib/share-progress";
import { siteOrigin } from "@/lib/site";
import useFoodPassportStore from "@/store/useFoodPassportStore";

const divisionOptions = ["All", ...new Set(districts.map((district) => district.division))];

/**
 * Returns true when running inside a Facebook, Instagram, Messenger, or
 * similar in-app WebView that blocks blob: URL downloads and <a download>.
 */
function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Messenger|FB_IAB|FBIOS|MicroMessenger|WebView/.test(ua);
}

/** Converts a Blob to a base64 data URL string. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read blob."));
    reader.readAsDataURL(blob);
  });
}

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

export default function Home() {
  const {
    triedFoods,
    selectedDistrictId,
    setSelectedDistrictId,
    toggleFood,
    resetProgress,
  } = useFoodPassportStore();

  const [query, setQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [isDistrictListOpen, setIsDistrictListOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [shareOrigin, setShareOrigin] = useState(siteOrigin);
  const shareModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setShareOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const dialog = shareModalRef.current;
    if (!dialog) return;

    if (isShareModalOpen && !dialog.open) dialog.showModal();
    if (!isShareModalOpen && dialog.open) dialog.close();
  }, [isShareModalOpen]);

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
  const coveredDistrictIds = new Set(
    districts
      .filter((district) => district.foods.some((food) => triedFoods[getFoodKey(district.id, food.id)]))
      .map((district) => district.id),
  );
  const exploredDistricts = coveredDistrictIds.size;
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
    if (isDownloadingCard) return;

    setIsDownloadingCard(true);
    setDownloadStatus("");

    try {
      if (isInAppBrowser()) {
        // In-app WebViews block blob: URLs and <a download>.
        // Instead, build the URL to our server-side download route.
        // The server sends Content-Disposition: attachment, prompting a native download
        // or forcing the WebView to hand it off to the external browser.
        const url = new URL("/api/download", shareOrigin);
        url.searchParams.set("foods", String(totalTried));
        url.searchParams.set("covered", [...coveredDistrictIds].join(","));
        window.location.href = url.toString();
        
        // Keep button disabled briefly to avoid spamming
        setTimeout(() => setIsDownloadingCard(false), 2000);
        return;
      }

      const svgMarkup = createPassportCardSvg({
        foodsTried: totalTried,
        districtsExplored: exploredDistricts,
        totalFoods,
        coveredDistrictIds,
        emblemDataUrl: await loadEmblemDataUrl(),
      });
      const imageBlob = await renderPassportCardPng(svgMarkup);
      const dataUrl = await blobToDataUrl(imageBlob);

      // Standard browsers: trigger a direct download via <a download>.
      const link = document.createElement("a");
      link.download = "foodie-passport-card.png";
      link.href = dataUrl;
      link.click();
      setDownloadStatus("Passport image downloaded.");
      setIsDownloadingCard(false);
    } catch (error) {
      console.error("Unable to create the food passport image.", error);
      setDownloadStatus("Could not create the image. Please try again.");
      setIsDownloadingCard(false);
    }
  };

  const getShareUrl = () => {
    const url = new URL("/share", shareOrigin);
    url.searchParams.set("foods", String(totalTried));
    url.searchParams.set("covered", [...coveredDistrictIds].join(","));
    url.searchParams.set("card", sharePreviewVersion);
    return url.toString();
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setShareStatus("Share link copied.");
    } catch {
      setShareStatus("Unable to copy the link. Try sharing with Facebook or WhatsApp.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-passport-gold/40 to-transparent" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                <BookUser className="h-3.5 w-3.5" />
                Bangladesh Food Passport
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Taste the Flavours of Bangladesh.</h1>
              <p className="mt-2 text-sm text-slate-500">Track every regional dish across all 64 districts.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (window.confirm("Reset your saved food passport progress?")) {
                    resetProgress();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <Trash2 className="h-4 w-4" />
                Reset progress
              </button>
            </div>
          </div>
        </header>

        <section>
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Explore district</p>
                <h2 className="mt-0.5 text-2xl font-black text-slate-900">{selectedDistrict.name}</h2>
              </div>
              <div className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                getDistrictProgress(selectedDistrict, triedFoods).status === "Fully explored"
                  ? "bg-emerald-50 text-emerald-700"
                  : getDistrictProgress(selectedDistrict, triedFoods).status === "Partially explored"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {getDistrictProgress(selectedDistrict, triedFoods).status}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-700">Find another district</p>
                <button
                  type="button"
                  aria-expanded={isDistrictListOpen}
                  aria-controls="district-list"
                  onClick={() => setIsDistrictListOpen((isOpen) => !isOpen)}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white sm:gap-2 sm:text-sm"
                >
                  {isDistrictListOpen ? "Hide" : "Show"} 64 districts
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDistrictListOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onFocus={() => setIsDistrictListOpen(true)}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search districts or Bengali names"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-amber-300 focus:bg-white"
                  />
                </div>
                <select
                  aria-label="Filter districts by division"
                  value={divisionFilter}
                  onChange={(event) => setDivisionFilter(event.target.value)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-300 focus:bg-white"
                >
                  {divisionOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {isDistrictListOpen && (
                <div id="district-list" className="mt-3 border-t border-slate-100 pt-3">
                  <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
                    {filteredDistricts.map((district) => {
                      const progress = getDistrictProgress(district, triedFoods);
                      const isSelected = selectedDistrict.id === district.id;
                      return (
                        <button
                          key={district.id}
                          onClick={() => {
                            setSelectedDistrictId(district.id);
                            setIsDistrictListOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                            isSelected
                              ? "border-amber-300 bg-amber-50 ring-1 ring-amber-200"
                              : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{district.name}</p>
                            <p lang="bn" className="font-bengali text-sm text-slate-500">{district.banglaName}</p>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{district.division}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-400">{progress.done}/{progress.total}</p>
                            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(progress.done / progress.total) * 100}%`, backgroundColor: progress.color }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {filteredDistricts.length === 0 && (
                      <p className="py-4 text-center text-sm text-slate-500">No districts match your search.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-5 space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-[#fdf8f0] to-[#f8f4ee] p-4 ring-1 ring-amber-200/60">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-passport-gold">District info</p>
                <p lang="bn" className="font-bengali mt-2 text-base font-semibold text-slate-700">{selectedDistrict.banglaName}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{selectedDistrict.division}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{selectedDistrict.intro}</p>
              </div>

              <div className="space-y-3">
                {selectedDistrict.foods.map((food) => {
                  const checked = Boolean(triedFoods[getFoodKey(selectedDistrict.id, food.id)]);
                  return (
                    <label
                      key={food.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                        checked ? "border-emerald-200 bg-emerald-50/70" : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFood(selectedDistrict.id, food.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span lang="bn" className="font-bengali font-bold text-slate-800">{food.banglaName}</span>
                            <p className="text-xs text-slate-400">{food.name}</p>
                          </div>
                          {checked && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{food.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Passport dashboard</p>
                <h2 className="mt-0.5 text-2xl font-black text-slate-900">Your food journey</h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                <MapPinned className="h-4 w-4 text-passport-gold" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-black/5">
                <p className="text-xs font-medium text-slate-500">Foods tried</p>
                <p className="mt-2 text-3xl font-black text-amber-800">{totalTried}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 ring-1 ring-black/5">
                <p className="text-xs font-medium text-slate-500">Districts explored</p>
                <p className="mt-2 text-3xl font-black text-emerald-800">{exploredDistricts}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 ring-1 ring-black/5">
                <p className="text-xs font-medium text-slate-500">Catalog size</p>
                <p className="mt-2 text-3xl font-black text-slate-700">{totalFoods}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-4 ring-1 ring-black/5">
                <p className="text-xs font-medium text-slate-500">Completion</p>
                <p className="mt-2 text-3xl font-black text-violet-800">{overallPercentage}%</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500">Overall progress</span>
                <span className="font-bold text-slate-700">{overallPercentage}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-passport-gold via-amber-400 to-emerald-500 transition-all duration-700" style={{ width: `${overallPercentage}%` }} />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Recent discoveries</h3>
              {recentDiscoveries.length === 0 ? (
                <p className="rounded-2xl bg-gradient-to-br from-[#fdf8f0] to-[#f8f4ee] p-4 text-sm text-amber-700 ring-1 ring-amber-200/60">No foods marked yet. Pick a district above and start checking off flavours.</p>
              ) : (
                recentDiscoveries.map(({ district, food }) => (
                  <div key={`${district.id}-${food.id}`} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                    <div>
                      <p lang="bn" className="font-bengali font-bold text-slate-800">{food.banglaName}</p>
                      <p className="text-xs text-slate-400">{food.name} · {district.name}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">✓ Saved</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

        <section className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Achievements</p>
                <h2 className="mt-0.5 text-2xl font-black text-slate-900">Milestones</h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.title}
                  className={`rounded-2xl border p-4 transition ${
                    achievement.earned ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50" : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="font-bold leading-snug text-slate-800">{achievement.title}</span>
                    {achievement.earned ? <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-500" /> : <Trophy className="h-5 w-5 shrink-0 text-slate-300" />}
                  </div>
                  <p className="text-sm text-slate-500">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Shareable card</p>
                <h2 className="mt-0.5 text-2xl font-black text-slate-900">Foodie Passport card</h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50">
                <Share2 className="h-4 w-4 text-passport-gold" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-amber-50 via-white to-emerald-50/30 p-5 shadow-inner ring-1 ring-amber-100">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src="/Bangladesh_Passport_Emblem.png"
                      alt="Bangladesh passport emblem"
                      width={48}
                      height={48}
                      unoptimized
                      className="h-11 w-11 shrink-0 rounded-xl object-contain shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-700">Foodie Passport</p>
                      <h3 className="mt-0.5 text-lg font-black leading-tight text-slate-900">Bangladesh Food Passport</h3>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full border border-amber-200/60 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    {overallPercentage}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-base font-bold leading-snug text-slate-800">I have tasted {totalTried} of Bangladesh&apos;s regional food experiences.</p>
                  <p className="mt-1 text-sm text-slate-500">{exploredDistricts} of 64 districts explored.</p>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
                  <DistrictProgressMap coveredDistrictIds={coveredDistrictIds} />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <p className="mt-0.5 font-bold text-slate-800">{totalTried} foods tasted</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{overallPercentage}%</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadCard}
                  disabled={isDownloadingCard}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
                >
                  <Download className="h-4 w-4" />
                  {isDownloadingCard ? "Preparing image…" : "Download PNG"}
                </button>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setShareStatus("");
                    setIsShareModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
              {downloadStatus && <p role="status" aria-live="polite" className="text-sm text-slate-500">{downloadStatus}</p>}
              <dialog
                ref={shareModalRef}
                aria-labelledby="share-modal-title"
                onClose={() => {
                  setIsShareModalOpen(false);
                  setShareStatus("");
                }}
                className="m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
              >
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-passport-gold">Foodie Passport</p>
                      <h3 id="share-modal-title" className="mt-1 text-xl font-black">Share your journey</h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Close share dialog"
                      onClick={() => setIsShareModalOpen(false)}
                      className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">✕</span>
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Share {totalTried} foods tasted across {exploredDistricts} districts. Your public link includes your totals and map, not your item-by-item records.
                  </p>
                  <div className="mt-5 grid gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsShareModalOpen(false)}
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Facebook className="h-5 w-5 text-blue-500" />
                      Share on Facebook
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`I have tasted ${totalTried} of Bangladesh's regional food experiences.\n${getShareUrl()}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsShareModalOpen(false)}
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                    >
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      Share on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      <Link className="h-5 w-5" />
                      Copy share link
                    </button>
                    {shareStatus && <p role="status" aria-live="polite" className="pt-1 text-sm text-slate-500">{shareStatus}</p>}
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </section>
      </div>

      <footer className="mx-auto mt-6 max-w-7xl pb-4 text-center text-xs text-slate-600">
        <span>Developed by Mohammad Omar</span>
        <span className="mx-2">·</span>
        <a href="https://omar-webcloud.vercel.app/" target="_blank" rel="noreferrer" className="font-semibold text-slate-500 underline underline-offset-2 transition hover:text-slate-300">
          Contact
        </a>
      </footer>
    </main>
  );
}

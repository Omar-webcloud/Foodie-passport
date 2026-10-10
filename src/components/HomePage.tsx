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
  const [savedImageDataUrl, setSavedImageDataUrl] = useState("");
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
      const svgMarkup = createPassportCardSvg({
        foodsTried: totalTried,
        districtsExplored: exploredDistricts,
        totalFoods,
        coveredDistrictIds,
        emblemDataUrl: await loadEmblemDataUrl(),
      });
      const imageBlob = await renderPassportCardPng(svgMarkup);
      // Always convert to a data URL — it is compatible with both regular
      // browsers and restrictive WebViews (Facebook, Instagram, Messenger).
      const dataUrl = await blobToDataUrl(imageBlob);

      if (isInAppBrowser()) {
        // In-app WebViews block blob: URLs, <a download>, and window.open().
        // Show the image in an on-page overlay so the user can long-press to save.
        setSavedImageDataUrl(dataUrl);
      } else {
        // Standard browsers: trigger a direct download via <a download>.
        const link = document.createElement("a");
        link.download = "foodie-passport-card.png";
        link.href = dataUrl;
        link.click();
        setDownloadStatus("Passport image downloaded.");
      }
    } catch (error) {
      console.error("Unable to create the food passport image.", error);
      setDownloadStatus("Could not create the image. Please try again.");
    } finally {
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf3,_#f8fafc_40%,_#eef2ff_100%)] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-passport backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                <BookUser className="mr-2 h-3.5 w-3.5" />
                Bangladesh Food Passport
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Taste the Flavours of Bangladesh.</h1>
            </div>

            <div className="flex flex-wrap gap-3">
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

        <section>
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-passport md:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Explore district</p>
                <h2 className="text-2xl font-bold text-slate-900">{selectedDistrict.name}</h2>
              </div>
              <div className="whitespace-nowrap rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700 sm:px-3 sm:text-xs">
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
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white sm:gap-2 sm:px-3 sm:text-sm"
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
                            isSelected ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{district.name}</p>
                            <p lang="bn" className="font-bengali text-sm text-slate-600">{district.banglaName}</p>
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
                    {filteredDistricts.length === 0 && (
                      <p className="py-4 text-center text-sm text-slate-500">No districts match your search.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-5 space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">District</p>
                <p lang="bn" className="font-bengali mt-2 text-sm text-slate-700">{selectedDistrict.banglaName}</p>
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
                          <div>
                            <span lang="bn" className="font-bengali font-semibold text-slate-800">{food.banglaName}</span>
                            <p className="text-sm text-slate-500">{food.name}</p>
                          </div>
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

        <section>
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
                      <p lang="bn" className="font-bengali font-semibold text-slate-800">{food.banglaName}</p>
                      <p className="text-sm text-slate-500">{food.name}</p>
                      <p className="text-sm text-slate-500">{district.name}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Saved</span>
                  </div>
                ))
              )}
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
              <div className="passport-card rounded-[24px] bg-gradient-to-br from-amber-100 via-red-50 to-emerald-50 p-4 shadow-inner sm:rounded-[28px] sm:p-5">
                <div className="passport-card-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="passport-card-brand flex min-w-0 items-center gap-3">
                      <Image
                        src="/Bangladesh_Passport_Emblem.png"
                        alt="Bangladesh passport emblem"
                        width={48}
                        height={48}
                        unoptimized
                        className="passport-card-emblem h-11 w-11 shrink-0 rounded-xl object-contain sm:h-12 sm:w-12"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Foodie Passport</p>
                        <h3 className="passport-card-title mt-1 break-words text-lg font-black leading-tight text-slate-900 sm:text-2xl">Bangladesh Food Passport</h3>
                      </div>
                  </div>
                  <div className="passport-card-completion self-start whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {overallPercentage}% complete
                  </div>
                </div>
                <div className="mt-4 space-y-2 sm:mt-5">
                  <p className="passport-card-tagline break-words text-lg font-bold leading-snug text-slate-800 sm:text-xl">I have tasted {totalTried} of Bangladesh&apos;s regional food experiences.</p>
                  <p className="break-words text-sm leading-relaxed text-slate-600">{exploredDistricts} of 64 districts explored.</p>
                </div>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/60 p-2.5 sm:p-3">
                  <DistrictProgressMap coveredDistrictIds={coveredDistrictIds} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 sm:mt-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
                    <p className="mt-1 text-base font-bold text-slate-800">{totalTried} foods tasted</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{overallPercentage}%</div>
                </div>
              </div>

              <div className="flex flex-wrap items-start gap-3">
                <button
                  onClick={handleDownloadCard}
                  disabled={isDownloadingCard}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
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
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
              {downloadStatus && <p role="status" aria-live="polite" className="text-sm text-slate-600">{downloadStatus}</p>}
              <dialog
                ref={shareModalRef}
                aria-labelledby="share-modal-title"
                onClose={() => {
                  setIsShareModalOpen(false);
                  setShareStatus("");
                }}
                className="m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55"
              >
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Foodie Passport</p>
                      <h3 id="share-modal-title" className="mt-1 text-xl font-bold">Share your journey</h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Close share dialog"
                      onClick={() => setIsShareModalOpen(false)}
                      className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      <span aria-hidden="true" className="text-xl leading-none">×</span>
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
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                      Share on Facebook
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`I have tasted ${totalTried} of Bangladesh's regional food experiences.\n${getShareUrl()}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsShareModalOpen(false)}
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100"
                    >
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      Share on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                    >
                      <Link className="h-5 w-5" />
                      Copy share link
                    </button>
                    {shareStatus && <p role="status" aria-live="polite" className="pt-1 text-sm text-slate-600">{shareStatus}</p>}
                  </div>
                </div>
              </dialog>
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

      {/* In-app browser save overlay — shown instead of a blocked download */}
      {savedImageDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Save your passport image"
          className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto bg-slate-950/95 px-4 py-8"
        >
          <div className="w-full max-w-sm rounded-3xl bg-slate-800 p-5 shadow-2xl">
            <p className="mb-1 text-center text-lg font-bold text-white">Save your Passport</p>
            <p className="mb-4 text-center text-sm text-slate-300">
              📱 <strong>Long-press the image</strong> below, then tap <strong>Save Image</strong> to download it to your phone.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={savedImageDataUrl}
              alt="Your Foodie Passport card"
              className="w-full rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setSavedImageDataUrl("")}
              className="mt-4 w-full rounded-full bg-slate-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

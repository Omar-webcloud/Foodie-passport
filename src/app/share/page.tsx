import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import DistrictProgressMap from "@/components/DistrictProgressMap";
import { siteOrigin } from "@/lib/site";
import { parseShareProgress, sharePreviewVersion } from "@/lib/share-progress";

type SharePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const { foods, coveredDistrictIds } = parseShareProgress(params);
  const imageUrl = new URL("/api/og", siteOrigin);
  imageUrl.searchParams.set("foods", String(foods));
  imageUrl.searchParams.set("covered", [...coveredDistrictIds].join(","));
  imageUrl.searchParams.set("card", sharePreviewVersion);
  const shareUrl = new URL("/share", siteOrigin);
  shareUrl.searchParams.set("foods", String(foods));
  shareUrl.searchParams.set("covered", [...coveredDistrictIds].join(","));
  shareUrl.searchParams.set("card", sharePreviewVersion);
  const title = `My Bangladesh Food Passport — ${foods} foods tasted`;
  const description = `${coveredDistrictIds.size} of 64 districts explored. See my Bangladesh food journey.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteOrigin}/share` },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: shareUrl.toString(),
      siteName: "Foodie Passport",
      type: "website",
      images: [{ url: imageUrl.toString(), width: 1200, height: 1500, alt: `Food passport: ${foods} foods and ${coveredDistrictIds.size} districts explored` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl.toString()],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const { foods, coveredDistrictIds, totalFoods } = parseShareProgress(await searchParams);
  const percentage = Math.round((foods / totalFoods) * 100);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#FFFFFF,_#F5EBDD_40%,_#E5DCCE_100%)] px-4 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-passport md:p-10">
        <div className="flex items-center gap-3">
          <Image
            src="/Bangladesh_Passport_Emblem.png"
            alt="Bangladesh passport emblem"
            width={52}
            height={52}
            unoptimized
            className="h-14 w-14 rounded-xl object-contain"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Foodie Passport</p>
        </div>
        <h1 className="mt-3 text-3xl font-black md:text-5xl">Taste the Flavours of Bangladesh.</h1>
        <p className="mt-4 text-lg text-slate-600">I have tasted {foods} of Bangladesh&apos;s regional food experiences.</p>
        <p className="mt-1 text-slate-600">{coveredDistrictIds.size} of 64 districts explored · {percentage}% of {totalFoods} foods</p>
        <div className="mt-8 rounded-2xl bg-emerald-50 p-4">
          <DistrictProgressMap coveredDistrictIds={coveredDistrictIds} />
        </div>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          Explore your own food passport
        </Link>
      </article>
    </main>
  );
}

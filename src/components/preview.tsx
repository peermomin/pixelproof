"use client";

import type { MouseEvent } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ReviewIssue } from "@/lib/pixelproof";

export function Preview({ pageId, pageName, pageUrl, viewport, issues, selectedId, onSelect, onAdd, screenshotAssetId }: { pageId: string; pageName: string; pageUrl: string; viewport: "Desktop" | "Mobile"; issues: ReviewIssue[]; selectedId: string; onSelect: (id: string) => void; onAdd: (event: MouseEvent<HTMLDivElement>) => void; screenshotAssetId?: string }) {
  const collection = pageId === "collection";
  const product = pageId === "product";
  const story = pageId === "story";
  const title = collection ? "Find your" : product ? "A little green" : story ? "Grown with" : "Make room";
  const second = collection ? "kind of green." : product ? "goes a long way." : story ? "care, always." : "to grow.";
  const eyebrow = collection ? "A PLANT FOR EVERY SPACE" : product ? "A CUSTOMER FAVORITE" : story ? "ROOTED IN GOOD THINGS" : "A LITTLE MORE GREEN";
  const cta = collection ? "Explore the collection" : product ? "Add to your space" : story ? "Meet our little team" : "Find your plant";
  const openIssues = issues.filter((issue) => issue.status === "Open");
  const previewWidth = viewport === "Mobile" ? "w-[350px] max-w-full" : "w-full max-w-[850px]";
  const contentLayout = viewport === "Mobile" ? "min-h-[310px] grid-cols-[1.1fr_.9fr] px-3" : "min-h-[325px] grid-cols-2";

  return (
    <div className="grid-bg relative flex min-h-[405px] items-start justify-center overflow-hidden p-3 sm:min-h-[440px] sm:p-6">
      <div onClick={onAdd} className={`relative overflow-hidden rounded-lg border border-[#30343e] bg-white text-[#182315] shadow-2xl shadow-black/40 transition-all duration-300 ${previewWidth}`}>
        <BrowserChrome url={pageUrl} />
        {screenshotAssetId ? <img src={`/api/assets/${screenshotAssetId}`} alt={`${pageName} review screenshot`} className="block h-auto max-h-[70vh] w-full object-contain" /> : <>
        <StorefrontHeader />
        <div className={`grid items-center gap-2 px-4 py-5 sm:px-10 sm:py-8 ${contentLayout}`}>
          <div className="relative z-[2] py-3">
            <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#e9f1df] px-2 py-1 text-[7px] font-bold uppercase tracking-[.13em] text-[#526b3a] sm:text-[8px]">
              <Sparkles size={10} /> {eyebrow}
            </span>
            <h2 className="max-w-[270px] text-[clamp(23px,4vw,42px)] font-semibold leading-[.98] tracking-[-.065em]">
              {title}<br /><span className="font-serif font-normal italic text-[#5d7846]">{second}</span>
            </h2>
            <p className="mt-3 max-w-[205px] text-[8px] leading-relaxed text-[#64695f] sm:mt-4 sm:text-[10px]">
              Thoughtful plants and everything you need to help them thrive.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#263a26] px-3 py-2 text-[8px] font-medium text-white sm:mt-5 sm:px-4 sm:text-[9px]">
              {cta} <ArrowUpRight size={11} />
            </span>
            <div className="mt-4 flex items-center gap-1.5 text-[7px] text-[#85897f]">
              <span className="flex text-[#c89542]">★★★★★</span> 4.9 from 2,400+ happy homes
            </div>
          </div>
          <PlantIllustration />
        </div>
        <div className="flex items-center justify-center gap-3 border-t border-[#e9e9e2] py-2 text-[6px] font-medium text-[#777e70] sm:gap-10 sm:py-3 sm:text-[8px]">
          <span>✳ PLANTS THAT FEEL LIKE HOME</span>
          <span className="hidden sm:inline">✳ FREE SHIPPING OVER $60</span>
          <span>✳ GROW AT YOUR OWN PACE</span>
        </div>
        </>}
        {openIssues.map((issue, index) => (
          <button
            key={issue.id}
            aria-label={`Feedback ${index + 1}: ${issue.title}`}
            onClick={(event) => { event.stopPropagation(); onSelect(issue.id); }}
            style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
            className={`absolute z-10 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-[#151812] shadow-lg transition hover:scale-110 ${selectedId === issue.id ? "bg-[#f1b761] ring-4 ring-[#f1b76155]" : "bg-[#c4f36b]"}`}
          >
            {index + 1}
          </button>
        ))}
        <span className="sr-only">{pageName} {screenshotAssetId ? "screenshot" : "sample preview"}. Open the website in a new tab to view the actual page.</span>
      </div>
    </div>
  );
}

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex h-8 items-center gap-1.5 border-b border-[#e9e9e7] bg-[#fafaf8] px-3">
      <span className="h-2 w-2 rounded-full bg-[#f17e76]" />
      <span className="h-2 w-2 rounded-full bg-[#f1c66d]" />
      <span className="h-2 w-2 rounded-full bg-[#79ca88]" />
      <div className="mx-auto flex h-[19px] w-[48%] items-center justify-center truncate rounded bg-[#efefed] px-2 text-[8px] tracking-wide text-[#8d9089]">
        {url.replace(/^https?:\/\//, "")}
      </div>
    </div>
  );
}

function StorefrontHeader() {
  return (
    <div className="flex h-[42px] items-center justify-between border-b border-[#e9e9e2] px-4 sm:px-8">
      <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[-.04em] sm:text-[13px]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#c4f36b] text-[9px]">s</span> sprout
      </div>
      <div className="hidden items-center gap-4 text-[8px] font-medium text-[#62695d] sm:flex">
        <span>Shop all</span><span>Our story</span><span>Journal</span>
      </div>
      <span className="rounded-full border border-[#d7dacf] px-2.5 py-1 text-[8px] font-semibold">Your bag (0)</span>
    </div>
  );
}

function PlantIllustration() {
  return (
    <div className="relative mx-auto aspect-[.83] w-full max-w-[220px] overflow-hidden rounded-[100px_100px_14px_14px] bg-[#e8e8dd]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_28%,#f5f1df_0%,transparent_58%),linear-gradient(145deg,#d5ddc5,#b9c2a4)]" />
      <div className="absolute left-[45%] top-[26%] h-[39%] w-[3px] rotate-[15deg] rounded-full bg-[#405d37]" />
      <div className="absolute left-[26%] top-[29%] h-[37%] w-[26%] rotate-[-28deg] rounded-[100%_0_100%_0] bg-gradient-to-br from-[#77945d] to-[#405d37] shadow-[inset_-8px_-4px_12px_#253f2855]" />
      <div className="absolute left-[47%] top-[17%] h-[34%] w-[25%] rotate-[25deg] rounded-[0_100%_0_100%] bg-gradient-to-tr from-[#708b59] to-[#a2b383] shadow-[inset_7px_-5px_10px_#36512c44]" />
      <div className="absolute left-[31%] top-[15%] h-[24%] w-[22%] rotate-[-25deg] rounded-[100%_0_100%_0] bg-gradient-to-br from-[#a1b882] to-[#567747]" />
      <div className="absolute left-[25%] top-[61%] h-[6%] w-[52%] rounded-[50%] bg-[#28312433] blur-md" />
      <div className="absolute left-[28%] top-[57%] h-[27%] w-[45%] rounded-b-[35%] rounded-t-[10%] bg-gradient-to-r from-[#bf7950] via-[#d69668] to-[#ab6948] shadow-[inset_9px_0_13px_#8e513833]" />
      <div className="absolute left-[31%] top-[57%] h-[4%] w-[39%] rounded-full bg-[#e4ae7a]" />
    </div>
  );
}

"use client";

import { Check, MessageCircle } from "lucide-react";
import type { ReviewIssue } from "@/lib/pixelproof";

export function IssueRow({ issue, selected, onSelect }: { issue: ReviewIssue; selected: boolean; onSelect: () => void }) {
  const dot = issue.priority === "High" ? "bg-[#ed897e]" : issue.priority === "Medium" ? "bg-[#e9bc6e]" : "bg-[#8c95a5]";
  const statusStyle = issue.status === "Resolved" ? "bg-[#263524] text-[#bfe986]" : "bg-[#352a1e] text-[#e4b568]";
  const titleStyle = issue.status === "Resolved" ? "text-[#9da39d] line-through" : "text-[#e3e5e9]";

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full border-b border-[#22252d] px-4 py-3.5 text-left transition hover:bg-[#161920] ${selected ? "bg-[#181b22]" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-md text-[10px] font-semibold ${statusStyle}`}>
          {issue.status === "Resolved" ? <Check size={12} /> : issue.priority === "High" ? "!" : "•"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate text-[11px] font-medium ${titleStyle}`}>{issue.title}</span>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          </div>
          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#7e8592]">
            {issue.description || "No extra details provided."}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="rounded bg-[#22262e] px-1.5 py-0.5 text-[9px] text-[#aeb3bd]">{issue.category}</span>
            <span className="text-[9px] text-[#626975]">·</span>
            <span className="text-[9px] text-[#777e89]">{issue.priority} priority</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] text-[#737a87]">
              <MessageCircle size={10} /> {issue.comments.length}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

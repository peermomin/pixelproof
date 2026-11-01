"use client";

import type { FormEvent } from "react";
import { ArrowLeft, Check, Pencil, Send, Trash2, X } from "lucide-react";
import type { ReviewIssue } from "@/lib/pixelproof";
import { formatDate, initials } from "@/lib/format";

export function IssueDetail({ issue, close, onEdit, onToggle, onDelete, comment, setComment, onComment }: { issue: ReviewIssue; close: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void; comment: string; setComment: (value: string) => void; onComment: (event: FormEvent<HTMLFormElement>) => void }) {
  const priorityClass = issue.priority === "High"
    ? "bg-[#392421] text-[#f39c91]"
    : issue.priority === "Medium"
      ? "bg-[#352d1e] text-[#edc274]"
      : "bg-[#252a32] text-[#aeb6c3]";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/45" onClick={close}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Feedback details"
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[410px] flex-col border-l border-[#343944] bg-[#11141a] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#242832] px-5 py-4">
          <span className="text-[11px] font-medium text-[#858c99]">Feedback details</span>
          <div className="flex items-center gap-2">
            <button aria-label="Edit feedback" onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-lg text-[#858c99] hover:bg-[#20242c] hover:text-white"><Pencil size={15} /></button>
            <button aria-label="Delete feedback" onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-lg text-[#858c99] hover:bg-[#20242c] hover:text-[#ef827a]"><Trash2 size={15} /></button>
            <button aria-label="Close details" onClick={close} className="grid h-8 w-8 place-items-center rounded-lg text-[#858c99] hover:bg-[#20242c]"><X size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded bg-[#22262e] px-2 py-1 text-[10px] text-[#b8bec8]">{issue.category}</span>
            <span className={`rounded px-2 py-1 text-[10px] ${priorityClass}`}>{issue.priority} priority</span>
          </div>
          <h2 className="text-lg font-semibold leading-snug tracking-tight">{issue.title}</h2>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-[#9ca3af]">{issue.description || "No additional details."}</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-[#737a87]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#39485c] text-[8px] font-semibold text-white">{initials(issue.author)}</span>
            {issue.author}<span>·</span>{formatDate(issue.createdAt)}
          </div>
          <button onClick={onToggle} className={`mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold ${issue.status === "Open" ? "bg-[#c4f36b] text-[#171b11] hover:bg-[#d1f98b]" : "border border-[#343944] text-[#d4d6dc] hover:bg-[#20242c]"}`}>
            {issue.status === "Open" ? <><Check size={14} /> Mark resolved</> : <><ArrowLeft size={14} /> Reopen issue</>}
          </button>

          <div className="mt-7">
            <h3 className="mb-3 text-[11px] font-semibold text-[#dfe2e8]">Activity <span className="ml-1 text-[#737a87]">{issue.comments.length}</span></h3>
            {issue.comments.length ? (
              <div className="space-y-4">
                {issue.comments.map((entry) => (
                  <div key={entry.id} className="flex gap-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#74564e] text-[8px] font-semibold text-white">{initials(entry.author)}</span>
                    <div>
                      <div className="flex items-center gap-2 text-[10px]"><b className="text-[#cdd1d8]">{entry.author}</b><span className="text-[#737a87]">{formatDate(entry.createdAt)}</span></div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#9ca3af]">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-[10px] text-[#777f8e]">No comments yet. Add context or discuss a fix below.</p>}
          </div>
        </div>

        <form onSubmit={onComment} className="border-t border-[#242832] p-4">
          <label htmlFor="comment-input" className="mb-2 block text-[10px] text-[#858c99]">Add a comment</label>
          <div className="flex gap-2">
            <input id="comment-input" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a note…" className="form-input" />
            <button aria-label="Send comment" disabled={!comment.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#c4f36b] text-[#171b11] hover:bg-[#d1f98b] disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /></button>
          </div>
        </form>
      </aside>
    </div>
  );
}

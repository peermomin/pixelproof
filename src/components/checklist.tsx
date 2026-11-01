"use client";

import type { FormEvent } from "react";
import { Check, Plus } from "lucide-react";
import type { ChecklistItem } from "@/lib/pixelproof";

export function ChecklistView({ items, done, draft, setDraft, adding, setAdding, onToggle, onRemove, onAdd }: { items: ChecklistItem[]; done: number; draft: string; setDraft: (value: string) => void; adding: boolean; setAdding: (value: boolean) => void; onToggle: (item: ChecklistItem) => void; onRemove: (id: string) => void; onAdd: (event: FormEvent<HTMLFormElement>) => void }) {
  const progress = items.length ? (done / items.length) * 100 : 0;

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-[#242832] bg-[#11141a]">
      <div className="border-b border-[#242832] p-5 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Release checklist</h2>
            <p className="mt-1 text-[11px] text-[#858c99]">Small checks that help a good build feel finished.</p>
          </div>
          <span className="rounded-full border border-[#28342a] bg-[#172019] px-2.5 py-1 text-[10px] text-[#b8e881]">
            {done} / {items.length} complete
          </span>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#282c34]">
          <div className="h-full rounded-full bg-[#c4f36b] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="divide-y divide-[#22252d]">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-[#858c99]">Your checklist is empty. Add a check when you’re ready.</p>
        ) : items.map((item) => (
          <div key={item.id} className="group flex items-center gap-3 px-5 py-4 hover:bg-[#15181f] md:px-7">
            <button
              aria-label={`${item.complete ? "Uncheck" : "Complete"}: ${item.label}`}
              aria-pressed={item.complete}
              onClick={() => onToggle(item)}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${item.complete ? "border-[#c4f36b] bg-[#c4f36b] text-[#182315]" : "border-[#454b57] text-transparent hover:border-[#c4f36b]"}`}
            >
              <Check size={13} />
            </button>
            <span className={`flex-1 text-xs ${item.complete ? "text-[#838a94] line-through" : "text-[#d8dbe1]"}`}>
              {item.label}
            </span>
            <button
              aria-label={`Remove ${item.label}`}
              onClick={() => onRemove(item.id)}
              className="text-[10px] text-[#737a87] opacity-0 transition hover:text-[#e98e83] group-hover:opacity-100 group-focus-within:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="p-5 md:px-7">
        {adding ? (
          <form onSubmit={onAdd} className="flex gap-2">
            <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a checklist item" className="form-input" />
            <button className="rounded-lg bg-[#c4f36b] px-3 text-xs font-semibold text-[#171b11]">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-lg px-2 text-xs text-[#858c99]">Cancel</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-xs text-[#aab0bb] hover:text-[#c4f36b]">
            <Plus size={14} /> Add checklist item
          </button>
        )}
      </div>
    </section>
  );
}

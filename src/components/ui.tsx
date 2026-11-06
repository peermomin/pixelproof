"use client";

import type { ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export function RailButton({ children, label, active, onClick }: { children: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-xl transition hover:bg-[#20242c] hover:text-white ${active ? "bg-[#20242c] text-[#c4f36b]" : ""}`}
    >
      {children}
    </button>
  );
}

export function Metric({ icon: Icon, label, value, meta, accent }: { icon: LucideIcon; label: string; value: string; meta: string; accent: string }) {
  return (
    <div className="rounded-xl border border-[#242832] bg-[#11141a] p-3.5 md:p-[18px]">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10px] font-medium text-[#858c99] md:text-[11px]">{label}</span>
        <Icon size={15} className={accent} />
      </div>
      <div className="truncate text-[16px] font-semibold tracking-tight md:text-[19px]">{value}</div>
      <div className="mt-1 truncate text-[9px] text-[#707784] md:text-[11px]">{meta}</div>
    </div>
  );
}

export function Modal({ children, title, subtitle, onClose }: { children: ReactNode; title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#343944] bg-[#15181f] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="modal-heading" className="text-sm font-semibold">{title}</h2>
            {subtitle && <p className="mt-1 text-[11px] text-[#858c99]">{subtitle}</p>}
          </div>
          <button aria-label="Close dialog" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-[#858c99] hover:bg-[#242832]">
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-medium text-[#b9bec8]">{label}</span>
      {children}
    </label>
  );
}

export function ModalActions({ onCancel, submit }: { onCancel: () => void; submit: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#292d36] pt-3">
      <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-xs text-[#aab0bb] hover:bg-[#242832]">Cancel</button>
      <button className="rounded-lg bg-[#c4f36b] px-3 py-2 text-xs font-semibold text-[#171b11] hover:bg-[#d1f98b]">{submit}</button>
    </div>
  );
}

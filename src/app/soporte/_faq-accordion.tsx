"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DS, MONO, ACCENT, SURFACE } from "../_legal-chrome";

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={item.q}
            className="rounded-2xl overflow-hidden transition-colors"
            style={{ background: SURFACE, border: `1px solid ${isOpen ? "rgba(204,255,0,0.3)" : "rgba(255,255,255,0.08)"}` }}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
            >
              <span
                className="font-bold text-[14px] sm:text-[15px]"
                style={{ color: isOpen ? ACCENT : "#fff", fontFamily: DS, fontStyle: "normal", letterSpacing: "0.01em" }}
              >
                {item.q}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className="shrink-0 transition-transform duration-300"
                style={{ color: isOpen ? ACCENT : "rgba(255,255,255,0.4)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p
                  className="px-5 pb-5 text-[13px] leading-relaxed whitespace-pre-line"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: MONO }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Ruler, X } from "lucide-react";
import { useRef } from "react";

import { SizeChartBody } from "../Home/SizeChart";

export default function SizeChartModal({
  selectedSize,
}: {
  selectedSize?: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <Ruler className="h-4 w-4" />
        Size Chart
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="size-chart-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-[92vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-3xl border-0 bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4 bg-black px-5 py-5 text-white md:px-8 md:py-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">
              Drapelo
            </p>
            <h2
              id="size-chart-title"
              className="mt-1 font-display text-2xl font-extrabold tracking-wide md:text-3xl"
            >
              JACKET SIZE CHART
            </h2>
            <p className="mt-1 text-sm text-white/60">All measurements in inches</p>
          </div>
          <button
            type="button"
            aria-label="Close size chart"
            onClick={() => dialogRef.current?.close()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 md:p-8">
          <SizeChartBody selectedSize={selectedSize} />
        </div>
      </dialog>
    </>
  );
}
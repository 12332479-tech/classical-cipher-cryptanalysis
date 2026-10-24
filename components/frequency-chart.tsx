"use client"

import { ENGLISH_FREQ, frequencyDistribution } from "@/lib/cryptanalysis"

export function FrequencyChart({ text }: { text: string }) {
  const dist = frequencyDistribution(text)
  const max = Math.max(
    ...dist.map((d) => d.percent),
    ...Object.values(ENGLISH_FREQ),
    1,
  )

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2.5 w-3 rounded-sm bg-primary" />
          Observed
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2.5 w-3 rounded-sm bg-muted-foreground/40" />
          English baseline
        </span>
      </div>
      <div className="flex h-44 items-end gap-[3px]" role="img" aria-label="Letter frequency distribution chart">
        {dist.map((d) => (
          <div key={d.letter} className="group flex flex-1 flex-col items-center justify-end gap-1">
            <div className="relative flex w-full items-end justify-center gap-[1px]">
              <div
                className="w-1/2 rounded-t-sm bg-primary transition-all"
                style={{ height: `${(d.percent / max) * 150}px` }}
                title={`${d.letter}: ${d.percent.toFixed(1)}%`}
              />
              <div
                className="w-1/2 rounded-t-sm bg-muted-foreground/40"
                style={{ height: `${(ENGLISH_FREQ[d.letter] / max) * 150}px` }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{d.letter}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

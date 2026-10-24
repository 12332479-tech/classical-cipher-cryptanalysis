"use client"

import { useMemo, useState } from "react"
import { Crosshair, Sparkles } from "lucide-react"
import { breakCaesar, breakVigenere, indexOfCoincidence } from "@/lib/cryptanalysis"
import { caesar, vigenere } from "@/lib/ciphers"
import { Card, CopyButton, Field, inputClass, textareaClass } from "@/components/ui/primitives"
import { FrequencyChart } from "@/components/frequency-chart"
import { cn } from "@/lib/utils"

// Pre-baked ciphertexts so the demo works instantly.
const CAESAR_SAMPLE = caesar(
  "CRYPTANALYSIS IS THE ART OF BREAKING CODES WITHOUT THE KEY BY STUDYING PATTERNS IN THE CIPHERTEXT",
  7,
).output

const VIGENERE_SAMPLE = vigenere(
  "THE INDEX OF COINCIDENCE REVEALS THE LENGTH OF THE KEYWORD AND THEN FREQUENCY ANALYSIS RECOVERS EACH LETTER OF THE KEY ONE COLUMN AT A TIME UNTIL THE PLAINTEXT EMERGES CLEARLY FROM THE NOISE THIS ATTACK WORKS BECAUSE A REPEATING KEY LEAVES A STATISTICAL FINGERPRINT THAT SURVIVES ENCRYPTION AND BETRAYS THE PERIOD OF THE CIPHER TO A PATIENT ANALYST WHO COUNTS LETTERS CAREFULLY AND COMPARES THEM AGAINST THE EXPECTED SHAPE OF ORDINARY ENGLISH PROSE OVER MANY SENTENCES",
  "CIPHER",
).output

export function CryptanalysisPanel() {
  const [tab, setTab] = useState<"caesar" | "vigenere">("caesar")

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-border bg-secondary p-1">
        {(
          [
            { id: "caesar", label: "Break Caesar" },
            { id: "vigenere", label: "Break Vigenère" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "caesar" ? <CaesarBreaker /> : <VigenereBreaker />}
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  )
}

function CaesarBreaker() {
  const [cipher, setCipher] = useState(CAESAR_SAMPLE)
  const { best, all } = useMemo(() => breakCaesar(cipher), [cipher])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <Field label="Intercepted ciphertext">
          <textarea
            value={cipher}
            onChange={(e) => setCipher(e.target.value)}
            rows={4}
            className={textareaClass}
          />
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Detected shift" value={String(best.shift)} />
          <StatPill label="χ² score" value={best.chi.toFixed(1)} />
          <StatPill label="IoC" value={indexOfCoincidence(cipher).toFixed(3)} />
        </div>
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-4">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Recovered plaintext (shift {best.shift})
          </span>
          <p className="mt-2 break-words font-mono text-sm leading-relaxed text-foreground">{best.text}</p>
          <div className="mt-3">
            <CopyButton value={best.text} />
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Every one of the 25 shifts is tried automatically; each candidate is scored with the chi-squared statistic
          against English letter frequencies. The lowest score is the most English-like decryption.
        </p>
      </Card>

      <Card>
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <Crosshair className="size-3.5" />
          Brute-force ranking (all 25 shifts)
        </span>
        <div className="mt-3 max-h-[360px] space-y-1 overflow-y-auto pr-1">
          {[...all]
            .sort((a, b) => a.chi - b.chi)
            .map((c, i) => (
              <div
                key={c.shift}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-1.5",
                  i === 0 ? "border-primary/50 bg-primary/10" : "border-border/50 bg-secondary/20",
                )}
              >
                <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">shift {c.shift}</span>
                <span className="flex-1 truncate font-mono text-xs text-foreground">{c.text}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{c.chi.toFixed(0)}</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

function VigenereBreaker() {
  const [cipher, setCipher] = useState(VIGENERE_SAMPLE)
  const [forced, setForced] = useState<number | undefined>(undefined)
  const result = useMemo(() => breakVigenere(cipher, forced), [cipher, forced])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Intercepted ciphertext">
            <textarea
              value={cipher}
              onChange={(e) => setCipher(e.target.value)}
              rows={5}
              className={textareaClass}
            />
          </Field>
          <Field label="Key length" hint="auto-detected — override to compare">
            <input
              type="number"
              min={1}
              max={12}
              value={forced ?? result.keyLength}
              onChange={(e) => setForced(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <StatPill label="Recovered key" value={result.key} />
            <StatPill label="IoC" value={indexOfCoincidence(cipher).toFixed(3)} />
          </div>
        </Card>

        <Card>
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Key-length estimation (Index of Coincidence)
          </span>
          <p className="mb-3 mt-1 text-xs text-muted-foreground/80">
            English text has IoC ≈ 0.066. The length whose columns score closest wins.
          </p>
          <div className="space-y-1.5">
            {[...result.candidateLengths]
              .sort((a, b) => b.ioc - a.ioc)
              .slice(0, 8)
              .map((c) => {
                const isBest = c.length === result.keyLength
                return (
                  <div key={c.length} className="flex items-center gap-2">
                    <span className="w-10 shrink-0 font-mono text-[11px] text-muted-foreground">len {c.length}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-sm bg-secondary/40">
                      <div
                        className={cn("h-full rounded-sm", isBest ? "bg-primary" : "bg-muted-foreground/40")}
                        style={{ width: `${Math.min((c.ioc / 0.08) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                      {c.ioc.toFixed(3)}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Recovered plaintext — key &ldquo;{result.key}&rdquo;
          </span>
          <CopyButton value={result.plaintext} />
        </div>
        <p className="mt-2 break-words font-mono text-sm leading-relaxed text-foreground">{result.plaintext}</p>
      </Card>

      <Card>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Frequency analysis of ciphertext
        </span>
        <p className="mb-4 mt-1 text-xs text-muted-foreground/80">
          Polyalphabetic ciphers flatten the frequency curve — the bars look far more uniform than English, which is
          the tell-tale signature that distinguishes Vigenère from a simple substitution.
        </p>
        <FrequencyChart text={cipher} />
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/primitives"
import { cn } from "@/lib/utils"

type Slide = {
  kicker: string
  title: string
  body: React.ReactNode
}

const SLIDES: Slide[] = [
  {
    kicker: "Slide 1 — Title",
    title: "Classical Cipher Cryptanalysis",
    body: (
      <div className="space-y-4">
        <p className="text-lg text-muted-foreground">
          Implementing and breaking Caesar, Vigenère, Playfair, and Hill ciphers.
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>Objective: encrypt/decrypt four classical ciphers and break one via cryptanalysis.</li>
          <li>Deliverables: working implementation, live demo, screenshots, reflection.</li>
          <li>Reference tool: CrypTool 2 (verification) · Live tool: this CipherLab web app.</li>
        </ul>
      </div>
    ),
  },
  {
    kicker: "Slide 2 — The Ciphers",
    title: "Four Classical Schemes",
    body: (
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Caesar", "Monoalphabetic shift. Key = one integer 0–25. 25 possible keys."],
          ["Vigenère", "Polyalphabetic. Repeating keyword shifts each letter. Resists single-frequency attacks."],
          ["Playfair", "Digraph substitution on a 5×5 key square (I/J merged). Encrypts letter pairs."],
          ["Hill", "Linear algebra. 2×2 key matrix multiplies letter vectors mod 26; key must be invertible."],
        ].map(([name, desc]) => (
          <div key={name} className="rounded-lg border border-border bg-secondary/30 p-4">
            <span className="font-mono text-sm font-semibold text-primary">{name}</span>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: "Slide 3 — Attack Methods",
    title: "How We Break Them",
    body: (
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li>
          <span className="font-mono font-semibold text-foreground">Brute force (Caesar): </span>
          only 25 keys — try them all, score each candidate.
        </li>
        <li>
          <span className="font-mono font-semibold text-foreground">Frequency analysis: </span>
          compare letter distribution to English (E, T, A, O … most common).
        </li>
        <li>
          <span className="font-mono font-semibold text-foreground">Chi-squared (χ²): </span>
          numerically ranks how &ldquo;English-like&rdquo; a decryption is — lowest wins.
        </li>
        <li>
          <span className="font-mono font-semibold text-foreground">Index of Coincidence: </span>
          finds the Vigenère key length (English IoC ≈ 0.066).
        </li>
        <li>
          <span className="font-mono font-semibold text-foreground">Per-column solving: </span>
          split ciphertext by key length, solve each column as a Caesar shift.
        </li>
      </ul>
    ),
  },
  {
    kicker: "Slide 4 — Demo & CrypTool 2",
    title: "Live Demo + Verification",
    body: (
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          The <span className="font-mono text-foreground">Workbench</span> tab encrypts/decrypts all four ciphers with
          step-by-step explanations. The <span className="font-mono text-foreground">Cryptanalysis</span> tab breaks
          Caesar and Vigenère automatically from ciphertext alone.
        </p>
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">CrypTool 2 workflow</span>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Drag the Caesar / Vigenère component onto the workspace.</li>
            <li>Feed the same ciphertext used here as input.</li>
            <li>Attach the &ldquo;Frequency Analysis&rdquo; and &ldquo;Analyzer&rdquo; components.</li>
            <li>Confirm CrypTool 2 recovers the identical key and plaintext.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    kicker: "Slide 5 — Takeaways",
    title: "Conclusions",
    body: (
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        <li>Small key spaces (Caesar) fall instantly to brute force.</li>
        <li>Statistics beat guessing — χ² and IoC turn cryptanalysis into measurement.</li>
        <li>Polyalphabetic ciphers only delay, not defeat, frequency analysis.</li>
        <li>None of these are secure today — they motivate modern key sizes and diffusion.</li>
        <li>Understanding classical attacks builds intuition for modern cryptography.</li>
      </ul>
    ),
  },
]

export function SlidesDeck() {
  const [i, setI] = useState(0)
  const slide = SLIDES[i]

  return (
    <div className="space-y-4">
      <Card className="flex min-h-[420px] flex-col">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{slide.kicker}</span>
        <h3 className="mt-2 text-pretty text-2xl font-semibold text-foreground md:text-3xl">{slide.title}</h3>
        <div className="mt-6 flex-1">{slide.body}</div>
      </Card>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> Prev
        </button>

        <div className="flex gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                idx === i ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setI((v) => Math.min(SLIDES.length - 1, v + 1))}
          disabled={i === SLIDES.length - 1}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 font-mono text-xs text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-40"
        >
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

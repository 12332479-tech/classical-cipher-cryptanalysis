"use client"

import { useMemo, useState } from "react"
import { ArrowRight, KeyRound, Lock, Unlock } from "lucide-react"
import {
  type CipherName,
  buildPlayfairMatrix,
  runCipher,
} from "@/lib/ciphers"
import { Card, CopyButton, Field, inputClass, textareaClass } from "@/components/ui/primitives"
import { cn } from "@/lib/utils"

const CIPHERS: {
  id: CipherName
  name: string
  blurb: string
  keyLabel: string
  keyHint: string
  keyPlaceholder: string
  defaultKey: string
  sampleText: string
}[] = [
  {
    id: "caesar",
    name: "Caesar",
    blurb: "Monoalphabetic shift substitution — every letter moves a fixed number of places.",
    keyLabel: "Shift (0–25)",
    keyHint: "integer",
    keyPlaceholder: "3",
    defaultKey: "3",
    sampleText: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
  },
  {
    id: "vigenere",
    name: "Vigenère",
    blurb: "Polyalphabetic cipher using a repeating keyword to shift each letter differently.",
    keyLabel: "Keyword",
    keyHint: "letters only",
    keyPlaceholder: "LEMON",
    defaultKey: "LEMON",
    sampleText: "ATTACK AT DAWN FROM THE NORTH RIDGE",
  },
  {
    id: "playfair",
    name: "Playfair",
    blurb: "Digraph substitution over a 5×5 key square (I/J merged). Encrypts letter pairs.",
    keyLabel: "Keyword",
    keyHint: "builds 5×5 square",
    keyPlaceholder: "MONARCHY",
    defaultKey: "MONARCHY",
    sampleText: "HIDE THE GOLD IN THE TREE STUMP",
  },
  {
    id: "hill",
    name: "Hill",
    blurb: "Linear-algebra cipher: 2×2 key matrix multiplies letter-pair vectors mod 26.",
    keyLabel: "Matrix (a b c d)",
    keyHint: "4 integers",
    keyPlaceholder: "3 3 2 5",
    defaultKey: "3 3 2 5",
    sampleText: "HELP US NOW",
  },
]

export function CipherWorkbench() {
  const [active, setActive] = useState<CipherName>("caesar")
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt")
  const [text, setText] = useState(CIPHERS[0].sampleText)
  const [keys, setKeys] = useState<Record<CipherName, string>>({
    caesar: "3",
    vigenere: "LEMON",
    playfair: "MONARCHY",
    hill: "3 3 2 5",
  })

  const config = CIPHERS.find((c) => c.id === active)!
  const key = keys[active]

  const result = useMemo(
    () => runCipher(active, text, key, mode === "decrypt"),
    [active, text, key, mode],
  )

  const playfairMatrix = active === "playfair" ? buildPlayfairMatrix(key) : null

  function selectCipher(id: CipherName) {
    setActive(id)
    const c = CIPHERS.find((x) => x.id === id)!
    setText(c.sampleText)
    setMode("encrypt")
  }

  return (
    <div className="space-y-6">
      {/* Cipher selector */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CIPHERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCipher(c.id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              active === c.id
                ? "border-primary/60 bg-primary/10"
                : "border-border bg-card hover:border-primary/30 hover:bg-accent/40",
            )}
          >
            <span className="font-mono text-sm font-medium text-foreground">{c.name}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {c.id === "caesar"
                ? "Shift"
                : c.id === "vigenere"
                  ? "Polyalphabetic"
                  : c.id === "playfair"
                    ? "Digraph 5×5"
                    : "Matrix 2×2"}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <p className="text-sm leading-relaxed text-muted-foreground">{config.blurb}</p>

        {/* Mode toggle */}
        <div className="mt-4 inline-flex rounded-lg border border-border bg-secondary p-1">
          {(["encrypt", "decrypt"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "encrypt" ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
              {m}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Input side */}
          <div className="space-y-4">
            <Field label={mode === "encrypt" ? "Plaintext" : "Ciphertext"}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className={textareaClass}
                placeholder="Type your message…"
              />
            </Field>
            <Field label={config.keyLabel} hint={config.keyHint}>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={key}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [active]: e.target.value }))}
                  className={cn(inputClass, "pl-9")}
                  placeholder={config.keyPlaceholder}
                />
              </div>
            </Field>

            {playfairMatrix && (
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Key square</span>
                <div className="mt-2 grid w-fit grid-cols-5 gap-1">
                  {playfairMatrix.map((ch, i) => (
                    <span
                      key={i}
                      className="flex size-8 items-center justify-center rounded border border-border bg-secondary font-mono text-sm text-foreground"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Output side */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {mode === "encrypt" ? "Ciphertext" : "Plaintext"}
              </span>
              <CopyButton value={result.output} />
            </div>
            <div className="min-h-[126px] rounded-md border border-border bg-background/60 p-3">
              <p className="break-words font-mono text-sm leading-relaxed text-primary">
                {result.output || <span className="text-muted-foreground/50">Output appears here…</span>}
              </p>
            </div>
            <div className="rounded-md border border-border/60 bg-secondary/40 p-3">
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <ArrowRight className="size-3" />
                How it works
              </span>
              <ul className="mt-2 space-y-1.5">
                {result.steps.map((s, i) => (
                  <li key={i} className="text-xs leading-relaxed">
                    <span className="font-medium text-foreground">{s.label}: </span>
                    <span className="break-words font-mono text-muted-foreground">{s.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

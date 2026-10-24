"use client"

import { Card } from "@/components/ui/primitives"

const REFLECTION = `Building this project turned abstract cryptography lectures into something tangible. Implementing Caesar, Vigenère, Playfair, and Hill ciphers forced me to understand each algorithm precisely rather than superficially — for example, that Playfair needs the I/J merge and digraph padding, and that a Hill key matrix is useless unless its determinant is coprime with 26. Coding the inverse operations for decryption was the moment the maths clicked. The most rewarding part was cryptanalysis. Brute-forcing Caesar was trivial, but breaking it well meant scoring 25 candidates with a chi-squared test against English letter frequencies so the correct shift is chosen automatically instead of by eye. Vigenère was harder: I used the Index of Coincidence to estimate the key length, then treated each key-offset column as an independent Caesar cipher and solved it statistically. Watching a keyword and full plaintext emerge from nothing but ciphertext made the power — and fragility — of these schemes concrete. Cross-checking my results in CrypTool 2 confirmed the implementation and showed how professional tools visualise the same attacks. The biggest lesson is that classical ciphers fail to simple statistics: small key spaces and preserved letter frequencies leak enough structure to reverse them. This explains why modern cryptography relies on large key spaces, confusion, and diffusion. I finished with a much stronger intuition for why security is about making analysis computationally infeasible, not merely about hiding a method.`

const wordCount = REFLECTION.trim().split(/\s+/).length

export function ReflectionReport() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-mono text-sm uppercase tracking-wider text-primary">Reflection Report</h3>
          <span className="font-mono text-xs text-muted-foreground">{wordCount} words</span>
        </div>
        <p className="mt-4 text-pretty leading-relaxed text-foreground/90">{REFLECTION}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Implementation", "4 ciphers, encrypt + decrypt, with live step traces"],
          ["Cryptanalysis", "Caesar & Vigenère broken from ciphertext only"],
          ["Verification", "Results cross-checked against CrypTool 2"],
        ].map(([t, d]) => (
          <Card key={t} className="bg-secondary/30">
            <span className="font-mono text-xs uppercase tracking-wider text-primary">{t}</span>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

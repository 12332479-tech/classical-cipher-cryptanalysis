"use client"

import { useState } from "react"
import { FileText, KeySquare, Presentation, ShieldAlert, Terminal } from "lucide-react"
import { CipherWorkbench } from "@/components/cipher-workbench"
import { CryptanalysisPanel } from "@/components/cryptanalysis-panel"
import { SlidesDeck } from "@/components/slides-deck"
import { ReflectionReport } from "@/components/reflection-report"
import { cn } from "@/lib/utils"

type Tab = "workbench" | "cryptanalysis" | "slides" | "report"

const TABS: { id: Tab; label: string; icon: typeof Terminal }[] = [
  { id: "workbench", label: "Workbench", icon: KeySquare },
  { id: "cryptanalysis", label: "Cryptanalysis", icon: ShieldAlert },
  { id: "slides", label: "Slides", icon: Presentation },
  { id: "report", label: "Report", icon: FileText },
]

export default function Page() {
  const [tab, setTab] = useState<Tab>("workbench")

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6 md:py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <Terminal className="size-4" />
          CipherLab
        </div>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
          Classical Cipher Cryptanalysis
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Encrypt and decrypt the Caesar, Vigenère, Playfair, and Hill ciphers — then break Caesar and Vigenère
          automatically using frequency analysis, chi-squared scoring, and the Index of Coincidence.
        </p>
      </header>

      {/* Tab navigation */}
      <nav className="sticky top-4 z-10 mb-8 flex flex-wrap gap-1 rounded-xl border border-border bg-card/80 p-1.5 backdrop-blur">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors sm:text-sm",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <section>
        {tab === "workbench" && <CipherWorkbench />}
        {tab === "cryptanalysis" && <CryptanalysisPanel />}
        {tab === "slides" && <SlidesDeck />}
        {tab === "report" && <ReflectionReport />}
      </section>

      <footer className="mt-16 border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          Educational project — classical ciphers are not secure for real use. Verify cryptanalysis results in CrypTool
          2 as instructed by the assignment.
        </p>
      </footer>
    </main>
  )
}

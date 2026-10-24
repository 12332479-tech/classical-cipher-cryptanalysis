// Cryptanalysis toolkit: frequency analysis, Caesar brute-force/auto-break,
// and Vigenere break via Index of Coincidence + chi-squared column solving.
import { caesar, vigenere, onlyLetters } from "./ciphers"

// Standard English letter frequencies (percent).
export const ENGLISH_FREQ: Record<string, number> = {
  A: 8.167, B: 1.492, C: 2.782, D: 4.253, E: 12.702, F: 2.228, G: 2.015,
  H: 6.094, I: 6.966, J: 0.153, K: 0.772, L: 4.025, M: 2.406, N: 6.749,
  O: 7.507, P: 1.929, Q: 0.095, R: 5.987, S: 6.327, T: 9.056, U: 2.758,
  V: 0.978, W: 2.36, X: 0.15, Y: 1.974, Z: 0.074,
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function letterCounts(text: string): Record<string, number> {
  const clean = onlyLetters(text)
  const counts: Record<string, number> = {}
  for (const l of ALPHABET) counts[l] = 0
  for (const ch of clean) counts[ch]++
  return counts
}

export function frequencyDistribution(text: string): { letter: string; count: number; percent: number }[] {
  const counts = letterCounts(text)
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return ALPHABET.map((letter) => ({
    letter,
    count: counts[letter],
    percent: (counts[letter] / total) * 100,
  }))
}

// Chi-squared statistic comparing a text's distribution to English.
export function chiSquared(text: string): number {
  const counts = letterCounts(text)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) return Number.POSITIVE_INFINITY
  let chi = 0
  for (const l of ALPHABET) {
    const expected = (ENGLISH_FREQ[l] / 100) * total
    const diff = counts[l] - expected
    chi += (diff * diff) / (expected || 1e-9)
  }
  return chi
}

// Index of Coincidence.
export function indexOfCoincidence(text: string): number {
  const counts = letterCounts(text)
  const n = Object.values(counts).reduce((a, b) => a + b, 0)
  if (n < 2) return 0
  let sum = 0
  for (const l of ALPHABET) sum += counts[l] * (counts[l] - 1)
  return sum / (n * (n - 1))
}

/* ------------------------------------------------------------------ */
/* Caesar breaking                                                     */
/* ------------------------------------------------------------------ */

export type CaesarCandidate = { shift: number; text: string; chi: number }

export function breakCaesar(ciphertext: string): {
  best: CaesarCandidate
  all: CaesarCandidate[]
} {
  const all: CaesarCandidate[] = []
  for (let shift = 0; shift < 26; shift++) {
    const text = caesar(ciphertext, shift, true).output
    all.push({ shift, text, chi: chiSquared(text) })
  }
  const sorted = [...all].sort((a, b) => a.chi - b.chi)
  return { best: sorted[0], all }
}

/* ------------------------------------------------------------------ */
/* Vigenere breaking                                                   */
/* ------------------------------------------------------------------ */

// Average IoC across columns for an assumed key length.
function avgIoCForKeyLength(text: string, len: number): number {
  const clean = onlyLetters(text)
  let total = 0
  for (let i = 0; i < len; i++) {
    let col = ""
    for (let j = i; j < clean.length; j += len) col += clean[j]
    total += indexOfCoincidence(col)
  }
  return total / len
}

export type KeyLengthScore = { length: number; ioc: number }

export function estimateKeyLengths(text: string, maxLen = 12): KeyLengthScore[] {
  const scores: KeyLengthScore[] = []
  for (let len = 1; len <= maxLen; len++) {
    scores.push({ length: len, ioc: avgIoCForKeyLength(text, len) })
  }
  // English IoC ~0.066; sort by closeness to that target.
  return scores.sort((a, b) => Math.abs(b.ioc - 0.066) - Math.abs(a.ioc - 0.066)).reverse()
}

// For a single column, find the Caesar shift that best matches English.
function bestShiftForColumn(col: string): number {
  let best = 0
  let bestChi = Number.POSITIVE_INFINITY
  for (let shift = 0; shift < 26; shift++) {
    const dec = caesar(col, shift, true).output
    const chi = chiSquared(dec)
    if (chi < bestChi) {
      bestChi = chi
      best = shift
    }
  }
  return best
}

export function recoverVigenereKey(text: string, keyLength: number): string {
  const clean = onlyLetters(text)
  let key = ""
  for (let i = 0; i < keyLength; i++) {
    let col = ""
    for (let j = i; j < clean.length; j += keyLength) col += clean[j]
    key += String.fromCharCode(65 + bestShiftForColumn(col))
  }
  return key
}

export type VigenereBreakResult = {
  keyLength: number
  key: string
  plaintext: string
  candidateLengths: KeyLengthScore[]
}

export function breakVigenere(ciphertext: string, forcedKeyLength?: number): VigenereBreakResult {
  const candidateLengths = estimateKeyLengths(ciphertext)
  const keyLength = forcedKeyLength ?? candidateLengths[0]?.length ?? 1
  const key = recoverVigenereKey(ciphertext, keyLength)
  const plaintext = vigenere(ciphertext, key, true).output
  return { keyLength, key, plaintext, candidateLengths }
}

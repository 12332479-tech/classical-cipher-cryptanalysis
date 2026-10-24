// Classical cipher engine: Caesar, Vigenere, Playfair, Hill (2x2)
// All ciphers operate on A-Z. Non-alphabetic characters are preserved
// where noted. Uppercasing is applied to alphabetic input.

const A = 65 // char code for 'A'

export type StepLog = {
  label: string
  detail: string
}

export type CipherResult = {
  output: string
  steps: StepLog[]
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function onlyLetters(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, "")
}

/* ------------------------------------------------------------------ */
/* Caesar cipher                                                       */
/* ------------------------------------------------------------------ */

export function caesar(text: string, shift: number, decrypt = false): CipherResult {
  const s = mod(decrypt ? -shift : shift, 26)
  let output = ""
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= 65 && code <= 90) {
      output += String.fromCharCode(mod(code - A + s, 26) + A)
    } else if (code >= 97 && code <= 122) {
      output += String.fromCharCode(mod(code - 97 + s, 26) + 97)
    } else {
      output += ch
    }
  }
  return {
    output,
    steps: [
      {
        label: decrypt ? "Decryption shift" : "Encryption shift",
        detail: `Each letter shifted by ${decrypt ? "-" : "+"}${mod(shift, 26)} positions (mod 26).`,
      },
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Vigenere cipher                                                     */
/* ------------------------------------------------------------------ */

export function vigenere(text: string, key: string, decrypt = false): CipherResult {
  const cleanKey = onlyLetters(key)
  if (!cleanKey) return { output: text, steps: [{ label: "Error", detail: "Key must contain letters." }] }
  let output = ""
  let ki = 0
  const shifts: string[] = []
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    const isUpper = code >= 65 && code <= 90
    const isLower = code >= 97 && code <= 122
    if (isUpper || isLower) {
      const base = isUpper ? 65 : 97
      const k = cleanKey.charCodeAt(ki % cleanKey.length) - A
      const shift = decrypt ? -k : k
      output += String.fromCharCode(mod(code - base + shift, 26) + base)
      if (shifts.length < 8) shifts.push(`${ch.toUpperCase()}${decrypt ? "-" : "+"}${cleanKey[ki % cleanKey.length]}(${k})`)
      ki++
    } else {
      output += ch
    }
  }
  return {
    output,
    steps: [
      { label: "Repeating key", detail: `Key "${cleanKey}" repeated across the message.` },
      { label: "Per-letter shift (first 8)", detail: shifts.join("  ") },
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Playfair cipher                                                     */
/* ------------------------------------------------------------------ */

export function buildPlayfairMatrix(key: string): string[] {
  const seen = new Set<string>()
  const matrix: string[] = []
  const source = onlyLetters(key).replace(/J/g, "I") + "ABCDEFGHIKLMNOPQRSTUVWXYZ"
  for (const ch of source) {
    if (!seen.has(ch)) {
      seen.add(ch)
      matrix.push(ch)
    }
  }
  return matrix // length 25
}

function playfairDigraphs(text: string): string[] {
  const clean = onlyLetters(text).replace(/J/g, "I")
  const pairs: string[] = []
  let i = 0
  while (i < clean.length) {
    const a = clean[i]
    let b = clean[i + 1]
    if (!b) {
      pairs.push(a + "X")
      i += 1
    } else if (a === b) {
      pairs.push(a + "X")
      i += 1
    } else {
      pairs.push(a + b)
      i += 2
    }
  }
  return pairs
}

export function playfair(text: string, key: string, decrypt = false): CipherResult {
  const matrix = buildPlayfairMatrix(key)
  const pos = (ch: string) => {
    const idx = matrix.indexOf(ch)
    return { row: Math.floor(idx / 5), col: idx % 5 }
  }
  const pairs = playfairDigraphs(text)
  const shift = decrypt ? 4 : 1 // -1 mod 5 == 4
  let output = ""
  for (const pair of pairs) {
    const p1 = pos(pair[0])
    const p2 = pos(pair[1])
    if (p1.row === p2.row) {
      output += matrix[p1.row * 5 + mod(p1.col + shift, 5)]
      output += matrix[p2.row * 5 + mod(p2.col + shift, 5)]
    } else if (p1.col === p2.col) {
      output += matrix[mod(p1.row + shift, 5) * 5 + p1.col]
      output += matrix[mod(p2.row + shift, 5) * 5 + p2.col]
    } else {
      output += matrix[p1.row * 5 + p2.col]
      output += matrix[p2.row * 5 + p1.col]
    }
  }
  return {
    output,
    steps: [
      { label: "Key matrix", detail: matrix.join("") + " (J merged into I)" },
      { label: "Digraphs", detail: pairs.join(" ") },
      { label: "Rule", detail: "Same row → shift right; same column → shift down; else rectangle swap." },
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Hill cipher (2x2)                                                   */
/* ------------------------------------------------------------------ */

export function parseHillKey(key: string): number[] | null {
  // Accept "a b c d" or "a,b,c,d"
  const nums = key
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((n) => Number.parseInt(n, 10))
  if (nums.length !== 4 || nums.some((n) => Number.isNaN(n))) return null
  return nums.map((n) => mod(n, 26))
}

function det2(m: number[]): number {
  return mod(m[0] * m[3] - m[1] * m[2], 26)
}

function modInverse(a: number, m: number): number | null {
  a = mod(a, m)
  for (let x = 1; x < m; x++) {
    if (mod(a * x, m) === 1) return x
  }
  return null
}

export function hillMatrixIsValid(m: number[]): boolean {
  return modInverse(det2(m), 26) !== null
}

export function invertHillMatrix(m: number[]): number[] | null {
  const det = det2(m)
  const inv = modInverse(det, 26)
  if (inv === null) return null
  // adjugate of [[a,b],[c,d]] = [[d,-b],[-c,a]]
  return [mod(m[3] * inv, 26), mod(-m[1] * inv, 26), mod(-m[2] * inv, 26), mod(m[0] * inv, 26)]
}

export function hill(text: string, key: string, decrypt = false): CipherResult {
  const m = parseHillKey(key)
  if (!m) return { output: "", steps: [{ label: "Error", detail: "Key must be 4 integers, e.g. 3 3 2 5." }] }
  const det = det2(m)
  if (!hillMatrixIsValid(m)) {
    return {
      output: "",
      steps: [
        { label: "Error", detail: `Key matrix is not invertible mod 26 (det=${det}). det must be coprime with 26.` },
      ],
    }
  }
  const useMatrix = decrypt ? invertHillMatrix(m)! : m
  let clean = onlyLetters(text)
  if (clean.length % 2 !== 0) clean += "X" // pad
  let output = ""
  for (let i = 0; i < clean.length; i += 2) {
    const v0 = clean.charCodeAt(i) - A
    const v1 = clean.charCodeAt(i + 1) - A
    const c0 = mod(useMatrix[0] * v0 + useMatrix[1] * v1, 26)
    const c1 = mod(useMatrix[2] * v0 + useMatrix[3] * v1, 26)
    output += String.fromCharCode(c0 + A) + String.fromCharCode(c1 + A)
  }
  return {
    output,
    steps: [
      { label: "Matrix used", detail: `[[${useMatrix[0]}, ${useMatrix[1]}], [${useMatrix[2]}, ${useMatrix[3]}]]` },
      { label: "Determinant", detail: `det = ${det} (mod 26), invertible ✓` },
      { label: "Block size", detail: "Plaintext grouped into 2-letter vectors, padded with X if odd." },
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Unified dispatcher                                                  */
/* ------------------------------------------------------------------ */

export type CipherName = "caesar" | "vigenere" | "playfair" | "hill"

export function runCipher(
  name: CipherName,
  text: string,
  key: string,
  decrypt: boolean,
): CipherResult {
  switch (name) {
    case "caesar":
      return caesar(text, Number.parseInt(key || "0", 10) || 0, decrypt)
    case "vigenere":
      return vigenere(text, key, decrypt)
    case "playfair":
      return playfair(text, key, decrypt)
    case "hill":
      return hill(text, key, decrypt)
  }
}

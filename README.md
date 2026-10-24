# Classical Cipher Cryptanalysis

An interactive Next.js laboratory for exploring classical ciphers and cryptanalysis techniques.

## Features

- Caesar and Vigenere encryption and decryption
- Frequency analysis and cryptanalysis visualizations
- Interactive cipher workbench and presentation material
- TypeScript, React, Next.js, and Tailwind CSS

## How it works

Choose a cipher, enter text and a key, then compare the encrypted or decrypted output in the workbench. The analysis view helps explain frequency patterns and key-length reasoning instead of treating cryptanalysis as a black box.

## Tech stack

Next.js App Router, React, TypeScript, Tailwind CSS, and custom cipher/analysis modules.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Demo checklist

1. Try Caesar encryption with `HELLO` and shift `3`.
2. Try Vigenere encryption with `ATTACKATDAWN` and key `LEMON`.
3. Open the analysis view to inspect the resulting patterns.
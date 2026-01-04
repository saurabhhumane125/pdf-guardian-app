# PDF Guardian

PDF Guardian is a **client-side, privacy-first PDF utility** built to handle common PDF operations directly in the browser — without uploading files to external servers.

The goal of this project is simple:  
**Give users useful PDF tools while keeping their documents private.**

---

## Why this project exists

Most online PDF tools require users to upload sensitive documents to third-party servers.  
That’s fine for throwaway files — but risky for resumes, IDs, contracts, or academic documents.

PDF Guardian explores a safer alternative:
- Perform PDF operations **locally in the browser**
- Minimize or eliminate server-side file handling
- Keep the workflow fast, simple, and transparent

This is **not a commercial replacement** for tools like iLovePDF.  
It’s a technical project focused on **privacy-aware frontend engineering**.

---

## Features

Currently implemented tools include:

- 📄 Merge multiple PDFs
- ✂️ Split PDFs
- 🔄 Rotate PDF pages
- 📉 Compress PDFs
- 🖼️ Add images to PDFs
- 🔁 Reorder PDF pages
- 📤 PDF to Word (experimental)

All processing is designed to happen **client-side** wherever technically feasible.

---

## Tech Stack

- **Vite** – fast development build tool
- **React + TypeScript** – UI and application logic
- **Tailwind CSS** – styling
- **shadcn/ui** – reusable UI components
- **PDF-related JS libraries** – client-side document processing

---

## Privacy Notes (Important)

- PDF Guardian does **not intentionally store user files** on a backend.
- Files are processed in the browser during the session.
- This project does **not claim full cryptographic security or E2EE**.
- The focus is **data minimization**, not legal-grade security guarantees.

If you need compliance-level security, this tool is **not** a substitute.

---

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Setup
```bash
git clone https://github.com/saurabhhumane125/pdf-guardian-app.git
cd pdf-guardian-app
npm install
npm run dev

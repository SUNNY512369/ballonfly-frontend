# Skeletons: Web App

Starting points for the React resume page and the API routes that serve its data and downloads. Build these last, after the user has seen the PDF and DOCX. Keep the web CSS alignment and pt→px conversion rules from the main skill file.

## React Resume Page

`artifacts/<name>/src/pages/resume.tsx` fetches `resume-data.json` through the API and converts its spacing values from points to pixels so the preview matches the PDF.

```tsx
import { useState, useEffect } from "react";

const PT_TO_PX = 96 / 72;

interface ResumeData { /* same interfaces as generation script */ }

function SectionHeader({ title, lineHeightPx }: { title: string; lineHeightPx: number }) {
  return (
    <h2 style={{
      fontSize: "11pt",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      margin: 0,
      padding: 0,
      paddingBottom: "4px",
      marginBottom: `${lineHeightPx}px`,
      borderBottom: "1px solid #1a1a2e",
      color: "#1a1a2e",
    }}>
      {title}
    </h2>
  );
}

export default function ResumePage() {
  const [data, setData] = useState<ResumeData | null>(null);

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL;
    fetch(`${basePath}api/resume-data`)
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  const sp = data.spacing;
  const sectionGapPx = sp.sectionGap * PT_TO_PX;
  const roleGapPx = sp.roleGap * PT_TO_PX;
  const bulletGapPx = sp.bulletGap * PT_TO_PX;
  const lineHeightPx = sp.lineHeight * PT_TO_PX;
  const bodyFontPx = sp.bodyFontSize * PT_TO_PX;

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh" }}>
      <div style={{
        width: "816px", // 8.5in at 96dpi
        minHeight: "1056px", // 11in at 96dpi
        margin: "0 auto",
        background: "#fff",
        padding: "48px", // 0.5in margins at 96dpi
        fontFamily: "'Calibri', 'Arial', sans-serif",
        fontSize: `${bodyFontPx}px`,
        lineHeight: `${lineHeightPx}px`,
      }}>
        {/* Header, summary, experience, skills, education */}
        {/* Use SectionHeader with lineHeightPx for each section */}
        {/* Use spacing values from sp for all gaps */}
      </div>
    </div>
  );
}
```

## API Routes

`artifacts/api-server/src/routes/download.ts` serves the generated PDF, DOCX, and JSON from the script's `output/` directory.

```ts
import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();
const outputDir = path.resolve(import.meta.dirname, "..", "..", "..", "..", "output");

router.get("/download/pdf", (_req, res) => {
  const filePath = path.join(outputDir, "person-name-resume.pdf");
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "PDF not found. Run the generation script first." });
    return;
  }
  res.setHeader("Content-Disposition", "attachment; filename=person-name-resume.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

router.get("/download/docx", (_req, res) => {
  const filePath = path.join(outputDir, "person-name-resume.docx");
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "DOCX not found. Run the generation script first." });
    return;
  }
  res.setHeader("Content-Disposition", "attachment; filename=person-name-resume.docx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.sendFile(filePath);
});

router.get("/resume-data", (_req, res) => {
  const filePath = path.join(outputDir, "resume-data.json");
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Resume data not found. Run the generation script first." });
    return;
  }
  res.json(JSON.parse(fs.readFileSync(filePath, "utf-8")));
});

export default router;
```

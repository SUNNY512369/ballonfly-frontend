# Skeleton: Generation Script

Starting point for `scripts/src/generate-resume-files.ts`, the single source of truth for resume content and layout. It renders the PDF with jsPDF, auto-fits spacing to one US Letter page, builds the DOCX, and writes `resume-data.json` for the web page. Follow the unit rules and auto-fit algorithm in the main skill file.

```ts
import { jsPDF } from "jspdf";
import {
  Document, Packer, Paragraph, TextRun, BorderStyle,
  TabStopPosition, TabStopType, AlignmentType,
} from "docx";
import fs from "fs";
import path from "path";

// --- Interfaces ---
interface ResumeRole {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface Spacing {
  sectionGap: number;
  roleGap: number;
  bulletGap: number;
  lineHeight: number;
  bodyFontSize: number;
  headlineFontSize: number;
}

interface ResumeData {
  name: string;
  headline: string;
  contact: { email: string; phone: string; location: string; linkedin: string; website: string };
  summary: string;
  roles: ResumeRole[];
  skills: { category: string; items: string }[];
  education: { degree: string; school: string; location: string; dates: string }[];
  spacing: Spacing;
}

// --- Constants ---
const PAGE_W = 612; // US Letter width in points
const PAGE_H = 792; // US Letter height in points
const MARGIN = 36; // 0.5 inch margins
const CONTENT_W = PAGE_W - 2 * MARGIN;
const TARGET_Y = PAGE_H - MARGIN;

const BASE_SPACING: Spacing = {
  sectionGap: 8,
  roleGap: 4,
  bulletGap: 1,
  lineHeight: 14,
  bodyFontSize: 11,
  headlineFontSize: 11,
};

// --- Unit converters (DOCX) ---
const ptToHalfPt = (pt: number) => Math.round(pt * 2); // TextRun.size
const ptToTwip = (pt: number) => Math.round(pt * 20); // spacing/margins

// --- Resume data ---
function getResumeData(): Omit<ResumeData, "spacing"> {
  return {
    name: "FULL NAME",
    headline: "Title | Specialty",
    contact: {
      email: "<email@example.com>",
      phone: "",
      location: "City, State",
      linkedin: "linkedin.com/in/handle",
      website: "example.com",
    },
    summary: "Professional summary paragraph.",
    roles: [
      {
        title: "Job Title",
        company: "Company",
        location: "City, State",
        startDate: "MM/YYYY",
        endDate: "Present",
        bullets: ["Achievement or responsibility"],
      },
    ],
    skills: [
      { category: "Category", items: "Skill1, Skill2, Skill3" },
    ],
    education: [
      {
        degree: "Degree",
        school: "University",
        location: "City, Country",
        dates: "YYYY - YYYY",
      },
    ],
  };
}

// --- PDF rendering ---
function renderPDF(doc: jsPDF, data: Omit<ResumeData, "spacing">, spacing: Spacing): number {
  let y = MARGIN;
  const { bodyFontSize, headlineFontSize, lineHeight, sectionGap, roleGap, bulletGap } = spacing;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(data.name, PAGE_W / 2, y, { align: "center" });
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(headlineFontSize);
  doc.text(data.headline, PAGE_W / 2, y, { align: "center" });
  y += lineHeight;

  // Contact line
  const contactParts = [data.contact.location, data.contact.email, data.contact.linkedin, data.contact.website].filter(Boolean);
  doc.setFontSize(9);
  doc.text(contactParts.join(" | "), PAGE_W / 2, y, { align: "center" });
  y += lineHeight + 2;

  // Divider — use lineHeight gap after rule, NOT a small constant
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += lineHeight;

  // Summary
  doc.setFont("helvetica", "normal");
  doc.setFontSize(bodyFontSize);
  const summaryLines = doc.splitTextToSize(data.summary, CONTENT_W) as string[];
  for (const line of summaryLines) {
    doc.text(line, MARGIN, y);
    y += lineHeight;
  }

  // Section header helper
  function renderSectionHeader(title: string) {
    y += sectionGap;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), MARGIN, y);
    y += 3;
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += lineHeight; // full lineHeight after rule
  }

  // Experience, Skills, Education sections...
  // (render each section using the spacing values)

  return y;
}

// --- DOCX rendering ---
function buildDocx(data: Omit<ResumeData, "spacing">, spacing: Spacing): Document {
  const { bodyFontSize, headlineFontSize, lineHeight, sectionGap, roleGap, bulletGap } = spacing;

  // Use ptToHalfPt() for ALL TextRun.size values
  // Use ptToTwip() for ALL spacing.before, spacing.after, margins, page dimensions

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: ptToTwip(PAGE_W), height: ptToTwip(PAGE_H) },
          margin: {
            top: ptToTwip(MARGIN),
            bottom: ptToTwip(MARGIN),
            left: ptToTwip(MARGIN),
            right: ptToTwip(MARGIN),
          },
        },
      },
      children: [
        // Build paragraphs here using the data
      ],
    }],
  });

  return doc;
}

// --- Auto-fit and generate ---
async function main() {
  const data = getResumeData();
  const outputDir = path.resolve(import.meta.dirname, "..", "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Measure with base spacing
  let spacing = { ...BASE_SPACING };
  let doc = new jsPDF({ unit: "pt", format: "letter" });
  let finalY = renderPDF(doc, data, spacing);

  // Auto-fit: distribute slack
  const slack = TARGET_Y - finalY;
  if (slack > 0) {
    const weights = { sectionGap: 3, roleGap: 2, bulletGap: 1, lineHeight: 0.5 };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    // Count occurrences of each spacing type to distribute evenly
    // Adjust spacing values proportionally
  }

  // Final render
  doc = new jsPDF({ unit: "pt", format: "letter" });
  finalY = renderPDF(doc, data, spacing);

  // Write files
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(path.join(outputDir, "person-name-resume.pdf"), pdfBuffer);

  const docxDoc = buildDocx(data, spacing);
  const docxBuffer = await Packer.toBuffer(docxDoc);
  fs.writeFileSync(path.join(outputDir, "person-name-resume.docx"), docxBuffer);

  const jsonData: ResumeData = { ...data, publications: [], spacing };
  fs.writeFileSync(path.join(outputDir, "resume-data.json"), JSON.stringify(jsonData, null, 2));

  console.log("All files generated successfully!");
}

main().catch(console.error);
```

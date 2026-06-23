import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { NormalisedKpi } from "@/lib/normaliseKpi";

// ─── Types mirrored from routes ───────────────────────────────────────────────

type Row = { label: string; value: string; delta?: string; deltaTone?: "up" | "down" | "neutral" };

type Tile = {
  category: string;
  tag: string;
  title: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down";
  desc?: string;
  rows?: Row[];
  footnote?: string;
};

type Section = { sectionTitle: string; tiles: Tile[] };

type Persona = "cxo" | "business" | "technology" | "operations";

// ─── Colour palette ───────────────────────────────────────────────────────────

const TEAL  = [20, 184, 166] as [number, number, number];
const SLATE = [71, 85, 105]  as [number, number, number];
const LIGHT = [241, 245, 249] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const UP_G  = [5, 150, 105]  as [number, number, number];
const DOWN_R= [225, 29, 72]  as [number, number, number];

const PERSONA_ACCENT: Record<Persona, [number, number, number]> = {
  cxo:        [20, 184, 166],
  business:   [16, 185, 129],
  technology: [99, 102, 241],
  operations: [244, 114, 182],
};

const PERSONA_LABEL: Record<Persona, string> = {
  cxo:        "CXO",
  business:   "Business",
  technology: "Technology",
  operations: "Operations",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setTextColor(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function addPage(doc: jsPDF) {
  doc.addPage();
  return 20; // top margin
}

// Header band on every page except cover
function pageHeader(doc: jsPDF, title: string) {
  const w = doc.internal.pageSize.getWidth();
  setFill(doc, TEAL);
  doc.rect(0, 0, w, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(doc, WHITE);
  doc.text("NEXUS OBSERVATORY  ·  PE AI OBSERVABILITY TOWER", 10, 7);
  doc.text(title, w - 10, 7, { align: "right" });
  setTextColor(doc, SLATE);
}

// ─── Cover page ───────────────────────────────────────────────────────────────

function drawCover(doc: jsPDF, contextLabel: string, date: string) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Background
  setFill(doc, [15, 23, 42]);
  doc.rect(0, 0, w, h, "F");

  // Teal accent stripe
  setFill(doc, TEAL);
  doc.rect(0, 0, 6, h, "F");

  // Logo circle
  setFill(doc, TEAL);
  doc.circle(30, 50, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setTextColor(doc, WHITE);
  doc.text("N", 27.5, 54);

  // Title
  doc.setFontSize(28);
  doc.text("Nexus Observatory", 20, 80);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  setTextColor(doc, [148, 163, 184]);
  doc.text("PE AI Observability Tower  ·  Dashboard Report", 20, 93);

  // Divider
  setFill(doc, [30, 41, 59]);
  doc.rect(20, 100, w - 40, 0.5, "F");

  // Metadata
  doc.setFontSize(10);
  setTextColor(doc, [148, 163, 184]);
  doc.text("Generated", 20, 115);
  doc.text("Context", 20, 127);
  doc.text("Scope", 20, 139);

  setTextColor(doc, WHITE);
  doc.setFont("helvetica", "bold");
  doc.text(date, 70, 115);
  doc.text(contextLabel, 70, 127);
  doc.text("Home Dashboard  ·  All Personas  ·  Comparative Analysis", 70, 139);

  // Footer note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor(doc, [71, 85, 105]);
  doc.text("CONFIDENTIAL — For internal use only", 20, h - 20);
  doc.text("© 2026 Nexus Observatory  ·  v4.2.0", w - 20, h - 20, { align: "right" });
}

// ─── Summary KPI strip ────────────────────────────────────────────────────────

type SummaryKpiDef = { label: string; kpiId: string };

function drawSummaryKpis(
  doc: jsPDF,
  y: number,
  defs: SummaryKpiDef[],
  kpis: Record<string, NormalisedKpi>,
) {
  const w = doc.internal.pageSize.getWidth();
  const cols = 3;
  const cellW = (w - 20 - (cols - 1) * 4) / cols;
  const cellH = 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor(doc, SLATE);
  doc.text("PORTFOLIO KPI SUMMARY", 10, y);
  y += 5;

  defs.forEach((def, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 10 + col * (cellW + 4);
    const cy = y + row * (cellH + 3);

    // Card background
    setFill(doc, LIGHT);
    doc.roundedRect(x, cy, cellW, cellH, 2, 2, "F");

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setTextColor(doc, [100, 116, 139]);
    doc.text(def.label.toUpperCase(), x + 4, cy + 7);

    // Value
    const kpi = kpis[def.kpiId];
    const val = kpi && !kpi.isNull ? kpi.display : "—";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setTextColor(doc, [15, 23, 42]);
    doc.text(val, x + 4, cy + 16);
  });

  const rows = Math.ceil(defs.length / cols);
  return y + rows * (cellH + 3) + 6;
}

// ─── Home Dashboard (full home screen view) ───────────────────────────────────

function drawHomeDashboard(
  doc: jsPDF,
  contextLabel: string,
  summaryKpiDefs: SummaryKpiDef[],
  kpis: Record<string, NormalisedKpi>,
  personaSections: Record<Persona, Section[]>,
  tileKpiMap: Record<string, string>,
) {
  let y = addPage(doc);
  pageHeader(doc, "Home Dashboard");

  const w = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── Section heading ──────────────────────────────────────────────────────────
  setFill(doc, TEAL);
  doc.rect(10, y, 4, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setTextColor(doc, [15, 23, 42]);
  doc.text("Home Dashboard", 18, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(doc, [100, 116, 139]);
  doc.text(`Context: ${contextLabel}`, 18, y + 14);
  y += 22;

  // ── Summary KPI strip ────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(doc, [100, 116, 139]);
  doc.text("PORTFOLIO KPI SUMMARY", 10, y);
  y += 4;

  const kpiCols = 3;
  const kpiCellW = (w - 20 - (kpiCols - 1) * 4) / kpiCols;
  const kpiCellH = 20;

  summaryKpiDefs.forEach((def, i) => {
    const col = i % kpiCols;
    const row = Math.floor(i / kpiCols);
    const x = 10 + col * (kpiCellW + 4);
    const cy = y + row * (kpiCellH + 3);

    setFill(doc, LIGHT);
    doc.roundedRect(x, cy, kpiCellW, kpiCellH, 2, 2, "F");

    // Left teal accent bar
    setFill(doc, TEAL);
    doc.rect(x, cy, 2, kpiCellH, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTextColor(doc, [100, 116, 139]);
    doc.text(def.label.toUpperCase(), x + 5, cy + 6);

    const kpi = kpis[def.kpiId];
    const val = kpi && !kpi.isNull ? kpi.display : "—";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setTextColor(doc, [15, 23, 42]);
    doc.text(val, x + 5, cy + 15);
  });

  const kpiRows = Math.ceil(summaryKpiDefs.length / kpiCols);
  y += kpiRows * (kpiCellH + 3) + 8;

  // ── All-persona tile overview ─────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(doc, [100, 116, 139]);
  doc.text("ALL PERSONA VIEWS  ·  KEY METRICS", 10, y);
  y += 5;

  const personas: Persona[] = ["cxo", "business", "technology", "operations"];

  for (const persona of personas) {
    const accent = PERSONA_ACCENT[persona];
    const sections = personaSections[persona];

    // Persona label pill
    if (y > pageH - 50) {
      y = addPage(doc);
      pageHeader(doc, "Home Dashboard");
    }

    // Persona banner
    setFill(doc, accent);
    doc.rect(10, y, w - 20, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor(doc, WHITE);
    doc.text(`  ${PERSONA_LABEL[persona].toUpperCase()} VIEW`, 12, y + 5.5);
    y += 10;

    for (const section of sections) {
      if (y > pageH - 40) {
        y = addPage(doc);
        pageHeader(doc, "Home Dashboard");
      }

      // Section sub-heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      setTextColor(doc, [100, 116, 139]);
      doc.text(section.sectionTitle.toUpperCase(), 12, y);
      y += 4;

      // Tile rows
      const tileBody = section.tiles.map((tile) => {
        const kpiId = tileKpiMap[tile.title];
        const live = kpiId ? kpis[kpiId] : undefined;
        const displayValue = live && !live.isNull ? live.display : tile.value;
        const isLive = Boolean(live && !live.isNull);
        return [
          tile.tag,
          tile.title,
          displayValue + (isLive ? "" : " *"),
          tile.delta ?? "",
        ];
      });

      autoTable(doc, {
        startY: y,
        body: tileBody,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: [1.5, 3], textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 26, fontSize: 6.5, textColor: [100, 116, 139], fontStyle: "bold" },
          1: { cellWidth: "auto", fontStyle: "normal" },
          2: { cellWidth: 32, halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
          3: { cellWidth: 22, halign: "right" },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 12, right: 10 },
        didParseCell(data) {
          if (data.column.index === 3 && data.section === "body") {
            const val = String(data.cell.raw ?? "");
            if (val.startsWith("+")) data.cell.styles.textColor = UP_G;
            else if (val.startsWith("-")) data.cell.styles.textColor = DOWN_R;
          }
        },
      });

      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
    }

    y += 4; // gap between personas
  }

  // Footer footnote
  if (y > pageH - 16) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  setTextColor(doc, [148, 163, 184]);
  doc.text("* Values marked with * are sample/mock data — no live KPI mapped yet.", 10, y + 4);
}

// ─── Persona section ──────────────────────────────────────────────────────────

function drawPersonaSections(
  doc: jsPDF,
  persona: Persona,
  sections: Section[],
  kpis: Record<string, NormalisedKpi>,
  tileKpiMap: Record<string, string>,
) {
  let y = addPage(doc);
  pageHeader(doc, PERSONA_LABEL[persona]);

  const w = doc.internal.pageSize.getWidth();
  const accent = PERSONA_ACCENT[persona];

  // Persona heading
  setFill(doc, accent);
  doc.rect(10, y, 4, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setTextColor(doc, [15, 23, 42]);
  doc.text(`${PERSONA_LABEL[persona]} Persona View`, 18, y + 8);
  y += 18;

  for (const section of sections) {
    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextColor(doc, [100, 116, 139]);
    doc.text(section.sectionTitle.toUpperCase(), 10, y);
    y += 6;

    // Build table rows from tiles
    const tileRows = section.tiles.map((tile) => {
      const kpiId = tileKpiMap[tile.title];
      const live = kpiId ? kpis[kpiId] : undefined;
      const displayValue = live && !live.isNull ? live.display : tile.value;
      return [
        tile.tag,
        tile.title,
        displayValue,
        tile.delta ?? "",
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["Category", "KPI / Metric", "Value", "Change"]],
      body: tileRows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, textColor: [30, 41, 59] },
      headStyles: {
        fillColor: accent,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 28, fontSize: 7, textColor: [100, 116, 139] },
        1: { cellWidth: "auto" },
        2: { cellWidth: 32, halign: "right", fontStyle: "bold" },
        3: { cellWidth: 24, halign: "right" },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
      didParseCell(data) {
        // Colour Change column green/red
        if (data.column.index === 3 && data.section === "body") {
          const val = String(data.cell.raw ?? "");
          if (val.startsWith("+")) data.cell.styles.textColor = UP_G;
          else if (val.startsWith("-")) data.cell.styles.textColor = DOWN_R;
        }
      },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Expand sub-rows for tiles that have them
    for (const tile of section.tiles) {
      if (!tile.rows || tile.rows.length === 0) continue;
      const kpiId = tileKpiMap[tile.title];
      const live = kpiId ? kpis[kpiId] : undefined;
      const headerVal = live && !live.isNull ? live.display : tile.value;

      // Add detail block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setTextColor(doc, [15, 23, 42]);
      // truncate long titles
      const shortTitle = tile.title.length > 50 ? tile.title.slice(0, 47) + "…" : tile.title;
      doc.text(`  ↳ ${shortTitle}  (${headerVal})`, 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        body: tile.rows.map((r) => [r.label, r.value, r.delta ?? ""]),
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2, textColor: [71, 85, 105] },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 35, halign: "right", fontStyle: "bold", textColor: [15, 23, 42] },
          2: { cellWidth: 28, halign: "right" },
        },
        margin: { left: 20, right: 10 },
        didParseCell(data) {
          if (data.column.index === 2 && data.section === "body") {
            const val = String(data.cell.raw ?? "");
            if (val.startsWith("+")) data.cell.styles.textColor = UP_G;
            else if (val.startsWith("-")) data.cell.styles.textColor = DOWN_R;
          }
        },
      });

      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
    }

    // Page break guard
    const pageH = doc.internal.pageSize.getHeight();
    if (y > pageH - 30) {
      y = addPage(doc);
      pageHeader(doc, PERSONA_LABEL[persona]);
    }
  }
}

// ─── Comparative Analysis section ────────────────────────────────────────────

type KpiRow = { id: string; label: string; category?: string; lowerIsBetter?: boolean };
type PersonaKpis = Record<Persona, KpiRow[]>;

function drawComparativeAnalysis(
  doc: jsPDF,
  companies: { id: string; label: string }[],
  perCompany: Record<string, Record<string, NormalisedKpi>>,
  kpisByPersona: PersonaKpis,
  kpiDisplayFn: (map: Record<string, NormalisedKpi>, id: string, fallback: string) => string,
) {
  let y = addPage(doc);
  pageHeader(doc, "Comparative Analysis");

  const w = doc.internal.pageSize.getWidth();

  // Heading
  setFill(doc, TEAL);
  doc.rect(10, y, 4, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setTextColor(doc, [15, 23, 42]);
  doc.text("Portfolio KPI Comparison", 18, y + 8);
  y += 18;

  const personas: Persona[] = ["cxo", "business", "technology", "operations"];

  for (const persona of personas) {
    const rows = kpisByPersona[persona];
    const accent = PERSONA_ACCENT[persona];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTextColor(doc, [15, 23, 42]);
    doc.text(PERSONA_LABEL[persona], 10, y);
    y += 4;

    const colHeaders = ["KPI", ...companies.map((c) => c.label)];
    const tableBody = rows.map((row) => {
      const vals = companies.map((c) =>
        kpiDisplayFn(perCompany[c.id] ?? {}, row.id, "—"),
      );
      return [row.label, ...vals];
    });

    autoTable(doc, {
      startY: y,
      head: [colHeaders],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    const pageH = doc.internal.pageSize.getHeight();
    if (y > pageH - 40) {
      y = addPage(doc);
      pageHeader(doc, "Comparative Analysis");
    }
  }

  // Footer note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  setTextColor(doc, [100, 116, 139]);
  doc.text("Green = best in portfolio · Red = worst. Cost-style KPIs invert the scale — lower wins.", 10, y);
}

// ─── Page numbers ─────────────────────────────────────────────────────────────

function addPageNumbers(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, [148, 163, 184]);
    doc.text(`Page ${i - 1} of ${total - 1}`, w / 2, h - 8, { align: "center" });
  }
}

// ─── Public entry point ───────────────────────────────────────────────────────

export interface DashboardPdfInput {
  contextLabel: string;
  summaryKpiDefs: SummaryKpiDef[];
  activeKpis: Record<string, NormalisedKpi>;
  personaSections: Record<Persona, Section[]>;
  tileKpiMap: Record<string, string>;
  companies: { id: string; label: string }[];
  perCompany: Record<string, Record<string, NormalisedKpi>>;
  kpisByPersona: PersonaKpis;
  kpiDisplayFn: (map: Record<string, NormalisedKpi>, id: string, fallback: string) => string;
}

export async function generateDashboardPdf(input: DashboardPdfInput): Promise<void> {
  const {
    contextLabel,
    summaryKpiDefs,
    activeKpis,
    personaSections,
    tileKpiMap,
    companies,
    perCompany,
    kpisByPersona,
    kpiDisplayFn,
  } = input;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Cover
  drawCover(doc, contextLabel, date);

  // 2. Home Dashboard — mirrors the full home/index screen:
  //    summary KPI strip + all personas' tile sections in one consolidated view
  drawHomeDashboard(doc, contextLabel, summaryKpiDefs, activeKpis, personaSections, tileKpiMap);

  // 3. Per-persona deep-dive pages (one page-group per persona)
  const personas: Persona[] = ["cxo", "business", "technology", "operations"];
  for (const persona of personas) {
    drawPersonaSections(doc, persona, personaSections[persona], activeKpis, tileKpiMap);
  }

  // 4. Comparative Analysis
  drawComparativeAnalysis(doc, companies, perCompany, kpisByPersona, kpiDisplayFn);

  // 5. Page numbers (skip cover = page 1)
  addPageNumbers(doc);

  // 6. Trigger download
  doc.save(`nexus-dashboard-${date.replace(/\s/g, "-").toLowerCase()}.pdf`);
}

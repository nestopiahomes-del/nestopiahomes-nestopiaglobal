import { jsPDF } from "jspdf";
import { AnyFinancingResult } from "../types";
import { MARKETS, formatCurrency, formatPercentage } from "./marketConfig";

export function generateFinancingPDF(result: AnyFinancingResult): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const market = MARKETS[result.country];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkGreen: [number, number, number] = [6, 44, 33];
  const emeraldAccent: [number, number, number] = [16, 185, 129];
  const goldAccent: [number, number, number] = [217, 169, 74];
  const slateDark: [number, number, number] = [15, 23, 42];
  const slateMuted: [number, number, number] = [100, 116, 139];
  const slateLight: [number, number, number] = [241, 245, 249];

  // Helper for footer
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(
      `${market.company} • ${market.jurisdiction} • Educational Simulation Only`,
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 10, {
      align: "right"
    });
  };

  // Helper for header banner
  const addHeaderBanner = (title: string, subtitle: string) => {
    doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.rect(0, 0, pageWidth, 28, "F");

    // Gold accent strip
    doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.rect(0, 27.2, pageWidth, 1.2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 230, 215);
    doc.text(subtitle, margin, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text(market.name.toUpperCase(), pageWidth - margin, 14, { align: "right" });
  };

  // ================= PAGE 1: COVER & EXECUTIVE SUMMARY =================
  addHeaderBanner(
    "NESTOPIA ISLAMIC FINANCE",
    `${market.company} • Educational Financing Simulation Report`
  );

  let y = 38;

  // Title Box
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text(result.modelName.toUpperCase(), margin + 6, y + 10);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.text(result.modelArabicName || "", margin + 6, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(result.tagline, margin + 6, y + 24);

  y += 40;

  // Key Parameters Grid (2 columns)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("1. TRANSACTION CORE PARAMETERS", margin, y);
  y += 6;

  const colWidth = (contentWidth - 6) / 2;
  const renderParamBox = (
    x: number,
    top: number,
    label: string,
    value: string,
    subtext: string
  ) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 225, 230);
    doc.roundedRect(x, top, colWidth, 18, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(label, x + 4, top + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(value, x + 4, top + 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(emeraldAccent[0], emeraldAccent[1], emeraldAccent[2]);
    doc.text(subtext, x + 4, top + 15.5);
  };

  renderParamBox(
    margin,
    y,
    "Property Purchase Value",
    formatCurrency(result.propertyValue, result.country),
    "100% of property asset cost"
  );
  renderParamBox(
    margin + colWidth + 6,
    y,
    "Financing Tenure",
    `${result.tenureYears} Years (${result.tenureMonths} Months)`,
    "Structured repayment horizon"
  );
  y += 22;

  renderParamBox(
    margin,
    y,
    "Your Initial Contribution",
    formatCurrency(result.customerContribution, result.country),
    `${result.customerContributionPct}% of asset value`
  );
  renderParamBox(
    margin + colWidth + 6,
    y,
    "Financier Capital Required",
    formatCurrency(result.financierContribution, result.country),
    `${result.financierContributionPct}% of asset value`
  );
  y += 26;

  // Executive Summary Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("2. EXECUTIVE SUMMARY & FINANCIAL TOTALS", margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, "FD");

  const summaryRows = [
    ["Total Capital Being Financed:", formatCurrency(result.financierContribution, result.country)],
    [
      result.model === "MURABAHAH" ? "Total Agreed Disclosed Profit:" : "Total Rent Paid for Usufruct:",
      formatCurrency(
        result.model === "MURABAHAH" ? result.totalProfitPaid : result.totalRentPaid,
        result.country
      )
    ],
    ["Total Financing Scheduled Payments:", formatCurrency(result.totalFinancingPayments, result.country)],
    ["Your Initial Capital Outlay:", formatCurrency(result.customerContribution, result.country)],
    ["TOTAL CASH OUTFLOW BY END OF TENURE:", formatCurrency(result.totalCustomerCashOutflow, result.country)]
  ];

  let sumY = y + 8;
  summaryRows.forEach(([lbl, val], idx) => {
    const isTotal = idx === summaryRows.length - 1;
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(isTotal ? 9.5 : 8.5);
    doc.setTextColor(
      isTotal ? darkGreen[0] : slateDark[0],
      isTotal ? darkGreen[1] : slateDark[1],
      isTotal ? darkGreen[2] : slateDark[2]
    );
    doc.text(lbl, margin + 6, sumY);
    doc.text(val, pageWidth - margin - 6, sumY, { align: "right" });
    sumY += 9;
  });

  y += 62;

  // Educational Synopsis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("3. WHAT JUST HAPPENED?", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const splitWhatHappened = doc.splitTextToSize(result.whatHappened, contentWidth);
  doc.text(splitWhatHappened, margin, y);

  addFooter(1, 4);

  // ================= PAGE 2: HOW IT WORKS & SHARIAH GOVERNANCE =================
  doc.addPage();
  addHeaderBanner(
    "HOW THIS STRUCTURE OPERATES",
    `${result.modelName} Mechanism & AAOIFI Shariah Governance`
  );

  y = 38;

  // Comparison section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("CONVENTIONAL INTEREST-BEARING LOAN VS. THIS ISLAMIC MODEL", margin, y);
  y += 6;

  // Conventional Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text("Conventional Debt Mechanism:", margin + 4, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(69, 10, 10);
  const convSplit = doc.splitTextToSize(result.whyDifferent.conventional, contentWidth - 8);
  doc.text(convSplit, margin + 4, y + 10);
  y += 24;

  // Islamic Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61);
  doc.text("Islamic Asset-Backed Mechanism:", margin + 4, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(20, 83, 45);
  const islSplit = doc.splitTextToSize(result.whyDifferent.islamic, contentWidth - 8);
  doc.text(islSplit, margin + 4, y + 10);
  y += 26;

  // Shariah Principles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("CORE SHARIAH PRINCIPLES GOVERNING THIS TRANSACTION", margin, y);
  y += 7;

  result.shariahPrinciples.forEach((principle) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
    doc.text(principle.title, margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const pSplit = doc.splitTextToSize(principle.explanation, contentWidth - 8);
    doc.text(pSplit, margin + 4, y + 11);

    y += 25;
  });

  addFooter(2, 4);

  // ================= PAGE 3: YEARLY FINANCIAL PROGRESSION =================
  doc.addPage();
  addHeaderBanner(
    "YEAR-BY-YEAR FINANCIAL PROGRESSION",
    "Summary of Capital Acquired, Rent/Profit Paid, and Ownership Equity"
  );

  y = 38;

  // Table Header
  doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  const colX = [
    margin + 4,
    margin + 20,
    margin + 52,
    margin + 84,
    margin + 118,
    margin + 146
  ];

  doc.text("Year", colX[0], y + 5.5);
  doc.text("Total Paid", colX[1], y + 5.5);
  doc.text("Capital Acquired", colX[2], y + 5.5);
  doc.text("Rent/Profit Paid", colX[3], y + 5.5);
  doc.text("Remaining Balance", colX[4], y + 5.5);
  doc.text("Your Ownership", colX[5], y + 5.5);

  y += 8;

  // Table Rows (Yearly Summary)
  const yearly = result.yearlySummary.slice(0, 20); // Display up to 20 years cleanly
  yearly.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);

    doc.text(`Year ${row.year}`, colX[0], y + 4.8);
    doc.text(formatCurrency(row.totalPaid, result.country), colX[1], y + 4.8);
    doc.text(formatCurrency(row.capitalAcquired, result.country), colX[2], y + 4.8);
    doc.text(formatCurrency(row.profitOrRentPaid, result.country), colX[3], y + 4.8);
    doc.text(formatCurrency(row.remainingFinancing, result.country), colX[4], y + 4.8);
    doc.text(formatPercentage(row.customerOwnershipPct), colX[5], y + 4.8);

    y += 7;
  });

  // Reconciled Totals row
  y += 2;
  doc.setFillColor(slateLight[0], slateLight[1], slateLight[2]);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);

  doc.text("FINAL", colX[0], y + 5.5);
  doc.text(formatCurrency(result.totalFinancingPayments, result.country), colX[1], y + 5.5);
  doc.text(formatCurrency(result.totalCapitalPaid, result.country), colX[2], y + 5.5);
  doc.text(
    formatCurrency(
      result.model === "MURABAHAH" ? result.totalProfitPaid : result.totalRentPaid,
      result.country
    ),
    colX[3],
    y + 5.5
  );
  doc.text(formatCurrency(0, result.country), colX[4], y + 5.5);
  doc.text("100.0%", colX[5], y + 5.5);

  addFooter(3, 4);

  // ================= PAGE 4: APPRECIATION, ASSUMPTIONS & DISCLAIMERS =================
  doc.addPage();
  addHeaderBanner(
    "PROPERTY PROJECTION & GOVERNANCE",
    "Illustrative Property Value & Formal Regulatory Disclaimers"
  );

  y = 38;

  // Property Appreciation Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("ILLUSTRATIVE PROPERTY VALUE PROJECTION", margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, "FD");

  const apprecColW = contentWidth / 3;
  const renderApprecStat = (x: number, label: string, val: string, sub: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(label, x + 6, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(val, x + 6, y + 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(emeraldAccent[0], emeraldAccent[1], emeraldAccent[2]);
    doc.text(sub, x + 6, y + 23);
  };

  renderApprecStat(
    margin,
    "Original Asset Value",
    formatCurrency(result.propertyValue, result.country),
    "Baseline valuation"
  );
  renderApprecStat(
    margin + apprecColW,
    `Projected Value (${result.tenureYears} Yrs)`,
    formatCurrency(result.estimatedFuturePropertyValue, result.country),
    `At ${result.appreciationRate}% compound annual growth`
  );
  renderApprecStat(
    margin + apprecColW * 2,
    "Potential Equity Gain",
    formatCurrency(result.estimatedPropertyAppreciationGain, result.country),
    `+${result.estimatedPropertyAppreciationGainPct}% over tenure`
  );

  y += 42;

  // Regulatory & Shariah Disclaimers Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text("MANDATORY REGULATORY & SHARIAH ADVISORY DISCLOSURES", margin, y);
  y += 6;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(margin, y, contentWidth, 75, 2, 2, "FD");

  const disclaimerBullets = [
    "Educational Simulator Only: This report is an educational financial simulation and does not constitute a formal offer of financing, mortgage approval, or legal commitment by Nestopia Homes Limited or Nestopia Global Private Limited.",
    "Illustrative Projections: Future property valuations and rental income figures are purely illustrative projections. Actual future property values may rise, fall, or fluctuate according to prevailing economic conditions.",
    "Independent Shariah Verification: While mathematical structures reflect AAOIFI Shariah governance standards, actual compliance depends upon executed contracts, possession transfer, risk allocation, and approval by an independent Shariah Supervisory Board.",
    "Legal & Tax Advice: Users must consult qualified independent legal, financial, and taxation advisors in their respective jurisdictions (UK / India) prior to executing any binding property agreements.",
    "Non-Binding Character: No rights or liabilities are created by this document. Discretionary rebate (Ibra') or early settlement conditions remain subject to final contractual terms."
  ];

  let discY = y + 8;
  disclaimerBullets.forEach((bullet) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    const splitB = doc.splitTextToSize(`• ${bullet}`, contentWidth - 10);
    doc.text(splitB, margin + 5, discY);
    discY += splitB.length * 4.2;
  });

  y += 82;

  // Sign-off / Entity block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text(`${market.company}`, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(`Registered Office: ${market.registeredOffice} • ${market.jurisdiction}`, margin, y + 4.5);

  addFooter(4, 4);

  // Save the PDF
  const filename = `Nestopia_Islamic_Finance_${result.model}_${result.country}_Simulation.pdf`;
  doc.save(filename);
}

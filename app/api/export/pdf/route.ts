import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { TaxCalculationService } from "@/lib/tax-calculator";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: "Keine Transaktionen vorhanden" }, { status: 400 });
    }

    // Calculate tax report
    const report = TaxCalculationService.calculateTaxReport(transactions);

    // Generate simple HTML for PDF (in production use jsPDF)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CryptoBuddy Steuer-Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #007AFF; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .summary { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
    .profit { color: #34C759; }
    .loss { color: #FF3B30; }
  </style>
</head>
<body>
  <h1>CryptoBuddy Steuer-Report 2025</h1>
  <p><strong>Erstellt am:</strong> ${new Date().toLocaleDateString("de-DE")}</p>
  <p><strong>Nutzer:</strong> ${session.user.email}</p>

  <div class="summary">
    <h2>Zusammenfassung</h2>
    <p><strong>Gesamtgewinn (steuerpflichtig):</strong> <span class="${report.totalTaxableGains >= 0 ? "profit" : "loss"}">
      ${report.totalTaxableGains.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
    </span></p>
    <p><strong>Steuerfreie Gewinne (> 1 Jahr):</strong> <span class="profit">
      ${report.totalTaxFreeGains.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
    </span></p>
    <p><strong>Staking Rewards:</strong> ${report.totalStakingRewards.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</p>
    ${report.stakingOverLimit ? '<p style="color: #FF3B30;"><strong>⚠️ Staking-Freigrenze von 256€ überschritten!</strong></p>' : ""}
  </div>

  <h2>Verkäufe (FIFO-Berechnung nach § 23 EStG)</h2>
  <table>
    <thead>
      <tr>
        <th>Datum</th>
        <th>Coin</th>
        <th>Menge</th>
        <th>Verkaufspreis</th>
        <th>Kaufpreis</th>
        <th>Gewinn/Verlust</th>
        <th>Steuerpflichtig</th>
      </tr>
    </thead>
    <tbody>
      ${report.sales
        .map(
          (sale) => `
        <tr>
          <td>${new Date(sale.saleDate).toLocaleDateString("de-DE")}</td>
          <td>${sale.cryptocurrency}</td>
          <td>${sale.amount.toFixed(8)}</td>
          <td>${sale.salePrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</td>
          <td>${sale.purchasePrice.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</td>
          <td class="${sale.taxableGain + sale.taxFreeGain >= 0 ? "profit" : "loss"}">
            ${(sale.taxableGain + sale.taxFreeGain).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
          </td>
          <td>${sale.taxableGain.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <h2>Rechtliche Grundlagen</h2>
  <ul>
    <li><strong>§ 23 EStG:</strong> Private Veräußerungsgeschäfte - Gewinne aus Verkäufen innerhalb eines Jahres sind steuerpflichtig</li>
    <li><strong>§ 22 Nr. 3 EStG:</strong> Staking-Rewards bis 256€ pro Jahr steuerfrei</li>
    <li><strong>FIFO-Methode:</strong> First-In-First-Out Bewertung</li>
  </ul>

  <p style="margin-top: 40px; font-size: 12px; color: #666;">
    Dieser Report wurde automatisch von CryptoBuddy generiert. Bitte konsultiere einen Steuerberater für die finale Steuererklärung.
  </p>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="cryptobud-steuer-report-${new Date().toISOString().split("T")[0]}.html"`,
      },
    });
  } catch (error: any) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: error.message || "Export fehlgeschlagen" },
      { status: 500 }
    );
  }
}

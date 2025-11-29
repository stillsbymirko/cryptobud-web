import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: "Keine Transaktionen vorhanden" }, { status: 400 });
    }

    // Generate CSV
    const headers = [
      "Datum",
      "Uhrzeit",
      "Typ",
      "Cryptocurrency",
      "Menge",
      "Preis (EUR)",
      "Exchange",
      "Gebühr Menge",
      "Gebühr Asset",
      "Notizen",
    ];

    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString("de-DE"),
      new Date(tx.date).toLocaleTimeString("de-DE"),
      tx.type,
      tx.cryptocurrency,
      tx.amount.toString(),
      tx.priceEUR.toString(),
      tx.exchange,
      tx.feeAmount.toString(),
      tx.feeAsset || "",
      tx.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="cryptobud-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: error.message || "Export fehlgeschlagen" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactions } = await request.json();

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Ungültige Transaktionsdaten" },
        { status: 400 }
      );
    }

    // Save transactions to database
    const results = await prisma.transaction.createMany({
      data: transactions.map((tx: any) => ({
        userId: session.user.id,
        date: new Date(tx.date),
        cryptocurrency: tx.cryptocurrency,
        amount: tx.amount,
        priceEUR: tx.priceEUR,
        type: tx.type,
        exchange: tx.exchange,
        feeAmount: tx.feeAmount,
        feeAsset: tx.feeAsset,
        notes: tx.notes,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      imported: results.count,
    });
  } catch (error: any) {
    console.error("Confirm import error:", error);
    return NextResponse.json(
      { error: error.message || "Import fehlgeschlagen" },
      { status: 500 }
    );
  }
}

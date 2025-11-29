import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CSVImportService } from "@/lib/csv-import";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Nur CSV-Dateien erlaubt" }, { status: 400 });
    }

    const text = await file.text();
    
    // Try to parse as 21Bitcoin format
    const result = CSVImportService.parse21Bitcoin(text);

    if (result.transactions.length === 0) {
      return NextResponse.json(
        { error: "Keine gültigen Transaktionen gefunden" },
        { status: 400 }
      );
    }

    const stats = CSVImportService.calculateStats(result.transactions);

    return NextResponse.json({
      transactions: result.transactions,
      stats,
      exchange: "21Bitcoin",
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error.message || "Import fehlgeschlagen" },
      { status: 500 }
    );
  }
}

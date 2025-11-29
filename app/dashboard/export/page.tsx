import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { FileDown, Download } from "lucide-react";
import Link from "next/link";

export default async function ExportPage() {
  const session = await getServerSession(authOptions);

  const transactions = await prisma.transaction.findMany({
    where: { userId: session?.user?.id },
    orderBy: { date: "desc" },
  });

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export</h1>
        <p className="text-gray-600">Exportiere deine Daten für Steuerberater</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileDown className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">CSV Export</h3>
              <p className="text-sm text-gray-600">Alle Transaktionen</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Exportiere alle deine Transaktionen als CSV-Datei für Excel oder andere Tools.
          </p>
          {hasTransactions ? (
            <Link
              href="/api/export/csv"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV herunterladen
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
            >
              Keine Daten vorhanden
            </button>
          )}
        </div>

        {/* PDF Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PDF Report</h3>
              <p className="text-sm text-gray-600">Steuer-Bericht</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Generiere einen PDF-Bericht mit FIFO-Berechnung gemäß deutschem Steuerrecht.
          </p>
          {hasTransactions ? (
            <Link
              href="/api/export/pdf"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF herunterladen
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
            >
              Keine Daten vorhanden
            </button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          📊 Steuerrelevante Informationen
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ FIFO-Berechnung gemäß § 23 EStG</li>
          <li>✓ 1-Jahres-Haltefrist automatisch berechnet</li>
          <li>✓ Staking-Rewards mit 256€ Freigrenze (§ 22 Nr. 3 EStG)</li>
          <li>✓ Detaillierte Auflistung aller Trades</li>
        </ul>
      </div>

      {/* Stats */}
      {hasTransactions && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Datenübersicht</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Transaktionen</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Coins</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(transactions.map((tx) => tx.cryptocurrency)).size}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Exchanges</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(transactions.map((tx) => tx.exchange)).size}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Zeitraum</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.ceil(
                  (new Date().getTime() - new Date(transactions[transactions.length - 1].date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                Tage
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

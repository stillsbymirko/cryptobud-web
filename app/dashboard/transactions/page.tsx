import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { List, Calendar, ArrowUpDown } from "lucide-react";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);

  const transactions = await prisma.transaction.findMany({
    where: { userId: session?.user?.id },
    orderBy: { date: "desc" },
    take: 100, // Limit to latest 100
  });

  // Group by type for stats
  const stats = {
    total: transactions.length,
    buys: transactions.filter(tx => tx.type === "buy").length,
    sells: transactions.filter(tx => tx.type === "sell").length,
    staking: transactions.filter(tx => tx.type === "staking").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaktionen</h1>
        <p className="text-gray-600">Alle deine Crypto-Transaktionen im Überblick</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <List className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Käufe</span>
            <ArrowUpDown className="w-4 h-4 text-profit" />
          </div>
          <p className="text-2xl font-bold text-profit mt-2">{stats.buys}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Verkäufe</span>
            <ArrowUpDown className="w-4 h-4 text-loss" />
          </div>
          <p className="text-2xl font-bold text-loss mt-2">{stats.sells}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Staking</span>
            <Calendar className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-warning mt-2">{stats.staking}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Alle Transaktionen</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Typ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Coin
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Menge
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Preis (EUR)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exchange
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Gebühr
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Noch keine Transaktionen. Importiere eine CSV-Datei.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                      <div className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "buy"
                            ? "bg-green-100 text-green-700"
                            : tx.type === "sell"
                            ? "bg-red-100 text-red-700"
                            : tx.type === "staking"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {tx.cryptocurrency}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600 font-mono">
                      {tx.amount.toFixed(8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">
                      {tx.priceEUR.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tx.exchange}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {tx.feeAmount > 0 ? (
                        <span>
                          {tx.feeAmount.toFixed(8)} {tx.feeAsset}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { TrendingUp, TrendingDown, AlertCircle, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const transactions = await prisma.transaction.findMany({
    where: { userId: session?.user?.id },
    orderBy: { date: "desc" },
  });

  // Calculate portfolio stats
  const holdings = transactions.reduce((acc, tx) => {
    if (tx.type === "buy" || tx.type === "staking") {
      acc[tx.cryptocurrency] = (acc[tx.cryptocurrency] || 0) + tx.amount;
    } else if (tx.type === "sell" || tx.type === "withdrawal") {
      acc[tx.cryptocurrency] = (acc[tx.cryptocurrency] || 0) - tx.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalCost = transactions
    .filter(tx => tx.type === "buy")
    .reduce((sum, tx) => sum + tx.priceEUR, 0);

  const stakingRewards = transactions
    .filter(tx => tx.type === "staking")
    .reduce((sum, tx) => sum + tx.priceEUR, 0);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist dein Portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portfolio Value */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Portfolio Wert</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalCost.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
          <p className="text-sm text-gray-500 mt-1">Investiert</p>
        </div>

        {/* Staking Rewards */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Staking Rewards</span>
            <Calendar className="w-5 h-5 text-warning" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stakingRewards.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {stakingRewards > 256 ? (
              <span className="text-red-600">⚠️ Über 256€ Limit</span>
            ) : (
              <span>Von 256€ Freigrenze</span>
            )}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Transaktionen</span>
            <TrendingDown className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {transactions.length}
          </div>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>

        {/* Assets */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Assets</span>
            <AlertCircle className="w-5 h-5 text-profit" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Object.keys(holdings).length}
          </div>
          <p className="text-sm text-gray-500 mt-1">Verschiedene Coins</p>
        </div>
      </div>

      {/* Holdings Table */}
      {hasTransactions ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Deine Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Menge
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ø Kaufpreis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(holdings)
                  .filter(([_, amount]) => amount > 0)
                  .map(([crypto, amount]) => {
                    const buys = transactions.filter(
                      tx => tx.cryptocurrency === crypto && tx.type === "buy"
                    );
                    const avgPrice = buys.length > 0
                      ? buys.reduce((sum, tx) => sum + tx.priceEUR, 0) / buys.length
                      : 0;

                    return (
                      <tr key={crypto} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {crypto}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {amount.toFixed(8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {avgPrice.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Noch keine Transaktionen
          </h3>
          <p className="text-gray-600 mb-6">
            Importiere deine erste CSV-Datei, um dein Portfolio zu tracken.
          </p>
          <a
            href="/dashboard/import"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            <Upload className="w-4 h-4 mr-2" />
            CSV importieren
          </a>
        </div>
      )}
    </div>
  );
}

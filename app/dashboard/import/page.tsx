"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Bitte eine CSV-Datei auswählen");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Datei zu groß (max 10MB)");
      return;
    }

    setFile(selectedFile);
    setError("");
    setPreview(null);
  }

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      setPreview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;

    setIsUploading(true);
    setError("");

    try {
      const response = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: preview.transactions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Import fehlgeschlagen");
      }

      router.push("/dashboard?imported=true");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CSV Import</h1>
        <p className="text-gray-600">Importiere Transaktionen von 21Bitcoin, Bitpanda, etc.</p>
      </div>

      {!preview ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="max-w-xl mx-auto">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition">
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-semibold text-gray-900">
                  CSV-Datei auswählen
                </span>
                <p className="text-sm text-gray-600 mt-2">
                  oder Datei hierher ziehen
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {file && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{file.name}</p>
                      <p className="text-xs text-blue-600">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isUploading ? "Hochladen..." : "Hochladen"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Unterstützte Exchanges
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ 21Bitcoin</li>
                <li>✓ Bitpanda</li>
                <li>✓ Kraken</li>
                <li>✓ Binance</li>
                <li>✓ Coinbase</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                {preview.stats.transactionCount} Transaktionen gefunden
              </p>
              <p className="text-xs text-green-700">
                Gesamt: {preview.stats.totalBTC.toFixed(8)} BTC | 
                Kosten: {preview.stats.totalCost.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vorschau (erste 10)</h2>
              <button
                onClick={handleConfirm}
                disabled={isUploading}
                className="px-6 py-2 bg-profit text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isUploading ? "Importiere..." : "Import bestätigen"}
              </button>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preview.transactions.slice(0, 10).map((tx: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(tx.date).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "buy" ? "bg-green-100 text-green-700" :
                          tx.type === "sell" ? "bg-red-100 text-red-700" :
                          tx.type === "staking" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {tx.cryptocurrency}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {tx.amount.toFixed(8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {tx.priceEUR.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

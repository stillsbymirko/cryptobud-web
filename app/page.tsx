export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            CryptoBuddy 🚀
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Crypto Tax Management für Deutschland
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/register"
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Kostenlos starten
            </a>
            <a
              href="/auth/login"
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition"
            >
              Login
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Portfolio Tracking</h3>
            <p className="text-gray-600">
              Verwalte all deine Crypto-Transaktionen an einem Ort. Echtzeit-Bewertung mit CoinGecko API.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">FIFO Steuerberechnung</h3>
            <p className="text-gray-600">
              Automatische Berechnung nach §23 EStG. 1-Jahres-Haltefrist und steuerfreie Verkäufe.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-bold mb-2">CSV Import</h3>
            <p className="text-gray-600">
              Support für 21Bitcoin, Bitpanda, Kraken, Binance, Coinbase und Bitstamp.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Features</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-lg">
              <span className="text-profit font-semibold">✓</span> 1-Jahres-Haltefrist Tracking
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-profit font-semibold">✓</span> Staking-Rewards (256€ Limit)
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-profit font-semibold">✓</span> PDF Export für Steuerberater
            </div>
            <div className="bg-white p-4 rounded-lg">
              <span className="text-profit font-semibold">✓</span> DSGVO-konform & verschlüsselt
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

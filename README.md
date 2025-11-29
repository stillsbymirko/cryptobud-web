# CryptoBuddy Web

**Crypto Portfolio & Tax Management für Deutschland** 🇩🇪

Eine moderne Web-App zur Verwaltung deines Crypto-Portfolios mit automatischer Steuerberechnung nach deutschem Recht (§23 EStG, §22 Nr. 3 EStG).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stillsbymirko/cryptobud-web)

---

## ✨ Features

✅ **CSV Import** - 21Bitcoin, Bitpanda, Kraken, Binance, Coinbase  
✅ **FIFO Steuerberechnung** - Automatisch nach deutschem Steuerrecht  
✅ **1-Jahres-Haltefrist** - Tracking für steuerfreie Verkäufe  
✅ **Staking Rewards** - 256€ Freigrenze (§22 Nr. 3 EStG)  
✅ **Portfolio Dashboard** - Live-Übersicht deiner Holdings  
✅ **Transaction History** - Alle Trades im Detail  
✅ **PDF/CSV Export** - Für Steuerberater  
✅ **Multi-User** - Jeder hat sein eigenes Portfolio  

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** PostgreSQL (via Supabase), Prisma ORM
- **Auth:** NextAuth.js mit Credentials Provider
- **Charts:** Recharts
- **Deployment:** Vercel + Supabase

---

## 🚀 Quick Start

### 1. Repository klonen

```bash
git clone https://github.com/stillsbymirko/cryptobud-web.git
cd cryptobud-web
```

### 2. Setup-Script ausführen

```bash
chmod +x setup.sh
./setup.sh
```

Das Script:
- Erstellt `.env.local` mit generiertem `NEXTAUTH_SECRET`
- Installiert alle Dependencies
- Bietet an, Prisma DB zu pushen

### 3. Environment konfigurieren

Bearbeite `.env.local` und füge deine Supabase-Daten ein:

```bash
# Supabase Connection Strings (aus Supabase Dashboard)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[wird automatisch generiert]"
```

### 4. Datenbank erstellen

```bash
npx prisma db push
```

### 5. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 📖 Verwendung

### 1. Account erstellen
- Gehe zu `/auth/register`
- Erstelle einen Account mit Email + Passwort

### 2. CSV importieren
- Navigiere zu "CSV Import" im Dashboard
- Wähle deine 21Bitcoin (oder andere) CSV-Datei
- Vorschau prüfen → Import bestätigen

### 3. Portfolio ansehen
- Dashboard zeigt aktuelle Holdings
- Staking Rewards mit 256€ Limit-Tracking
- Übersicht über alle Assets

### 4. Steuer-Report exportieren
- Gehe zu "Export"
- Wähle PDF (HTML) oder CSV
- FIFO-Berechnung wird automatisch durchgeführt

---

## 📦 Projekt-Struktur

```
cryptobud-web/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth.js config
│   │   ├── import/        # CSV import endpoints
│   │   └── export/        # CSV/PDF export endpoints
│   ├── auth/              # Login/Register pages
│   ├── dashboard/         # Protected dashboard
│   │   ├── import/        # CSV upload UI
│   │   ├── transactions/  # Transaction list
│   │   └── export/        # Export UI
│   ├── layout.tsx
│   └── page.tsx           # Landing page
├── lib/
│   ├── csv-import.ts      # CSV parser (21Bitcoin)
│   ├── tax-calculator.ts  # FIFO tax engine
│   └── prisma.ts          # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
├── setup.sh               # Setup script
└── README.md
```

---

## 📁 CSV Import Beispiel

### 21Bitcoin Format

```csv
id,exchange_name,transaction_date,buy_asset,buy_amount,sell_asset,sell_amount,fee_asset,fee_amount,transaction_type,note
1,21Bitcoin,15.12.2024 10:30:00,BTC,0.001,EUR,95.50,EUR,0.95,trade,
```

Die App parsed automatisch:
- Kaufdatum für Haltefrist-Berechnung
- Menge + Preis für FIFO
- Gebühren (werden zum Kaufpreis addiert)
- Typ (trade/deposit/withdrawal)

---

## 🧮 Steuerberechnung

### § 23 EStG - Private Veräußerungsgeschäfte
- **FIFO-Methode:** First-In-First-Out
- **1-Jahres-Frist:** Verkäufe nach 1 Jahr sind steuerfrei
- **Automatische Berechnung:** Welche Coins sind wann steuerfrei

### § 22 Nr. 3 EStG - Staking Rewards
- **256€ Freigrenze** pro Jahr
- Historischer Preis wird beim Erhalt gespeichert
- Warning wenn Limit überschritten

### Beispiel: Tax Calculation

```typescript
import { TaxCalculationService } from '@/lib/tax-calculator';

const transactions = [
  { date: '2024-01-15', type: 'buy', cryptocurrency: 'BTC', amount: 0.1, priceEUR: 4000 },
  { date: '2025-02-20', type: 'sell', cryptocurrency: 'BTC', amount: 0.05, priceEUR: 2500 },
];

const report = TaxCalculationService.calculateTaxReport(transactions);
// {
//   totalTaxableGains: 500,      // Nach < 1 Jahr
//   totalTaxFreeGains: 0,
//   sales: [...],
//   upcomingTaxFreeSales: [...]
// }
```

---

## 🚀 Deployment

### Vercel + Supabase

1. **Supabase Projekt erstellen:**
   - Gehe zu [supabase.com](https://supabase.com)
   - Neues Projekt erstellen
   - Kopiere `DATABASE_URL` und `DIRECT_URL`

2. **GitHub → Vercel verbinden:**
   - Gehe zu [vercel.com](https://vercel.com)
   - Import GitHub Repository
   - Environment Variables hinzufügen:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `NEXTAUTH_URL` (deine Vercel URL)
     - `NEXTAUTH_SECRET`

3. **Deploy:**
   - Vercel deployed automatisch bei jedem Push
   - Prisma Migrations laufen automatisch

### Environment Variables (Production)

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="https://cryptobud.vercel.app"
NEXTAUTH_SECRET="[production-secret]"
```

---

## 🎨 Design System

```css
--primary: #007AFF;       /* iOS Blue */
--profit: #34C759;        /* Green */
--loss: #FF3B30;          /* Red */
--warning: #FF9500;       /* Orange */
```

---

## 📈 Roadmap

- [x] Phase 1: Grundfunktionen
  - [x] User Authentication
  - [x] CSV Import (21Bitcoin)
  - [x] Dashboard mit Holdings
  - [x] Transaction List
  - [x] PDF/CSV Export
  
- [x] Phase 2: Steuer-Features
  - [x] FIFO Tax Calculator
  - [x] Staking Rewards Tracking
  - [x] Export für Steuerberater

- [ ] Phase 3: Erweiterte Features
  - [ ] Modernes Dashboard-Design ([#1](https://github.com/stillsbymirko/cryptobud-web/issues/1))
  - [ ] CoinGecko API Integration (Live-Preise)
  - [ ] Charts (Portfolio Performance)
  - [ ] Weitere Exchanges (Bitpanda, Kraken)

- [ ] Phase 4: Optimization
  - [ ] Dark Mode
  - [ ] Mobile App (React Native)
  - [ ] Multi-Currency Support

---

## 🤝 Contributing

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue erstellen.

---

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details

---

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/stillsbymirko/cryptobud-web/issues)
- **Email:** miremewf@gmail.com

---

**Hinweis:** Diese App ist ein Tool zur Unterstützung - bitte konsultiere einen Steuerberater für die finale Steuererklärung.

**Built with ❤️ for the German crypto community**

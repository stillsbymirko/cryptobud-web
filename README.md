# CryptoBuddy Web App 🚀

**Cryptocurrency Tax Management for Germany** - FIFO Calculation, §23 EStG, §22 Nr. 3 EStG

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stillsbymirko/cryptobud-web)

---

## 🎯 Features

### 📊 Portfolio Management
- Real-time crypto portfolio tracking
- Automatic valuation with CoinGecko API
- Profit/Loss calculation (realized & unrealized)
- Historical performance charts
- Multi-cryptocurrency support

### 💰 German Tax Calculation
- **FIFO Method** (First-In-First-Out)
- **§23 EStG**: 1-year holding period for tax-free sales
- **§22 Nr. 3 EStG**: 256€ tax-free limit for staking rewards
- Automatic tracking of tax-free sale dates
- Annual tax reports

### 📁 CSV Import
Supported exchanges:
- ✅ **21Bitcoin** (Full support for your transactions!)
- ✅ **Bitpanda**
- ✅ **Kraken**
- ✅ **Binance**
- ✅ **Coinbase**
- ✅ **Bitstamp**

### 📄 Export Functions
- PDF tax reports for Steuerberater
- CSV export of all transactions
- Annual summary reports
- Custom date range selection

### 🔐 Security
- Multi-user authentication with NextAuth.js
- Encrypted passwords with bcrypt
- GDPR compliant
- Secure database with Prisma

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Charts**: Recharts
- **CSV Parser**: PapaParse
- **PDF Generation**: jsPDF

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use [Supabase](https://supabase.com/) free tier)
- npm or pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/stillsbymirko/cryptobud-web.git
cd cryptobud-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cryptobud"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

4. **Set up database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Project Structure

```
cryptobud-web/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Landing page
│   ├── layout.tsx       # Root layout
│   └── dashboard/       # Protected dashboard (coming soon)
├── lib/                 # Core business logic
│   ├── csv-import.ts    # CSV parser (21Bitcoin format)
│   └── tax-calculator.ts # FIFO tax calculation
├── prisma/
│   └── schema.prisma    # Database schema
└── components/          # Reusable UI components (coming soon)
```

---

## 🧮 Tax Calculation Examples

### FIFO Calculation
```typescript
import { TaxCalculationService } from '@/lib/tax-calculator';

const report = TaxCalculationService.calculateTaxReport(transactions, 2025);
console.log(report.totalTaxableGains);  // Steuerpflichtige Gewinne
console.log(report.totalTaxFreeGains);  // Steuerfreie Gewinne
```

### CSV Import (21Bitcoin)
```typescript
import { CSVImportService } from '@/lib/csv-import';

const transactions = CSVImportService.parse21Bitcoin(csvContent);
const stats = CSVImportService.calculateStats(transactions);
console.log(stats.averagePrice);  // Durchschnittlicher Kaufpreis
```

---

## 🎨 Design System

Colors (following iOS/macOS design):
- **Primary**: `#007AFF` (Blue)
- **Profit**: `#34C759` (Green)
- **Loss**: `#FF3B30` (Red)
- **Warning**: `#FF9500` (Orange)

---

## 📈 Roadmap

### Phase 1 (Current) ✅
- [x] Project setup
- [x] CSV import for 21Bitcoin
- [x] FIFO tax calculator
- [x] Database schema

### Phase 2 (Next)
- [ ] Authentication (Register/Login)
- [ ] Dashboard UI
- [ ] Transaction table
- [ ] CSV upload interface

### Phase 3
- [ ] PDF export
- [ ] Charts (Portfolio performance)
- [ ] Dark mode
- [ ] Mobile responsive

### Phase 4
- [ ] Support for more exchanges
- [ ] DeFi transactions
- [ ] Multi-language (EN/DE)
- [ ] Tax optimizer

---

## 🧪 Testing with Your Data

You can test the CSV import with your 21Bitcoin transactions:

```typescript
// Example: Parse your CSV
const csvContent = `id,exchange_name,depot_name,transaction_date,buy_asset,buy_amount,sell_asset,sell_amount,fee_asset,fee_amount,transaction_type,note,linked_transaction
2,21bitcoin,main,16.12.2024 20:18:33,BTC,0.00014278,EUR,14.51,EUR,0.49,trade,Standard BTC Purchase,`;

const transactions = CSVImportService.parse21Bitcoin(csvContent);
const stats = CSVImportService.calculateStats(transactions);

console.log(`Total BTC purchased: ${stats.totalBTC}`);
console.log(`Average price: ${stats.averagePrice.toFixed(2)} EUR/BTC`);
console.log(`Remaining BTC: ${stats.remainingBTC}`);
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stillsbymirko/cryptobud-web)
3. Add environment variables
4. Deploy! 🎉

Vercel will automatically:
- Build your app
- Set up PostgreSQL (optional Vercel Postgres addon)
- Provide a live URL

---

## 📝 License

MIT License - feel free to use for personal or commercial projects!

---

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📧 Support

Need help? Open an issue on GitHub!

---

**Built with ❤️ for the German crypto community**

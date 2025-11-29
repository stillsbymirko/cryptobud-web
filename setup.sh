#!/bin/bash

# CryptoBuddy Local Setup Script
# Setzt die lokale Entwicklungsumgebung auf

set -e

echo "🚀 CryptoBuddy Setup wird gestartet..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installiere Node.js 18+ von https://nodejs.org"
    exit 1
fi

echo "✅ Node.js Version: $(node -v)"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Erstelle .env.local Datei..."
    
    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)
    
    cat > .env.local << EOF
# Database (Supabase oder lokale Postgres)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$SECRET"

# Optional: CoinGecko API für Preisdaten
# COINGECKO_API_KEY=""
EOF
    
    echo "✅ .env.local erstellt mit generiertem NEXTAUTH_SECRET"
    echo ""
    echo "⚠️  WICHTIG: Bitte DATABASE_URL und DIRECT_URL in .env.local anpassen!"
    echo "   Für Supabase: Kopiere die Connection Strings aus dem Supabase Dashboard"
    echo "   Oder nutze lokale Postgres: postgresql://postgres:password@localhost:5432/cryptobud"
    echo ""
else
    echo "✅ .env.local existiert bereits"
fi

# Install dependencies
echo ""
echo "📦 Installiere Dependencies..."
npm install

echo ""
echo "🗄️  Datenbank Setup..."
echo "   Führe jetzt aus: npx prisma db push"
echo "   (Stelle sicher, dass DATABASE_URL in .env.local korrekt ist)"

read -p "Möchtest du npx prisma db push jetzt ausführen? (j/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    npx prisma db push
    echo "✅ Datenbank-Schema erstellt"
fi

echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "📚 Nächste Schritte:"
echo "   1. Bearbeite .env.local mit deinen Supabase-Credentials"
echo "   2. Starte dev server: npm run dev"
echo "   3. Öffne http://localhost:3000"
echo "   4. Registriere einen Account"
echo "   5. Importiere deine 21Bitcoin CSV-Datei"
echo ""
echo "📖 Weitere Infos: https://github.com/stillsbymirko/cryptobud-web"

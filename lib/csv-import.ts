import Papa from 'papaparse';

export interface Bitcoin21Row {
  id: string;
  exchange_name: string;
  depot_name: string;
  transaction_date: string;
  buy_asset: string;
  buy_amount: string;
  sell_asset: string;
  sell_amount: string;
  fee_asset: string;
  fee_amount: string;
  transaction_type: string;
  note: string;
  linked_transaction: string;
}

export interface ParsedTransaction {
  date: Date;
  cryptocurrency: string;
  amount: number;
  priceEUR: number;
  type: 'buy' | 'sell' | 'staking' | 'withdrawal';
  exchange: string;
  feeAmount?: number;
  feeAsset?: string;
  notes?: string;
}

export class CSVImportService {
  
  /**
   * Parse 21Bitcoin CSV format
   */
  static parse21Bitcoin(csvContent: string): ParsedTransaction[] {
    const result = Papa.parse<Bitcoin21Row>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    const transactions: ParsedTransaction[] = [];

    for (const row of result.data) {
      // Skip deposits (only EUR transfers)
      if (row.transaction_type === 'deposit') {
        continue;
      }

      // Handle BTC purchases (trades)
      if (row.transaction_type === 'trade' && row.buy_asset === 'BTC') {
        const buyAmount = parseFloat(row.buy_amount);
        const sellAmount = parseFloat(row.sell_amount);
        const feeAmount = parseFloat(row.fee_amount) || 0;

        // Calculate price per BTC including fees
        const totalCost = sellAmount + feeAmount;
        const pricePerBTC = totalCost / buyAmount;

        transactions.push({
          date: this.parseDate(row.transaction_date),
          cryptocurrency: 'BTC',
          amount: buyAmount,
          priceEUR: pricePerBTC,
          type: 'buy',
          exchange: '21bitcoin',
          feeAmount: feeAmount,
          feeAsset: row.fee_asset || 'EUR',
          notes: row.note,
        });
      }

      // Handle withdrawals
      if (row.transaction_type === 'withdrawal' && row.sell_asset === 'BTC') {
        const sellAmount = parseFloat(row.sell_amount);
        const feeAmount = parseFloat(row.fee_amount) || 0;

        transactions.push({
          date: this.parseDate(row.transaction_date),
          cryptocurrency: 'BTC',
          amount: sellAmount,
          priceEUR: 0, // Withdrawal, not a sale
          type: 'withdrawal',
          exchange: '21bitcoin',
          feeAmount: feeAmount,
          feeAsset: row.fee_asset || 'BTC',
          notes: row.note,
        });
      }
    }

    return transactions;
  }

  /**
   * Parse date from 21Bitcoin format: DD.MM.YYYY HH:MM:SS
   */
  private static parseDate(dateString: string): Date {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.');
    const [hours, minutes, seconds] = timePart.split(':');

    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );
  }

  /**
   * Calculate statistics from transactions
   */
  static calculateStats(transactions: ParsedTransaction[]) {
    const buys = transactions.filter(t => t.type === 'buy');
    const withdrawals = transactions.filter(t => t.type === 'withdrawal');

    const totalBTC = buys.reduce((sum, t) => sum + t.amount, 0);
    const totalCost = buys.reduce((sum, t) => sum + (t.amount * t.priceEUR), 0);
    const totalWithdrawn = withdrawals.reduce((sum, t) => sum + t.amount, 0);
    const remainingBTC = totalBTC - totalWithdrawn;
    const averagePrice = totalCost / totalBTC;

    return {
      totalBTC,
      totalCost,
      totalWithdrawn,
      remainingBTC,
      averagePrice,
      transactionCount: transactions.length,
    };
  }
}

import { ParsedTransaction } from './csv-import';

interface PurchaseRecord {
  date: Date;
  amount: number;
  pricePerUnit: number;
  remaining: number;
}

interface SaleResult {
  revenue: number;
  cost: number;
  taxableGain: number;
  taxFreeGain: number;
  usedPurchases: Array<{
    date: Date;
    amount: number;
    holdingDays: number;
  }>;
}

interface TaxReport {
  year: number;
  totalTaxableGains: number;
  totalTaxFreeGains: number;
  totalStakingRewards: number;
  stakingOverLimit: boolean;
  sales: SaleResult[];
}

export class TaxCalculationService {
  private static readonly HOLDING_PERIOD_DAYS = 365; // §23 EStG
  private static readonly STAKING_LIMIT_EUR = 256; // §22 Nr. 3 EStG

  /**
   * Calculate tax report using FIFO method
   */
  static calculateTaxReport(
    transactions: ParsedTransaction[],
    year: number
  ): TaxReport {
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const purchases: PurchaseRecord[] = [];
    const sales: SaleResult[] = [];
    let totalStakingRewards = 0;

    for (const transaction of sortedTransactions) {
      const transactionYear = transaction.date.getFullYear();

      if (transaction.type === 'buy') {
        // Add to FIFO queue
        purchases.push({
          date: transaction.date,
          amount: transaction.amount,
          pricePerUnit: transaction.priceEUR,
          remaining: transaction.amount,
        });
      } else if (transaction.type === 'sell' || transaction.type === 'withdrawal') {
        // Process sale/withdrawal with FIFO
        if (transactionYear === year) {
          const saleResult = this.processSale(
            transaction.amount,
            transaction.date,
            transaction.priceEUR || 0,
            purchases
          );
          sales.push(saleResult);
        } else {
          // Still need to update FIFO queue even for other years
          this.processSale(
            transaction.amount,
            transaction.date,
            transaction.priceEUR || 0,
            purchases
          );
        }
      } else if (transaction.type === 'staking' && transactionYear === year) {
        const rewardValue = transaction.amount * transaction.priceEUR;
        totalStakingRewards += rewardValue;
      }
    }

    const totalTaxableGains = sales.reduce((sum, s) => sum + s.taxableGain, 0);
    const totalTaxFreeGains = sales.reduce((sum, s) => sum + s.taxFreeGain, 0);

    return {
      year,
      totalTaxableGains,
      totalTaxFreeGains,
      totalStakingRewards,
      stakingOverLimit: totalStakingRewards > this.STAKING_LIMIT_EUR,
      sales,
    };
  }

  /**
   * Process a sale using FIFO method
   */
  private static processSale(
    sellAmount: number,
    sellDate: Date,
    sellPricePerUnit: number,
    purchases: PurchaseRecord[]
  ): SaleResult {
    let remainingToSell = sellAmount;
    let totalCost = 0;
    let taxableGain = 0;
    let taxFreeGain = 0;
    const usedPurchases: Array<{
      date: Date;
      amount: number;
      holdingDays: number;
    }> = [];

    while (remainingToSell > 0.0001 && purchases.length > 0) {
      const purchase = purchases[0];
      
      if (purchase.remaining <= 0) {
        purchases.shift();
        continue;
      }

      const amountToUse = Math.min(remainingToSell, purchase.remaining);
      const holdingDays = this.daysBetween(purchase.date, sellDate);
      const cost = amountToUse * purchase.pricePerUnit;
      const revenue = amountToUse * sellPricePerUnit;
      const gain = revenue - cost;

      // Check if holding period > 1 year (tax-free per §23 EStG)
      if (holdingDays >= this.HOLDING_PERIOD_DAYS) {
        taxFreeGain += gain;
      } else {
        taxableGain += gain;
      }

      totalCost += cost;
      usedPurchases.push({
        date: purchase.date,
        amount: amountToUse,
        holdingDays,
      });

      remainingToSell -= amountToUse;
      purchase.remaining -= amountToUse;

      if (purchase.remaining <= 0) {
        purchases.shift();
      }
    }

    const revenue = sellAmount * sellPricePerUnit;

    return {
      revenue,
      cost: totalCost,
      taxableGain,
      taxFreeGain,
      usedPurchases,
    };
  }

  /**
   * Get upcoming tax-free sales (within next year)
   */
  static getUpcomingTaxFreeSales(transactions: ParsedTransaction[]): Array<{
    date: Date;
    taxFreeDate: Date;
    amount: number;
    daysRemaining: number;
  }> {
    const now = new Date();
    const oneYearFromNow = new Date(now);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const buys = transactions.filter(t => t.type === 'buy');
    const events = [];

    for (const buy of buys) {
      const taxFreeDate = new Date(buy.date);
      taxFreeDate.setDate(taxFreeDate.getDate() + this.HOLDING_PERIOD_DAYS);

      if (taxFreeDate > now && taxFreeDate <= oneYearFromNow) {
        const daysRemaining = this.daysBetween(now, taxFreeDate);
        events.push({
          date: buy.date,
          taxFreeDate,
          amount: buy.amount,
          daysRemaining,
        });
      }
    }

    return events.sort((a, b) => a.taxFreeDate.getTime() - b.taxFreeDate.getTime());
  }

  /**
   * Calculate days between two dates
   */
  private static daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

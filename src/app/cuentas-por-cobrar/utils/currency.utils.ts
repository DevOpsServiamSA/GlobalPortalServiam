// Currency formatting utilities

import { Moneda } from '../interfaces/cxc.interfaces';

export class CurrencyUtils {
  /**
   * Formats a number as currency based on the currency type
   * @param amount Amount to format
   * @param moneda Currency code (PEN or USD)
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number, moneda: Moneda = 'PEN'): string {
    const locale = 'es-PE';
    const currencyCode = moneda === 'PEN' ? 'PEN' : 'USD';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Formats a number with thousand separators
   * @param amount Amount to format
   * @returns Formatted number string
   */
  static formatNumber(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Gets the currency symbol for a given currency
   * @param moneda Currency code
   * @returns Currency symbol
   */
  static getCurrencySymbol(moneda: Moneda): string {
    return moneda === 'PEN' ? 'S/' : '$';
  }

  /**
   * Parses a formatted currency string back to a number
   * @param currencyString Formatted currency string
   * @returns Parsed number
   */
  static parseCurrency(currencyString: string): number {
    // Remove currency symbols and thousand separators
    const cleaned = currencyString
      .replace(/[S/\$]/g, '')
      .replace(/,/g, '')
      .trim();

    return parseFloat(cleaned) || 0;
  }
}

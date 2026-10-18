export class Formatters {
  static formatDate(date: Date | string | number, locale: string, options?: Intl.DateTimeFormatOptions): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  }

  static formatTime(date: Date | string | number, locale: string, options?: Intl.DateTimeFormatOptions): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, options || {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }

  static formatCurrency(amount: number, locale: string, currency: string = 'IQD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatNumber(amount: number, locale: string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(amount);
  }

  static formatPercentage(value: number, locale: string): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}

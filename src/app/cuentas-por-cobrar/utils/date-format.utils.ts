// Date formatting utilities

export class DateFormatUtils {
  /**
   * Formats a date as DD/MM/YYYY
   * @param date Date to format
   * @returns Formatted date string
   */
  static formatDate(date: Date | string): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '-';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Formats a date as DD/MM/YYYY HH:mm
   * @param date Date to format
   * @returns Formatted date-time string
   */
  static formatDateTime(date: Date | string): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '-';
    }

    const dateStr = this.formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${dateStr} ${hours}:${minutes}`;
  }

  /**
   * Calculates the number of days between two dates
   * @param date1 First date
   * @param date2 Second date
   * @returns Number of days difference
   */
  static daysBetween(date1: Date | string, date2: Date | string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Calculates days overdue from a due date
   * @param dueDate Due date
   * @returns Number of days overdue (0 if not overdue)
   */
  static daysOverdue(dueDate: Date | string): number {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (due >= today) {
      return 0;
    }

    return this.daysBetween(due, today);
  }

  /**
   * Formats a relative time description (e.g., "hace 3 días")
   * @param date Date to format
   * @returns Relative time string
   */
  static formatRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();

    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
    }
  }

  /**
   * Checks if a date is overdue
   * @param dueDate Due date
   * @returns True if overdue, false otherwise
   */
  static isOverdue(dueDate: Date | string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return due < today;
  }

  /**
   * Gets the current date without time component
   * @returns Current date at midnight
   */
  static getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
}

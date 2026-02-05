import { Component, Input } from '@angular/core';
import { Moneda } from '../../interfaces/cxc.interfaces';
import { CurrencyUtils } from '../../utils/currency.utils';

export type TipoCard = 'total' | 'vencido' | 'por-vencer' | 'saldo-favor';

@Component({
  selector: 'app-estado-cuenta-card',
  templateUrl: './estado-cuenta-card.component.html',
  styleUrls: ['./estado-cuenta-card.component.css'],
  standalone: false
})
export class EstadoCuentaCardComponent {
  @Input() tipo: TipoCard = 'total';
  @Input() titulo: string = '';
  @Input() monto: number = 0;
  @Input() moneda: Moneda = 'PEN';
  @Input() icono: string = 'account_balance_wallet';
  @Input() descripcion?: string;

  get montoFormateado(): string {
    return CurrencyUtils.formatCurrency(this.monto, this.moneda);
  }

  get cardClasses(): string {
    const baseClasses = 'p-6 rounded-lg shadow-md border-l-4 transition-all hover:shadow-lg';

    switch (this.tipo) {
      case 'vencido':
        return `${baseClasses} bg-red-50 border-l-red-500`;
      case 'por-vencer':
        return `${baseClasses} bg-amber-50 border-l-serviam-alert`;
      case 'saldo-favor':
        return `${baseClasses} bg-serviam-primary/10 border-l-serviam-primary`;
      case 'total':
      default:
        return `${baseClasses} bg-gray-50 border-l-gray-500`;
    }
  }

  get iconoClasses(): string {
    switch (this.tipo) {
      case 'vencido':
        return 'text-red-600';
      case 'por-vencer':
        return 'text-serviam-alert';
      case 'saldo-favor':
        return 'text-serviam-primary';
      case 'total':
      default:
        return 'text-gray-600';
    }
  }

  get montoClasses(): string {
    switch (this.tipo) {
      case 'vencido':
        return 'text-red-700';
      case 'por-vencer':
        return 'text-serviam-alert';
      case 'saldo-favor':
        return 'text-serviam-primary';
      case 'total':
      default:
        return 'text-gray-700';
    }
  }
}

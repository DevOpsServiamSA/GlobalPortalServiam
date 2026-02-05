import { Injectable } from '@angular/core';
import {
  EmpresaCxC,
  ResumenCuenta,
  DetalleDeuda,
  HistorialPago,
  TipoDocumento,
  EstadoDocumento,
  Moneda
} from '../interfaces/cxc.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  private empresas: EmpresaCxC[] = [
    {
      id: 1,
      razonSocial: 'Polysol S.A.C.',
      ruc: '20123456789',
      direccion: 'Av. Los Girasoles 345, Lima',
      activo: true
    },
    {
      id: 2,
      razonSocial: 'TM Inmobiliaria S.A.C.',
      ruc: '20987654321',
      direccion: 'Jr. Las Begonias 567, Lima',
      activo: true
    }
  ];

  private detallesDeuda: DetalleDeuda[] = [
    // Polysol - Facturas
    {
      id: 1,
      empresaId: 1,
      numeroDocumento: 'F001-00001',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-10-15'),
      fechaVencimiento: new Date('2024-11-15'),
      montoOriginal: 15500,
      montoPendiente: 15500,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'VENCIDO',
      diasVencidos: 68,
      descripcion: 'Servicios de consultoría - Octubre 2024'
    },
    {
      id: 2,
      empresaId: 1,
      numeroDocumento: 'F001-00002',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-11-20'),
      fechaVencimiento: new Date('2024-12-20'),
      montoOriginal: 9800,
      montoPendiente: 9800,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'VENCIDO',
      diasVencidos: 33,
      descripcion: 'Servicios de mantenimiento - Noviembre 2024'
    },
    {
      id: 3,
      empresaId: 1,
      numeroDocumento: 'F001-00003',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-12-10'),
      fechaVencimiento: new Date('2025-01-10'),
      montoOriginal: 12300,
      montoPendiente: 12300,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Servicios profesionales - Diciembre 2024'
    },
    {
      id: 4,
      empresaId: 1,
      numeroDocumento: 'F001-00004',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2025-01-05'),
      fechaVencimiento: new Date('2025-02-05'),
      montoOriginal: 18700,
      montoPendiente: 18700,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Servicios de consultoría - Enero 2025'
    },
    {
      id: 5,
      empresaId: 1,
      numeroDocumento: 'F001-00005',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2025-01-15'),
      fechaVencimiento: new Date('2025-02-15'),
      montoOriginal: 14200,
      montoPendiente: 14200,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Servicios de auditoría - Enero 2025'
    },
    {
      id: 6,
      empresaId: 1,
      numeroDocumento: 'F001-00006',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-09-10'),
      fechaVencimiento: new Date('2024-10-10'),
      montoOriginal: 8500,
      montoPendiente: 2500,
      montoPagado: 6000,
      moneda: 'PEN',
      estado: 'PARCIALMENTE_PAGADO',
      diasVencidos: 104,
      descripcion: 'Servicios técnicos - Septiembre 2024'
    },
    {
      id: 7,
      empresaId: 1,
      numeroDocumento: 'F001-00007',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-08-15'),
      fechaVencimiento: new Date('2024-09-15'),
      montoOriginal: 11200,
      montoPendiente: 0,
      montoPagado: 11200,
      moneda: 'PEN',
      estado: 'PAGADO',
      diasVencidos: 0,
      descripcion: 'Servicios de capacitación - Agosto 2024'
    },
    {
      id: 8,
      empresaId: 1,
      numeroDocumento: 'F001-00008',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2025-01-20'),
      fechaVencimiento: new Date('2025-02-20'),
      montoOriginal: 12300,
      montoPendiente: 12300,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Servicios de soporte - Enero 2025'
    },
    // Polysol - Notas de débito
    {
      id: 9,
      empresaId: 1,
      numeroDocumento: 'ND01-00001',
      tipoDocumento: 'NOTA_DEBITO',
      fechaEmision: new Date('2024-11-25'),
      fechaVencimiento: new Date('2024-12-25'),
      montoOriginal: 850,
      montoPendiente: 850,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'VENCIDO',
      diasVencidos: 28,
      descripcion: 'Intereses por mora - F001-00001'
    },
    {
      id: 10,
      empresaId: 1,
      numeroDocumento: 'ND01-00002',
      tipoDocumento: 'NOTA_DEBITO',
      fechaEmision: new Date('2024-12-28'),
      fechaVencimiento: new Date('2025-01-28'),
      montoOriginal: 450,
      montoPendiente: 450,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Gastos administrativos adicionales'
    },

    // TM Inmobiliaria - Facturas
    {
      id: 11,
      empresaId: 2,
      numeroDocumento: 'F002-00001',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-11-01'),
      fechaVencimiento: new Date('2024-12-01'),
      montoOriginal: 8200,
      montoPendiente: 8200,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'VENCIDO',
      diasVencidos: 52,
      descripcion: 'Alquiler de oficina - Noviembre 2024'
    },
    {
      id: 12,
      empresaId: 2,
      numeroDocumento: 'F002-00002',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-12-01'),
      fechaVencimiento: new Date('2025-01-01'),
      montoOriginal: 8200,
      montoPendiente: 8200,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'VENCIDO',
      diasVencidos: 21,
      descripcion: 'Alquiler de oficina - Diciembre 2024'
    },
    {
      id: 13,
      empresaId: 2,
      numeroDocumento: 'F002-00003',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2025-01-01'),
      fechaVencimiento: new Date('2025-02-01'),
      montoOriginal: 8200,
      montoPendiente: 8200,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Alquiler de oficina - Enero 2025'
    },
    {
      id: 14,
      empresaId: 2,
      numeroDocumento: 'F002-00004',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-11-15'),
      fechaVencimiento: new Date('2024-12-15'),
      montoOriginal: 3500,
      montoPendiente: 3500,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'VENCIDO',
      diasVencidos: 38,
      descripcion: 'Mantenimiento de inmueble'
    },
    {
      id: 15,
      empresaId: 2,
      numeroDocumento: 'F002-00005',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-12-20'),
      fechaVencimiento: new Date('2025-01-20'),
      montoOriginal: 4800,
      montoPendiente: 4800,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Servicios generales - Diciembre 2024'
    },
    {
      id: 16,
      empresaId: 2,
      numeroDocumento: 'F002-00006',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-10-01'),
      fechaVencimiento: new Date('2024-11-01'),
      montoOriginal: 8200,
      montoPendiente: 0,
      montoPagado: 8200,
      moneda: 'PEN',
      estado: 'PAGADO',
      diasVencidos: 0,
      descripcion: 'Alquiler de oficina - Octubre 2024'
    },
    {
      id: 17,
      empresaId: 2,
      numeroDocumento: 'F002-00007',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-09-01'),
      fechaVencimiento: new Date('2024-10-01'),
      montoOriginal: 8200,
      montoPendiente: 0,
      montoPagado: 8200,
      moneda: 'PEN',
      estado: 'PAGADO',
      diasVencidos: 0,
      descripcion: 'Alquiler de oficina - Septiembre 2024'
    },
    // TM Inmobiliaria - Nota de crédito (saldo a favor)
    {
      id: 18,
      empresaId: 2,
      numeroDocumento: 'NC02-00001',
      tipoDocumento: 'NOTA_CREDITO',
      fechaEmision: new Date('2024-12-10'),
      fechaVencimiento: new Date('2025-01-10'),
      montoOriginal: -2500,
      montoPendiente: -2500,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Devolución por servicios no prestados'
    },
    {
      id: 19,
      empresaId: 2,
      numeroDocumento: 'ND02-00001',
      tipoDocumento: 'NOTA_DEBITO',
      fechaEmision: new Date('2024-12-05'),
      fechaVencimiento: new Date('2025-01-05'),
      montoOriginal: 550,
      montoPendiente: 550,
      montoPagado: 0,
      moneda: 'PEN',
      estado: 'PENDIENTE',
      diasVencidos: 0,
      descripcion: 'Intereses por mora'
    },
    {
      id: 20,
      empresaId: 2,
      numeroDocumento: 'F002-00008',
      tipoDocumento: 'FACTURA',
      fechaEmision: new Date('2024-11-10'),
      fechaVencimiento: new Date('2024-12-10'),
      montoOriginal: 5200,
      montoPendiente: 2000,
      montoPagado: 3200,
      moneda: 'PEN',
      estado: 'PARCIALMENTE_PAGADO',
      diasVencidos: 43,
      descripcion: 'Servicios adicionales - Noviembre 2024'
    }
  ];

  private historialPagos: HistorialPago[] = [
    // Polysol
    {
      id: 1,
      empresaId: 1,
      documentoRelacionado: 'F001-00007',
      fechaPago: new Date('2024-09-20'),
      montoPagado: 11200,
      moneda: 'PEN',
      metodoPago: 'Transferencia bancaria',
      numeroOperacion: 'TRF-20240920-001',
      observaciones: 'Pago completo'
    },
    {
      id: 2,
      empresaId: 1,
      documentoRelacionado: 'F001-00006',
      fechaPago: new Date('2024-11-15'),
      montoPagado: 6000,
      moneda: 'PEN',
      metodoPago: 'Transferencia bancaria',
      numeroOperacion: 'TRF-20241115-002',
      observaciones: 'Pago parcial - queda saldo pendiente'
    },
    // TM Inmobiliaria
    {
      id: 3,
      empresaId: 2,
      documentoRelacionado: 'F002-00006',
      fechaPago: new Date('2024-11-05'),
      montoPagado: 8200,
      moneda: 'PEN',
      metodoPago: 'Depósito en cuenta',
      numeroOperacion: 'DEP-20241105-001',
      observaciones: 'Pago mensualidad octubre'
    },
    {
      id: 4,
      empresaId: 2,
      documentoRelacionado: 'F002-00007',
      fechaPago: new Date('2024-10-05'),
      montoPagado: 8200,
      moneda: 'PEN',
      metodoPago: 'Transferencia bancaria',
      numeroOperacion: 'TRF-20241005-003',
      observaciones: 'Pago mensualidad septiembre'
    },
    {
      id: 5,
      empresaId: 2,
      documentoRelacionado: 'F002-00008',
      fechaPago: new Date('2024-12-15'),
      montoPagado: 3200,
      moneda: 'PEN',
      metodoPago: 'Transferencia bancaria',
      numeroOperacion: 'TRF-20241215-004',
      observaciones: 'Pago parcial'
    }
  ];

  constructor() { }

  getEmpresas(): EmpresaCxC[] {
    return [...this.empresas];
  }

  getEmpresaById(id: number): EmpresaCxC | undefined {
    return this.empresas.find(e => e.id === id);
  }

  getResumenCuenta(empresaId: number): ResumenCuenta | undefined {
    const empresa = this.getEmpresaById(empresaId);
    if (!empresa) return undefined;

    const deudas = this.detallesDeuda.filter(d => d.empresaId === empresaId);

    let totalDeuda = 0;
    let deudaVencida = 0;
    let deudaPorVencer = 0;
    let saldoFavor = 0;
    let ultimoMovimiento = new Date(0);
    let diasMorosidad = 0;

    deudas.forEach(deuda => {
      if (deuda.estado === 'PAGADO') return;

      const monto = deuda.montoPendiente;

      if (deuda.tipoDocumento === 'NOTA_CREDITO') {
        saldoFavor += Math.abs(monto);
      } else {
        totalDeuda += monto;

        if (deuda.estado === 'VENCIDO') {
          deudaVencida += monto;
          diasMorosidad = Math.max(diasMorosidad, deuda.diasVencidos);
        } else if (deuda.estado === 'PENDIENTE' || deuda.estado === 'PARCIALMENTE_PAGADO') {
          deudaPorVencer += monto;
        }
      }

      if (deuda.fechaEmision > ultimoMovimiento) {
        ultimoMovimiento = deuda.fechaEmision;
      }
    });

    return {
      empresaId,
      empresaNombre: empresa.razonSocial,
      totalDeuda,
      deudaVencida,
      deudaPorVencer,
      saldoFavor,
      ultimoMovimiento,
      diasMorosidad
    };
  }

  getDetallesDeuda(empresaId: number): DetalleDeuda[] {
    return this.detallesDeuda
      .filter(d => d.empresaId === empresaId)
      .sort((a, b) => b.fechaEmision.getTime() - a.fechaEmision.getTime());
  }

  getHistorialPagos(empresaId: number): HistorialPago[] {
    return this.historialPagos
      .filter(h => h.empresaId === empresaId)
      .sort((a, b) => b.fechaPago.getTime() - a.fechaPago.getTime());
  }

  getDetalleDeudaById(id: number): DetalleDeuda | undefined {
    return this.detallesDeuda.find(d => d.id === id);
  }
}

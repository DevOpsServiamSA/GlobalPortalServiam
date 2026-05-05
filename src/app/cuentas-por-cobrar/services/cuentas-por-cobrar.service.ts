import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ResumenCuenta,
  DetalleDeuda,
  HistorialPago,
  PaginatedResponse,
  FiltrosDetalleDeuda,
  FiltrosHistorialPagos
} from '../interfaces/cxc.interfaces';
import { MockDataService } from './mock-data.service';
import { ClientesApiService } from './clientes-api.service';
import { EstadoCuentaApiService } from './estado-cuenta-api.service';
import { EnviosApiService } from './envios-api.service';
import { ClienteEmailsApiService } from './cliente-emails-api.service';
import { EmpresaMapperService } from './empresa-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class CuentasPorCobrarService {

  constructor(
    private mockDataService: MockDataService,
    private clientesApiService: ClientesApiService,
    private estadoCuentaApiService: EstadoCuentaApiService,
    private enviosApiService: EnviosApiService,
    private clienteEmailsApiService: ClienteEmailsApiService,
    private empresaMapperService: EmpresaMapperService
  ) { }

  /**
   * Get account summary for a company
   * @deprecated Use getClientesFromApi instead for real data
   */
  getResumenCuenta(empresaId: number): Observable<ResumenCuenta | undefined> {
    return of(this.mockDataService.getResumenCuenta(empresaId)).pipe(
      delay(400)
    );
  }

  /**
   * Get debt details for a company with optional filters and pagination
   * @deprecated Use getClientesFromApi instead for real data
   */
  getDetallesDeuda(
    empresaId: number,
    filtros?: FiltrosDetalleDeuda,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResponse<DetalleDeuda>> {
    let detalles = this.mockDataService.getDetallesDeuda(empresaId);

    // Apply filters
    if (filtros) {
      detalles = detalles.filter(detalle => {
        if (filtros.tipoDocumento && detalle.tipoDocumento !== filtros.tipoDocumento) {
          return false;
        }
        if (filtros.estado && detalle.estado !== filtros.estado) {
          return false;
        }
        if (filtros.moneda && detalle.moneda !== filtros.moneda) {
          return false;
        }
        if (filtros.fechaDesde) {
          const fechaDesde = new Date(filtros.fechaDesde);
          if (detalle.fechaEmision < fechaDesde) {
            return false;
          }
        }
        if (filtros.fechaHasta) {
          const fechaHasta = new Date(filtros.fechaHasta);
          if (detalle.fechaEmision > fechaHasta) {
            return false;
          }
        }
        return true;
      });
    }

    // Calculate pagination
    const total = detalles.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = detalles.slice(startIndex, endIndex);

    const response: PaginatedResponse<DetalleDeuda> = {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages
    };

    return of(response).pipe(delay(500));
  }

  /**
   * Get payment history for a company with optional filters and pagination
   * @deprecated Use getHistorialEnviosFromApi instead for real data
   */
  getHistorialPagos(
    empresaId: number,
    filtros?: FiltrosHistorialPagos,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResponse<HistorialPago>> {
    let pagos = this.mockDataService.getHistorialPagos(empresaId);

    // Apply filters
    if (filtros) {
      pagos = pagos.filter(pago => {
        if (filtros.busqueda) {
          const search = filtros.busqueda.toLowerCase();
          const matchDoc = pago.documentoRelacionado.toLowerCase().includes(search);
          const matchOp = pago.numeroOperacion?.toLowerCase().includes(search);
          if (!matchDoc && !matchOp) {
            return false;
          }
        }
        if (filtros.fechaDesde) {
          const fechaDesde = new Date(filtros.fechaDesde);
          if (pago.fechaPago < fechaDesde) {
            return false;
          }
        }
        if (filtros.fechaHasta) {
          const fechaHasta = new Date(filtros.fechaHasta);
          if (pago.fechaPago > fechaHasta) {
            return false;
          }
        }
        return true;
      });
    }

    // Calculate pagination
    const total = pagos.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = pagos.slice(startIndex, endIndex);

    const response: PaginatedResponse<HistorialPago> = {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages
    };

    return of(response).pipe(delay(400));
  }

  /**
   * Get a single debt detail by ID
   * @deprecated Mock data - use API services directly
   */
  getDetalleDeudaById(id: number): Observable<DetalleDeuda | undefined> {
    return of(this.mockDataService.getDetalleDeudaById(id)).pipe(
      delay(200)
    );
  }

  /**
   * Get total amount paid for a company in a date range
   * @deprecated Mock data - use API services directly
   */
  getTotalPagado(empresaId: number, fechaDesde?: Date, fechaHasta?: Date): Observable<number> {
    return this.getHistorialPagos(empresaId, { fechaDesde, fechaHasta }, 1, 1000).pipe(
      map(response => {
        return response.data.reduce((sum, pago) => sum + pago.montoPagado, 0);
      })
    );
  }

  // ============================================
  // NEW API V2 METHODS
  // ============================================

  /**
   * Obtener clientes desde API V2
   * @param empresaId ID de empresa legacy (1-6)
   * @param fechaCorte Fecha de corte en formato YYYY-MM-DD
   * @param filtros Filtros adicionales
   * @param page Página actual
   * @param pageSize Tamaño de página
   */
  getClientesFromApi(
    empresaId: number,
    fechaCorte: string,
    filtros?: Partial<{
      ruc: string;
      codigo: string;
      razonSocial: string;
      activo: boolean;
      soloConSaldo: boolean;
      moneda: 'S/.' | 'USD' | null;
    }>,
    page: number = 1,
    pageSize: number = 10
  ) {
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(empresaId);

    return this.clientesApiService.getClientes({
      empresa: codigoEmpresa,
      fechaCorte,
      page,
      pageSize,
      ...filtros
    });
  }

  /**
   * Obtener historial de envíos desde API V2
   * @param empresaId ID de empresa legacy (1-6)
   * @param filtros Filtros de búsqueda
   * @param page Página actual
   * @param pageSize Tamaño de página
   */
  getHistorialEnviosFromApi(
    empresaId: number,
    filtros?: Partial<{
      fechaDesde: string;
      fechaHasta: string;
      usuario: string;
      estado: string;
      searchTerm: string;
    }>,
    page: number = 1,
    pageSize: number = 10
  ) {
    const codigoEmpresa = this.empresaMapperService.toCodigoEmpresa(empresaId);

    return this.enviosApiService.getHistorialEnvios({
      empresa: codigoEmpresa,
      page,
      pageSize,
      ...filtros
    });
  }
}

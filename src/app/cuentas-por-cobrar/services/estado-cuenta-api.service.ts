import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PreviewEstadoCuentaRequestDto,
  CodigoEmpresa
} from '../interfaces/cxc-api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EstadoCuentaApiService {
  private readonly baseUrl = environment.apiCuentasPorCobrar;

  constructor(private http: HttpClient) { }

  /**
   * Generar preview de estado de cuenta (PDF)
   */
  previewEstadoCuenta(
    empresa: CodigoEmpresa,
    request: PreviewEstadoCuentaRequestDto
  ): Observable<Blob> {
    const params = new HttpParams().set('empresa', empresa);

    return this.http.post(
      `${this.baseUrl}/estado-cuenta/preview`,
      request,
      { params, responseType: 'blob' }
    );
  }

  /**
   * Abrir PDF en nueva pestaña
   */
  abrirPdfEnNuevaTab(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Liberar el objeto URL después de un tiempo
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  /**
   * Descargar PDF
   */
  descargarPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

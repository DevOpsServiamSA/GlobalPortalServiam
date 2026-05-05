import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener token para todas las requests que no sean de login
    const token = this.authService.getToken();
    const isLoginRequest = req.url.includes('/security/api/login');
    const isCxCRequest = req.url.includes('/api/v2/'); // Detectar requests de Cuentas por Cobrar

    let authReq = req;

    // Agregar token si existe y no es request de login
    if (token && !isLoginRequest) {
      let headers = req.headers.set('Authorization', `Bearer ${token}`);

      // Si es request de CxC, agregar X-User-Code y X-User-Roles
      if (isCxCRequest) {
        const userInfo = this.authService.getCurrentUser();
        if (userInfo?.codigoEmpleado) {
          headers = headers.set('X-User-Code', userInfo.codigoEmpleado);
        }
        if (userInfo?.roles?.length) {
          headers = headers.set('X-User-Roles', userInfo.roles.join(','));
        }
      }

      authReq = req.clone({ headers });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es error 401 (Unauthorized) y no es el login, hacer logout
        if (error.status === 401 && !isLoginRequest) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}

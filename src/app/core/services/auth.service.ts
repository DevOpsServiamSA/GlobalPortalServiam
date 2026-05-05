import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserInfo, ValidateTokenResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API_URL = `${environment.apiAuth}`;
    private readonly TOKEN_KEY = 'mda_auth_token';
    private readonly USER_KEY = 'mda_user_info';

    private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
            tap((response) => {
                this.setAuthData(response);
            }),
            catchError((error) => {
                console.error('Login error:', error);
                throw error;
            })
        );
    }

    validateToken(): Observable<boolean> {
        const token = this.getToken();
        if (!token) {
            return of(false);
        }

        return this.http.post<ValidateTokenResponse>(`${this.API_URL}/validate`, {}).pipe(
            map((response) => {
                if (response.valid) {
                    // Actualizar información del usuario si es válida
                    const userInfo: UserInfo = {
                        idUsuario: parseInt(response.user.id),
                        usuarioLogin: response.user.username,
                        email: response.user.email,
                        codigoEmpleado: response.user.codigoEmpleado,
                        roles: response.user.roles
                    };
                    this.updateUserInfo(userInfo);
                    return true;
                }
                return false;
            }),
            catchError(() => {
                this.logout();
                return of(false);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        // Verificar si el token no ha expirado
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getCurrentUser(): UserInfo | null {
        return this.currentUserSubject.value;
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles.includes(role.toLowerCase()) || false;
    }

    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser();
        return roles.some(role => user?.roles.includes(role.toLowerCase())) || false;
    }

    getUserArea(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id_area || null;
        } catch (error) {
            return null;
        }
    }

    private setAuthData(response: LoginResponse): void {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
    }

    private updateUserInfo(userInfo: UserInfo): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
        this.currentUserSubject.next(userInfo);
    }

    private getUserFromStorage(): UserInfo | null {
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
}

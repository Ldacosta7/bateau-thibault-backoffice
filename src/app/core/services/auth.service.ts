// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface TokenResponse {
  access:  string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl    = 'http://127.0.0.1:8000';
  private tokenKey   = 'access_token';
  private refreshKey = 'refresh_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/api/token/`, { username, password }).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, { username, email, password });
  }

  refreshToken(): Observable<TokenResponse> {
    const refresh = this.getRefreshToken();
    return this.http.post<TokenResponse>(`${this.baseUrl}/api/token/refresh/`, { refresh }).pipe(
      tap(res => this.saveTokens(res))
    );
  }

  saveTokens(res: TokenResponse): void {
    localStorage.setItem(this.tokenKey,   res.access);
    localStorage.setItem(this.refreshKey, res.refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  isConnected(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
  }
}
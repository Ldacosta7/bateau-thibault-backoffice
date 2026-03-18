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

  private baseUrl  = 'http://127.0.0.1:8000';
  private tokenKey = 'access_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/api/token/`, { username, password }).pipe(
      tap(res => localStorage.setItem(this.tokenKey, res.access))
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, { username, email, password });
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isConnected(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
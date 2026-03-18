import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  username: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiBaseUrl}/api/auth`;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  currentUser = signal<CurrentUser | null>(null);

  login(username: string, password: string): Observable<CurrentUser> {
    return this.http.post<CurrentUser>(`${this.apiUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  logout(): void {
    this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.currentUser.set(null);
          this.router.navigate(['/login']);
        }
      });
  }

  me(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(tap(user => this.currentUser.set(user)));
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }
}
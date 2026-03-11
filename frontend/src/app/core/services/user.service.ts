import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserManagementDto {
  id: string;
  username: string;
  role: 'ADMIN' | 'PROJECT_MANAGER';
  enabled: boolean;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: 'ADMIN' | 'PROJECT_MANAGER';
  enabled?: boolean;
}

export interface UpdateUserDto {
  role?: 'ADMIN' | 'PROJECT_MANAGER';
  enabled?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly apiUrl = `${environment.apiBaseUrl}/api/users`;
  private readonly http = inject(HttpClient);

  listUsers(): Observable<UserManagementDto[]> {
    return this.http.get<UserManagementDto[]>(this.apiUrl, { withCredentials: true });
  }

  createUser(payload: CreateUserDto): Observable<UserManagementDto> {
    return this.http.post<UserManagementDto>(this.apiUrl, payload, { withCredentials: true });
  }

  updateUser(id: string, payload: UpdateUserDto): Observable<UserManagementDto> {
    return this.http.put<UserManagementDto>(`${this.apiUrl}/${id}`, payload, { withCredentials: true });
  }

  disableUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/disable`, {}, { withCredentials: true });
  }

  changePassword(payload: ChangePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/password`, payload, { withCredentials: true });
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePageComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  editing = false;
  editUser: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.loading = true;
    this.http.get<{ userId: string, valid: boolean }>(`${environment.apiBaseUrl}/auth/verify`).subscribe({
      next: (verify) => {
        if (verify && verify.userId) {
          this.http.get<any>(`${environment.apiBaseUrl}/users/${verify.userId}`).subscribe({
            next: (user) => {
              this.user = user;
              this.editUser = { ...user };
              this.loading = false;
            },
            error: () => {
              this.error = 'Failed to load user profile.';
              this.loading = false;
            },
          });
        } else {
          this.error = 'User not authenticated.';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Failed to verify user.';
        this.loading = false;
      },
    });
  }

  startEdit(): void {
    this.editing = true;
    this.editUser = { ...this.user };
  }

  cancelEdit(): void {
    this.editing = false;
    this.editUser = { ...this.user };
  }

  saveEdit(): void {
    this.http.patch<any>(`${environment.apiBaseUrl}/users/${this.user.id}`, this.editUser).subscribe({
      next: (user) => {
        this.user = user;
        this.editing = false;
      },
      error: () => {
        this.error = 'Failed to update profile.';
      },
    });
  }
} 
import { Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated()) {
      // User is logged in, allow access
      return true;
    }

    // User is not logged in, redirect to login page with return URL
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });

    return false;
  }
}

import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { TokenInterceptor } from './auth/services/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    provideAnimations(),
    provideHttpClient(withInterceptors([])),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    importProvidersFrom(MatSnackBarModule),
  ],
};

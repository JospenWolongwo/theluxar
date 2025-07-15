import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Log environment information at startup to confirm which environment is being used
console.log(`Application starting with production=${environment.production}`);
console.log(`API Base URL: ${environment.apiBaseUrl}`);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

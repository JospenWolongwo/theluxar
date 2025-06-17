import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Shared module for components, directives, and services used across the application
 */
@NgModule({
  imports: [CommonModule, MatSnackBarModule],
  exports: [MatSnackBarModule],
  declarations: [],
})
export class SharedModule {}

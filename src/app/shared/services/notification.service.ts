import { Injectable } from '@angular/core';
import type { MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Default notification duration
  private defaultDuration = 5000;

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a notification message
   * @param message The message to display
   * @param action Optional action text (e.g., 'Dismiss')
   * @param type The type of notification (error, success, info, warning)
   * @param duration How long to display the notification in ms (default: 5000ms)
   */
  // eslint-disable-next-line max-params
  public show(
    message: string,
    action = 'Dismiss',
    type: NotificationType = 'info',
    duration = this.defaultDuration
  ): void {
    const config: MatSnackBarConfig = {
      duration: duration,
      panelClass: [`notification-${type}`],
      verticalPosition: 'top',
      horizontalPosition: 'center',
    };

    this.snackBar.open(message, action, config);
  }

  /**
   * Show an error notification
   * @param message The error message to display
   * @param action Optional action text (default: 'Dismiss')
   * @param duration How long to display the notification in ms (default: 8000ms)
   */
  public showError(message: string, action = 'Dismiss', duration = 8000): void {
    this.show(message, action, 'error', duration);
  }

  /**
   * Show a success notification
   * @param message The success message to display
   * @param action Optional action text (default: 'OK')
   * @param duration How long to display the notification in ms (default: 3000ms)
   */
  public showSuccess(message: string, action = 'OK', duration = 3000): void {
    this.show(message, action, 'success', duration);
  }

  /**
   * Show an info notification
   * @param message The info message to display
   * @param action Optional action text (default: 'OK')
   * @param duration How long to display the notification in ms (default: 5000ms)
   */
  public showInfo(message: string, action = 'OK'): void {
    this.show(message, action, 'info');
  }

  /**
   * Show a warning notification
   * @param message The warning message to display
   * @param action Optional action text (default: 'OK')
   * @param duration How long to display the notification in ms (default: 5000ms)
   */
  public showWarning(message: string, action = 'OK'): void {
    this.show(message, action, 'warning');
  }
}

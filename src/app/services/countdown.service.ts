import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class CountdownService {
  private countdownSubject = new BehaviorSubject<CountdownTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  /**
   * Start a countdown timer
   * @param endTime End time as Date object or timestamp
   * @returns Observable of countdown time
   */
  startCountdown(endTime: Date | number): Observable<CountdownTime> {
    const endTimestamp = endTime instanceof Date ? endTime.getTime() : endTime;
    
    return interval(1000).pipe(
      map(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTimestamp - now);
        
        const totalSeconds = Math.floor(timeLeft / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return { hours, minutes, seconds, totalSeconds };
      }),
      takeWhile(time => time.totalSeconds > 0, true)
    );
  }

  /**
   * Get a countdown for flash sale (default 12 hours from now)
   */
  getFlashSaleCountdown(): Observable<CountdownTime> {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 12); // 12 hours from now
    
    return this.startCountdown(endTime);
  }

  /**
   * Get a countdown for a specific duration
   * @param hours Hours to countdown
   * @param minutes Minutes to countdown
   * @param seconds Seconds to countdown
   */
  getCustomCountdown(hours: number, minutes: number, seconds: number): Observable<CountdownTime> {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);
    endTime.setMinutes(endTime.getMinutes() + minutes);
    endTime.setSeconds(endTime.getSeconds() + seconds);
    
    return this.startCountdown(endTime);
  }

  /**
   * Format time as two digits
   * @param time Time value
   * @returns Formatted time string
   */
  formatTime(time: number): string {
    return time.toString().padStart(2, '0');
  }

  /**
   * Check if countdown has expired
   * @param countdownTime Countdown time object
   * @returns True if expired
   */
  isExpired(countdownTime: CountdownTime): boolean {
    return countdownTime.totalSeconds <= 0;
  }
} 
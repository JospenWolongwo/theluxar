import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import type { Screen, ScreenSize } from '../shared/types';
import { SCREEN_SIZES } from '../shared/utils';
import { FooterComponent } from './components/footer/footer.component';
import { NavBarComponent } from './components/navbar/navbar.component';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  host: {
    class: 'flex-col',
  },
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TheLuxar';
  subscription: Subscription = new Subscription();
  currentScreenSize: ScreenSize = {
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    ltSm: false,
    ltMd: false,
    ltLg: false,
    ltXl: false,
    gtXs: false,
    gtSm: false,
    gtMd: false,
    gtLg: false,
  };

  constructor(
    private responsive: BreakpointObserver,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Handle responsive screen sizes
    const screenSizes: Screen[] = ['ltSm', 'ltLg'];

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize] = state.matches;
        })
      );
    });
    
    // Check authentication state for returning users
    this.authService.handleAuthReturn().catch(error => {
      console.error('Error handling authentication return:', error);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

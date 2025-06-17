import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { TEAM_MEMBERS } from '../../shared/data';
import type { TeamMember } from '../../shared/interfaces';
import type { Screen, ScreenSize } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import { FeedbackComponent } from '../components/feedback/feedback.component';
import { NewsletterComponent } from '../components/newsletter/newsletter.component';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, NewsletterComponent, FeedbackComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
})
export class AboutPageComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();

  constructor(private responsive: BreakpointObserver) {}

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

  teamMembers: TeamMember[] = TEAM_MEMBERS;

  ngOnInit(): void {
    const screenSizes: Screen[] = ['ltSm', 'ltLg'];

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize] = state.matches;
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

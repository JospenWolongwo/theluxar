import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SERVICE_CATEGORIES } from '../../shared/data';
import type { ServiceCategory } from '../../shared/interfaces';
import type { Screen, ScreenSize } from '../../shared/types';
import { SCREEN_SIZES } from '../../shared/utils';
import { NewsletterComponent } from '../components/newsletter/newsletter.component';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { ServiceCategoriesService } from '../services/service-categories.service';

@Component({
  selector: 'app-service-page',
  standalone: true,
  imports: [CommonModule, NewsletterComponent, StarRatingComponent],
  templateUrl: './service-page.component.html',
  styleUrl: './service-page.component.scss',
})
export class ServicePageComponent implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();

  constructor(
    private responsive: BreakpointObserver,
    private serviceCategoriesService: ServiceCategoriesService
  ) {}

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

  serviceCategories: ServiceCategory[] = [];
  isLoading = true;
  error = false;

  ngOnInit(): void {
    const screenSizes: Screen[] = ['ltSm', 'ltLg'];

    screenSizes.forEach((screenSize) => {
      this.subscription.add(
        this.responsive.observe([SCREEN_SIZES[screenSize]]).subscribe((state) => {
          this.currentScreenSize[screenSize] = state.matches;
        })
      );
    });

    this.loadServiceCategories();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Load service categories from the service
   */
  private loadServiceCategories(): void {
    this.isLoading = true;
    this.error = false;

    this.subscription.add(
      this.serviceCategoriesService.getServiceCategories().subscribe({
        next: (categories) => {
          this.serviceCategories = categories;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = true;
          this.isLoading = false;
          
          // Use fallback data
          this.serviceCategories = SERVICE_CATEGORIES;
        }
      })
    );
  }
}

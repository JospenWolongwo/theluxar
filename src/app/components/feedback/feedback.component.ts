import { CommonModule } from '@angular/common';
import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Component, HostListener, Input } from '@angular/core';
import { REVIEWS } from '../../../shared/data/reviews.data';
import type { Review } from '../../../shared/types';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isMobile = false;
  @Input() isTablet = false;

  reviews: Review[] = REVIEWS;
  currentSlide = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderInterval: any;
  reviewsPerPage = 3;
  totalPages = 0;

  ngOnInit(): void {
    this.updateReviewsPerPage();
    this.totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
    this.startSlider();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngAfterViewInit(): void {
    this.setupIndicators();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
    this.stopSlider();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateReviewsPerPage();
    this.totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
    this.updateSlider();
  }

  startSlider(): void {
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopSlider(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide(): void {
    const totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
    this.currentSlide = (this.currentSlide + 1) % totalPages;
    this.updateSlider();
  }

  goToSlide(index: number): void {
    const totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
    this.currentSlide = index % totalPages;
    this.updateSlider();
    this.startSlider();
  }

  updateReviewsPerPage(): void {
    if (this.isMobile) {
      this.reviewsPerPage = 1;
    } else if (this.isTablet) {
      this.reviewsPerPage = 2;
    } else {
      this.reviewsPerPage = 3;
    }
    this.totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
  }

  updateSlider(): void {
    const slider = document.querySelector('.slider') as HTMLElement;
    const indicators = document.querySelectorAll('.indicator');

    if (slider) {
      const slideWidth = 100 / this.reviewsPerPage;
      const translateValue = -this.currentSlide * slideWidth * this.reviewsPerPage;
      slider.style.transform = `translateX(${translateValue}%)`;

      // Update indicators
      indicators.forEach((indicator, index) => {
        if (index === this.currentSlide) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
  }

  setupIndicators(): void {
    const indicators = document.querySelectorAll('.indicator');

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }

  // Get reviews for current page
  get currentPageReviews(): Review[] {
    const startIndex = this.currentSlide * this.reviewsPerPage;

    return this.reviews.slice(startIndex, startIndex + this.reviewsPerPage);
  }

  // Get number of indicators needed
  get indicators(): number[] {
    return Array(Math.ceil(this.reviews.length / this.reviewsPerPage))
      .fill(0)
      .map((_, i) => i);
  }
}

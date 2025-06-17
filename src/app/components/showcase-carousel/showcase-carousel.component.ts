import { CommonModule } from '@angular/common';
import type { AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Component, HostListener, Input } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import type { ShowcaseItem } from '../../../shared/types';

@Component({
  selector: 'app-showcase-carousel',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './showcase-carousel.component.html',
  styleUrls: ['./showcase-carousel.component.scss'],
})
export class ShowcaseCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isMobile = false;
  @Input() isTablet = false;
  @Input() showcaseItems: ShowcaseItem[] = [];

  currentSlide = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sliderInterval: any;
  itemsPerPage = 1;
  totalPages = 0;

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fab);
  }

  ngOnInit(): void {
    this.updateItemsPerPage();
    this.totalPages = Math.ceil(this.showcaseItems.length / this.itemsPerPage);
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
    this.updateItemsPerPage();
    this.totalPages = Math.ceil(this.showcaseItems.length / this.itemsPerPage);
    this.updateSlider();
  }

  startSlider(): void {
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 8000);
  }

  stopSlider(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  nextSlide(): void {
    const totalPages = Math.ceil(this.showcaseItems.length / this.itemsPerPage);
    this.currentSlide = (this.currentSlide + 1) % totalPages;
    this.updateSlider();
  }

  goToSlide(index: number): void {
    this.stopSlider();
    const totalPages = Math.ceil(this.showcaseItems.length / this.itemsPerPage);
    this.currentSlide = index % totalPages;
    this.updateSlider();
    this.startSlider();
  }

  updateItemsPerPage(): void {
    this.itemsPerPage = 1;
    this.totalPages = Math.ceil(this.showcaseItems.length / this.itemsPerPage);
  }

  updateSlider(): void {
    const slider = document.querySelector('.showcase-slider') as HTMLElement;
    const indicators = document.querySelectorAll('.carousel-indicator');

    if (slider) {
      const slideWidth = 100 / this.itemsPerPage;
      const translateValue = -this.currentSlide * slideWidth * this.itemsPerPage;
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
    const indicators = document.querySelectorAll('.carousel-indicator');

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });
  }

  // Get showcase items for current page
  get currentPageItems(): ShowcaseItem[] {
    const startIndex = this.currentSlide * this.itemsPerPage;

    return this.showcaseItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Get number of indicators needed
  get indicators(): number[] {
    return Array(Math.ceil(this.showcaseItems.length / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i);
  }
}

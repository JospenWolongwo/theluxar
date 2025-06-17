import { CommonModule } from '@angular/common';
import type { OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../../../shared/types/product.type';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-gallery.component.html',
  styleUrls: ['./product-gallery.component.scss'],
})
export class ProductGalleryComponent implements OnChanges {
  @Input() product!: Product;
  @Input() productName = '';
  @Input() mainImage = '';
  @Input() galleryImages: string[] = [];
  @Input() isMobile = false;
  @Input() isTablet = false;

  allImages: string[] = [];
  selectedImage = '';
  zoomLevel = 1;
  isZoomed = false;
  currentIndex = 0;
  showZoomHint = true;

  constructor(private library: FaIconLibrary) {
    this.library.addIconPacks(fas, far, fab);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      // Update properties based on the product input
      this.productName = this.product.name;
      this.mainImage = this.product.imageUrl || '';

      // Use additional images if available, or create a dummy array with the main image
      this.galleryImages = this.product.galleryImages || [];

      // If no gallery images are available but we have a main image, use that
      if (this.galleryImages.length === 0 && this.product.imageUrl) {
        this.galleryImages = [this.product.imageUrl];
      }

      this.setupGallery();
    } else if (changes['mainImage'] || changes['galleryImages']) {
      this.setupGallery();
    }
  }

  setupGallery(): void {
    // Setup the gallery with all available images
    // For consistency and to avoid losing images, don't filter out duplicates
    this.allImages = [];

    // Add main image first if it exists
    if (this.mainImage) {
      this.allImages.push(this.mainImage);
    }

    // Add all gallery images, even if they're identical to the main image
    if (this.galleryImages && this.galleryImages.length > 0) {
      this.allImages.push(...this.galleryImages);
    }

    // Fallback if there are no images
    if (this.allImages.length === 0) {
      this.allImages.push('/assets/images/placeholder.png');
    }

    // Set the first image as selected
    this.selectedImage = this.allImages[0];
    this.currentIndex = 0;
  }

  selectImage(image: string, index: number): void {
    this.selectedImage = image;
    this.currentIndex = index;
    this.isZoomed = false;
    this.zoomLevel = 1;
  }

  toggleZoom(event: MouseEvent): void {
    if (this.isZoomed) {
      // Reset zoom state
      this.isZoomed = false;
      this.zoomLevel = 1;
    } else {
      // Enable zoom
      this.isZoomed = true;
      this.zoomLevel = 2;

      // Apply zoom at click position
      this.applyZoom(event);
    }
  }

  applyZoom(event: MouseEvent): void {
    if (!this.isZoomed) {
      return;
    }

    const image = event.currentTarget as HTMLElement;
    const { left, top, width, height } = image.getBoundingClientRect();

    // Calculate position percentages
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    // Set transform origin
    image.style.transformOrigin = `${x}% ${y}%`;
  }

  // Navigation methods
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.allImages.length) % this.allImages.length;
    this.selectedImage = this.allImages[this.currentIndex];
    this.isZoomed = false;
    this.zoomLevel = 1;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.allImages.length;
    this.selectedImage = this.allImages[this.currentIndex];
    this.isZoomed = false;
    this.zoomLevel = 1;
  }
}

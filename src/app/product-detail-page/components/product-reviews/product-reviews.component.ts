/* eslint-disable max-lines */
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Product } from '../../../../shared/types';
import type { Review } from '../../../../shared/types/product.type';
import { StarRatingComponent } from '../../../components/star-rating/star-rating.component';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRatingComponent, FontAwesomeModule],
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss'],
})
export class ProductReviewsComponent implements OnInit {
  @Input() product!: Product;
  @Input() isMobile = false;
  @Input() isTablet = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  reviewForm: FormGroup;
  isSubmitting = false;
  isReviewSubmitted = false;
  previewImageUrl: string | null = null;
  selectedFile: File | null = null;

  constructor(private library: FaIconLibrary, private fb: FormBuilder) {
    this.library.addIconPacks(fas, far, fab);

    // Initialize the review form
    this.reviewForm = this.fb.group({
      rating: [5, Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      title: ['', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Calculate the average rating from all reviews
   */
  getAverageRating(): number {
    if (!this.product.reviews?.length) {
      return 0;
    }

    const sum = this.product.reviews.reduce((total, review) => total + review.rating, 0);

    return sum / this.product.reviews.length;
  }

  /**
   * Get the count of reviews with a specific rating
   */
  getRatingCount(rating: number): number {
    if (!this.product.reviews?.length) {
      return 0;
    }

    return this.product.reviews.filter((review) => review.rating === rating).length;
  }

  /**
   * Calculate the percentage of reviews with a specific rating
   */
  getRatingPercentage(rating: number): number {
    if (!this.product.reviews?.length) {
      return 0;
    }

    const count = this.getRatingCount(rating);

    return (count / this.product.reviews.length) * 100;
  }

  /**
   * Update helpful or not helpful count for a review
   * @param review The review to update
   * @param isHelpful Whether the update is for helpful (true) or not helpful (false)
   */
  updateHelpful(review: Review, isHelpful: boolean): void {
    if (isHelpful) {
      if (!review.helpful) {
        review.helpful = 0;
      }
      review.helpful += 1;
    } else {
      if (!review.notHelpful) {
        review.notHelpful = 0;
      }
      review.notHelpful += 1;
    }
  }

  /**
   * Handle rating change from the interactive star rating component
   */
  onRatingChange(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  /**
   * Trigger the file input click event
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle file selection for profile image
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.match(/image\/*/) || file.size > 2 * 1024 * 1024) {
        alert('Please select a valid image file (max 2MB)');

        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result as string;

        // Update form value with the data URL
        this.reviewForm.patchValue({
          imageUrl: this.previewImageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove selected image
   */
  removeImage(): void {
    this.previewImageUrl = null;
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.reviewForm.patchValue({
      imageUrl: '',
    });
  }

  /**
   * Submit the review form
   */
  submitReview(): void {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reviewForm.controls).forEach((key) => {
        const control = this.reviewForm.get(key);
        control?.markAsTouched();
      });

      return;
    }

    this.isSubmitting = true;

    // Create a new review from form values
    const formValues = this.reviewForm.value;
    const newReview: Review = {
      id: `review-${Date.now()}`,
      username: formValues.username,
      title: formValues.title,
      comment: formValues.comment,
      rating: formValues.rating,
      date: new Date(),
      verified: false,
      helpful: 0,
      notHelpful: 0,
    };

    // Only add imageUrl if it's provided
    if (formValues.imageUrl) {
      newReview.imageUrl = formValues.imageUrl;
    }

    // Initialize reviews array if it doesn't exist
    if (!this.product.reviews) {
      this.product.reviews = [];
    }

    // Add the new review
    setTimeout(() => {
      this.product.reviews?.unshift(newReview);
      this.isSubmitting = false;
      this.isReviewSubmitted = true;

      // Reset form and image preview after successful submission
      this.reviewForm.reset({
        rating: 5,
      });
      this.previewImageUrl = null;
      this.selectedFile = null;

      // Scroll to reviews section
      document.querySelector('.reviews-title')?.scrollIntoView({ behavior: 'smooth' });
    }, 1000); // Simulate API delay
  }
}

import type { OnChanges, SimpleChanges } from '@angular/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import type { ProductRating } from '../../../shared/types';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent implements OnChanges {
  @Input() rating: ProductRating | undefined = 0;
  @Input() readonly = true;
  @Input() fontSize = 0.7;
  @Input() maxRating = 5;
  @Input() showCount = false;
  @Input() totalReviews = 0;

  displayRating = 0;
  // eslint-disable-next-line keyword-spacing
  @Input() set editable(value: boolean) {
    if (value) {
      this.readonly = false;
    }
  }
  @Output() ratingChanged = new EventEmitter<number>();

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rating']) {
      if (typeof this.rating === 'number') {
        this.displayRating = this.rating;
      } else if (this.rating && typeof this.rating === 'object') {
        this.displayRating = this.rating.average;
        if (!this.totalReviews && this.rating.count) {
          this.totalReviews = this.rating.count;
        }
      } else {
        this.displayRating = 0;
      }
    }
  }

  setRating(value: number) {
    if (!this.readonly) {
      this.displayRating = value;
      this.rating = value;
      this.ratingChanged.emit(value);
    }
  }
}

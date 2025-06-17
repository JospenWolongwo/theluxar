import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
})
export class NewsletterComponent {
  @Input() isMobile = false;
  @Input() isTablet = false;
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  onSubmit(): void {
    if (this.emailControl.valid) {
      // Handle form submission
      this.emailControl.reset();
    }
  }
}

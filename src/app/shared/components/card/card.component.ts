import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      @if (header()) {
        <div class="px-6 py-4 border-b border-gray-200">
          {{ header() }}
        </div>
      }

      <div class="px-6 py-4">
        <ng-content />
      </div>

      @if (footer()) {
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {{ footer() }}
        </div>
      }
    </div>
  `,
})
export class CardComponent {
  header = input<string | undefined>();
  footer = input<string | undefined>();
}

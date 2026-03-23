import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center py-8">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"
      ></div>
    </div>
  `,
})
export class LoadingComponent {}

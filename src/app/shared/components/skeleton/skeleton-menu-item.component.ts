import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-menu-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-4 p-4 bg-white rounded-xl shadow-sm animate-pulse">
      <!-- Skeleton da imagem -->
      <div class="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>

      <!-- Skeleton do conteúdo -->
      <div class="flex-1 space-y-2">
        <!-- Título -->
        <div class="h-5 bg-gray-200 rounded w-2/3"></div>

        <!-- Descrição -->
        <div class="space-y-1">
          <div class="h-3 bg-gray-200 rounded"></div>
          <div class="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>

        <!-- Preço -->
        <div class="h-6 bg-gray-200 rounded w-24 mt-3"></div>
      </div>
    </div>
  `,
})
export class SkeletonMenuItemComponent {}
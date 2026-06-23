import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <!-- Skeleton da imagem -->
      <div class="w-full h-48 bg-gray-200"></div>

      <!-- Skeleton do conteúdo -->
      <div class="p-4 space-y-3">
        <!-- Título -->
        <div class="h-5 bg-gray-200 rounded w-3/4"></div>

        <!-- Subtítulo -->
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>

        <!-- Linhas de texto -->
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 rounded"></div>
          <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>

        <!-- Rodapé com avaliação e tempo -->
        <div class="flex items-center justify-between pt-2">
          <div class="h-4 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  `,
})
export class SkeletonCardComponent {}
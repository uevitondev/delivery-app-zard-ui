import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ErrorInfo {
  message: string;
  stack?: string;
  url: string;
  timestamp: Date;
  userAgent: string;
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error-boundary.component.html',
  styleUrl: './error-boundary.component.css',
})
export class ErrorBoundaryComponent implements OnInit, OnDestroy {
  readonly error = signal<ErrorInfo | null>(null);
  readonly isOnline = signal<boolean>(navigator.onLine);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.isOnline.set(true));
      window.removeEventListener('offline', () => this.isOnline.set(false));
    }
  }

  retry() {
    this.error.set(null);
    window.location.reload();
  }

  goHome() {
    this.error.set(null);
    window.location.href = '/';
  }
}
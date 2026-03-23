import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevBadgeComponent } from '@/shared/components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevBadgeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('deliveryapp-zardui');
}

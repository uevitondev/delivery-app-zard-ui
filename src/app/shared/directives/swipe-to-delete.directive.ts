import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[swipeToDelete]',
  standalone: true,
})
export class SwipeToDeleteDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  private startX = 0;
  private currentX = 0;
  private isDragging = false;
  private readonly threshold = 100; // Distância mínima para considerar swipe

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
    this.elementRef.nativeElement.style.transition = 'none';
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    this.currentX = event.touches[0].clientX;
    const diffX = this.currentX - this.startX;

    // Apenas permite swipe para esquerda (valores negativos)
    if (diffX < 0) {
      this.elementRef.nativeElement.style.transform = `translateX(${Math.max(diffX, -this.threshold)}px)`;
    }
  }

  @HostListener('touchend')
  onTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.elementRef.nativeElement.style.transition = 'transform 0.3s ease';

    const diffX = this.currentX - this.startX;

    // Se passou do threshold, manter posição (para animação de exclusão)
    // Caso contrário, voltar para posição original
    if (diffX < -this.threshold) {
      this.elementRef.nativeElement.style.transform = `translateX(-${this.threshold}px)`;
      // Emitir evento ou chamar callback
      this.onSwipeComplete();
    } else {
      this.elementRef.nativeElement.style.transform = 'translateX(0)';
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.startX = event.clientX;
    this.isDragging = true;
    this.elementRef.nativeElement.style.transition = 'none';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    this.currentX = event.clientX;
    const diffX = this.currentX - this.startX;

    if (diffX < 0) {
      this.elementRef.nativeElement.style.transform = `translateX(${Math.max(diffX, -this.threshold)}px)`;
    }
  }

  @HostListener('mouseup')
  onMouseUp() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.elementRef.nativeElement.style.transition = 'transform 0.3s ease';

    const diffX = this.currentX - this.startX;

    if (diffX < -this.threshold) {
      this.elementRef.nativeElement.style.transform = `translateX(-${this.threshold}px)`;
      this.onSwipeComplete();
    } else {
      this.elementRef.nativeElement.style.transform = 'translateX(0)';
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.isDragging) {
      this.onMouseUp();
    }
  }

  private onSwipeComplete() {
    // Disparar evento customizado
    const event = new CustomEvent('swipeToDelete', {
      bubbles: true,
      detail: { element: this.elementRef.nativeElement },
    });
    this.elementRef.nativeElement.dispatchEvent(event);
  }
}
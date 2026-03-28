import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should render empty cart recovery actions', async () => {
    const fixture = TestBed.createComponent(CartComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ainda esta vazia');
    expect(compiled.textContent).toContain('Ver colecoes');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CollectionsComponent } from './collections.component';

describe('CollectionsComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CollectionsComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should render themed collections', async () => {
    const fixture = TestBed.createComponent(CollectionsComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Colecoes');
    expect(compiled.textContent).toContain('Noite de pizza');
    expect(compiled.textContent).toContain('Pedido rapido');
  });
});

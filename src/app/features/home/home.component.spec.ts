import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HomeComponent } from './home.component';
import { provideDomainAdapters } from '@/shared/core/contracts/domain-tokens';

describe('HomeComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideHttpClient(), ...provideDomainAdapters()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('should render curated sections on home', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Selecao personalizada');
    expect(compiled.textContent).toContain('Pedidos prontos para o momento');
    expect(compiled.textContent).toContain('Promocoes para o seu momento');
  });
});

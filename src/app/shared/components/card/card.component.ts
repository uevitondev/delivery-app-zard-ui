import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { mergeClasses, type ClassValue } from '@/shared/utils/merge-classes';
import { ButtonComponent } from '@/shared/components/button/button.component';

let nextCardId = 0;

const cardClasses = 'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm';
const cardHeaderClasses = mergeClasses(
  '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6',
  'has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
);
const cardBodyClasses = 'px-6';
const cardFooterClasses = 'flex items-center px-6 [.border-t]:pt-6';

@Component({
  selector: 'z-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-slot': 'card',
    '[class]': 'classes()',
    '[attr.aria-labelledby]': 'titleId()',
    '[attr.aria-describedby]': 'descriptionId()',
  },
  template: `
    @if (zTitle()) {
      <div [class]="headerClasses()" data-slot="card-header">
        <div class="leading-none font-semibold" [id]="titleId()" data-slot="card-title">
          <ng-container *ngTemplateOutlet="asTemplate(zTitle()) ?? null"></ng-container>
          @if (!asTemplate(zTitle())) {
            {{ zTitle() }}
          }
        </div>

        @if (zDescription()) {
          <div class="text-muted-foreground text-sm" [id]="descriptionId()" data-slot="card-description">
            <ng-container *ngTemplateOutlet="asTemplate(zDescription()) ?? null"></ng-container>
            @if (!asTemplate(zDescription())) {
              {{ zDescription() }}
            }
          </div>
        }

        @if (zAction()) {
          <button
            z-button
            type="button"
            zType="link"
            class="col-start-2 row-span-2 row-start-1 self-start justify-self-end"
            data-slot="card-action"
            (click)="zActionClick.emit()"
          >
            {{ zAction() }}
          </button>
        }
      </div>
    }

    <div [class]="bodyClasses()" data-slot="card-content">
      <ng-content />
    </div>

    <div [class]="footerClasses()" data-slot="card-footer">
      @if (zFooter()) {
        {{ zFooter() }}
      }
      <ng-content select="[card-footer]" />
    </div>
  `,
  styles: `
    [data-slot='card-footer']:empty {
      display: none;
    }
  `,
})
export class CardComponent {
  private readonly id = `z-card-${++nextCardId}`;

  readonly class = input<ClassValue>('', { alias: 'class' });
  readonly zFooterBorder = input(false);
  readonly zHeaderBorder = input(false);
  readonly zAction = input('');
  readonly zDescription = input<string | TemplateRef<void>>();
  readonly zTitle = input<string | TemplateRef<void>>();
  readonly zFooter = input<string | undefined>();

  readonly zActionClick = output<void>();

  protected readonly classes = computed(() => mergeClasses(cardClasses, this.class()));
  protected readonly bodyClasses = computed(() => cardBodyClasses);
  protected readonly footerClasses = computed(() =>
    mergeClasses(cardFooterClasses, this.zFooterBorder() || this.zFooter() ? 'border-t' : ''),
  );
  protected readonly headerClasses = computed(() =>
    mergeClasses(cardHeaderClasses, this.zHeaderBorder() ? 'border-b' : ''),
  );
  protected readonly titleId = computed(() => (this.zTitle() ? `${this.id}-title` : null));
  protected readonly descriptionId = computed(() =>
    this.zDescription() ? `${this.id}-description` : null,
  );

  protected asTemplate(value: string | TemplateRef<void> | undefined): TemplateRef<void> | null {
    return value instanceof TemplateRef ? value : null;
  }
}

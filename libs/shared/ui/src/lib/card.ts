import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

let nextCardId = 0;

/** Project the persistent heading with uiCardHeader; the rest is the collapsible body. */
@Component({
  selector: 'ui-card',
  template: `
    <section class="ui-card-surface">
      <div class="ui-card-header"><ng-content select="[uiCardHeader]" /></div>
      <div class="ui-card-content" [id]="contentId" [hidden]="collapsible() && !expanded()">
        <ng-content />
      </div>
      @if (collapsible()) {
        <div class="ui-card-footer">
          <button
            type="button"
            class="ui-card-toggle"
            [attr.aria-label]="label() + (expanded() ? ' einklappen' : ' ausklappen')"
            [attr.aria-expanded]="expanded()"
            [attr.aria-controls]="contentId"
            (click)="expanded.set(!expanded())"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" [class.ui-card-arrow-expanded]="expanded()">
              <path
                d="m6 9 6 6 6-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      }
    </section>
  `,
  host: {
    class: 'ui-card',
    '[class.ui-card-stacked]': 'collapsible()',
    '[attr.data-border]': 'border()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly expanded = model(false);
  readonly border = input<'primary' | 'secondary'>('primary');
  readonly label = input('Card');
  protected readonly contentId = `ui-card-content-${nextCardId++}`;
}

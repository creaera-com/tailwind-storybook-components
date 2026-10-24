import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

let nextChipId = 0;

/** A removable tag. The owner updates its list in response to removed. */
@Component({
  selector: 'ui-chip',
  template: `
    <span [id]="labelId"><ng-content /></span>
    <button
      type="button"
      class="ui-chip-close"
      [disabled]="disabled()"
      [attr.aria-labelledby]="removeId + ' ' + labelId"
      (click)="remove($event)"
    >
      <span class="sr-only" [id]="removeId">Entfernen:</span>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="m7 7 10 10M17 7 7 17"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  `,
  host: { class: 'ui-chip', '[attr.data-disabled]': 'disabled()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removed = output<void>();
  protected readonly labelId = `ui-chip-label-${nextChipId++}`;
  protected readonly removeId = `${this.labelId}-remove`;
  protected remove(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled()) this.removed.emit();
  }
}

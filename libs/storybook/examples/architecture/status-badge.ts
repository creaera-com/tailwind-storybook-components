import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span>{{ label() }}</span>',
  host: { '[style.color]': "'var(--ui-status-' + tone() + ')'" },
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<'normal' | 'caution' | 'dangerous'>('normal');
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

/** An action chip; native button attributes remain the entire API. */
@Component({
  selector: 'button[uiChip]',
  template: '<ng-content />',
  host: { class: 'ui-chip', type: 'button' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {}

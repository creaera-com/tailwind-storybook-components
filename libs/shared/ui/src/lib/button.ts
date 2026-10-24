import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text';

/** A native button: use normal disabled, type, click and aria-label attributes. */
@Component({
  selector: 'button[uiButton]',
  template: '<ng-content />',
  host: { class: 'ui-button', '[attr.data-variant]': 'variant()', '[attr.type]': 'type()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}

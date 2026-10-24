import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  DoCheck,
  InjectionToken,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';

let nextInputId = 0;
const FIELD = new InjectionToken<FormField>('UI form field');

/** Keep native HTML input/textarea attributes, validation and Angular value accessors. */
@Directive({
  selector: 'input[uiInput], textarea[uiInput]',
  host: {
    class: 'ui-input',
    '[attr.id]': 'id()',
    '[attr.aria-invalid]': 'field?.invalid() ? "true" : null',
    '[attr.aria-describedby]': 'description()',
  },
})
export class Input implements DoCheck {
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  /** @internal Tracks a replacement FormControl without replacing native value accessors. */
  readonly formControl = signal<AbstractControl | null>(null);
  ngDoCheck(): void {
    this.formControl.set(this.ngControl?.control ?? null);
  }
  readonly id = input(`ui-input-${nextInputId++}`);
  readonly describedBy = input('', { alias: 'aria-describedby' });
  protected readonly field = inject(FIELD, { optional: true });
  protected readonly description = computed(() => {
    const ids = [this.describedBy(), this.field?.invalid() ? this.field.errorId() : ''];
    return ids.filter(Boolean).join(' ') || null;
  });
}

/** One labeled native control per field; validation remains owned by Angular Forms. */
@Component({
  selector: 'ui-form-field',
  template: `
    <label class="ui-field-label" [attr.for]="control()?.id()">{{ label() }}</label>
    <ng-content />
    @if (invalid()) {
      <p class="ui-field-error" [id]="errorId()" aria-live="polite">
        {{ error() || 'Bitte Eingabe prüfen.' }}
      </p>
    }
  `,
  providers: [{ provide: FIELD, useExisting: forwardRef(() => FormField) }],
  host: { class: 'ui-form-field', '[class.ui-field-invalid]': 'invalid()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly error = input('');
  protected readonly control = contentChild(Input);
  private readonly formState = signal(false);
  readonly invalid = computed(() => !!this.error() || this.formState());
  readonly errorId = computed(() => `${this.control()?.id() ?? 'ui-field'}-error`);

  constructor() {
    effect((onCleanup) => {
      const control = this.control()?.formControl();
      const sync = () =>
        this.formState.set(!!control && control.invalid && (control.dirty || control.touched));
      sync();
      const subscription = control?.events.subscribe(sync);
      onCleanup(() => subscription?.unsubscribe());
    });
  }
}

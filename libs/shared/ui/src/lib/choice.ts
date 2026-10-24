import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive()
export abstract class BooleanControl implements ControlValueAccessor {
  readonly checked = model(false);
  readonly disabled = input(false);
  protected readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};
  writeValue(value: boolean | null): void {
    this.checked.set(value === true);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.formDisabled.set(value);
  }
  protected update(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }
}

@Component({
  selector: 'ui-checkbox',
  template: `<label class="ui-choice"
    ><input
      class="ui-checkbox"
      type="checkbox"
      [checked]="checked()"
      [disabled]="isDisabled()"
      (change)="update($event)"
      (blur)="onTouched()" />
    <span><ng-content /></span
  ></label>`,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkbox extends BooleanControl {}

@Component({
  selector: 'ui-switch',
  template: `<label class="ui-choice"
    ><input
      class="ui-switch"
      type="checkbox"
      role="switch"
      [checked]="checked()"
      [disabled]="isDisabled()"
      (change)="update($event)"
      (blur)="onTouched()" />
    <span><ng-content /></span
  ></label>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleSwitch), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitch extends BooleanControl {}

/** Native radio semantics and Angular Forms work without a custom value accessor. */
@Directive({ selector: 'input[type=radio][uiRadio]', host: { class: 'ui-radio', type: 'radio' } })
export class Radio {}

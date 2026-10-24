import { ChangeDetectionStrategy, Component, ElementRef, input, model } from '@angular/core';
import { UiOption } from './option';

@Component({
  selector: 'ui-button-group',
  template: `<div
    class="ui-button-group"
    [attr.role]="multiple() ? 'group' : 'radiogroup'"
    [attr.aria-label]="label()"
  >
    @for (option of options(); track option.value) {
      <button
        type="button"
        class="ui-button"
        [disabled]="disabled() || option.disabled"
        [attr.role]="multiple() ? null : 'radio'"
        [attr.aria-checked]="multiple() ? null : selected().includes(option.value)"
        [attr.aria-pressed]="multiple() ? selected().includes(option.value) : null"
        [attr.data-selected]="selected().includes(option.value)"
        [tabIndex]="multiple() || option.value === tabStop() ? 0 : -1"
        (keydown)="navigate($event, option.value)"
        (click)="choose(option.value)"
      >
        {{ option.label }}
      </button>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroup {
  readonly options = input.required<readonly UiOption[]>();
  readonly label = input.required<string>();
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly selected = model<readonly string[]>([]);
  constructor(private readonly element: ElementRef<HTMLElement>) {}
  protected tabStop(): string | undefined {
    const enabled = this.options().filter((o) => !o.disabled);
    return enabled.find((o) => this.selected().includes(o.value))?.value ?? enabled[0]?.value;
  }
  protected choose(value: string): void {
    if (this.disabled() || this.options().find((o) => o.value === value)?.disabled) return;
    this.selected.update((current) =>
      this.multiple()
        ? current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        : [value],
    );
  }
  protected navigate(event: KeyboardEvent, value: string): void {
    if (
      this.multiple() ||
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
    )
      return;
    event.preventDefault();
    const options = this.options().filter((o) => !o.disabled);
    const index = options.findIndex((o) => o.value === value);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + options.length) %
            options.length;
    const option = options[next];
    if (!option) return;
    this.choose(option.value);
    const buttons =
      this.element.nativeElement.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    buttons[next]?.focus();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { FormField, Input } from './form-field';

let nextAutocompleteId = 0;

/** String suggestions with manual selection; free text remains a valid input value. */
@Component({
  selector: 'ui-autocomplete',
  imports: [FormField, Input],
  template: `
    <ui-form-field [label]="label()" [error]="visibleError()">
      <input
        #textInput
        uiInput
        type="text"
        role="combobox"
        autocomplete="off"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? listId : null"
        [attr.aria-activedescendant]="
          open() && active() >= 0 ? listId + '-option-' + active() : null
        "
        [attr.aria-required]="required() ? 'true' : null"
        (input)="update($event)"
        (focus)="show()"
        (blur)="blur()"
        (keydown)="navigate($event)"
      />
    </ui-form-field>
    @if (open()) {
      <div class="ui-autocomplete-popup">
        <div role="listbox" [id]="listId" [attr.aria-label]="label() + ': Vorschläge'">
          @for (option of matches(); track option; let index = $index) {
            <div
              #optionElement
              role="option"
              class="ui-autocomplete-option"
              [id]="listId + '-option-' + index"
              [attr.aria-selected]="active() === index"
              (pointerdown)="$event.preventDefault()"
              (click)="choose(option)"
            >
              {{ option }}
            </div>
          }
        </div>
        @if (!matches().length) {
          <p class="ui-autocomplete-empty" role="status">Keine Vorschläge gefunden.</p>
        }
      </div>
    }
  `,
  host: { class: 'ui-autocomplete' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Autocomplete implements ControlValueAccessor, DoCheck {
  readonly label = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly value = model('');
  readonly placeholder = input('');
  readonly error = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly listId = `ui-autocomplete-${nextAutocompleteId++}`;
  protected readonly open = signal(false);
  protected readonly active = signal(-1);
  protected readonly matches = computed(() => {
    const query = this.value().trim().toLocaleLowerCase();
    return [...new Set(this.options())].filter((option) =>
      option.toLocaleLowerCase().includes(query),
    );
  });
  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly formControl = signal<AbstractControl | null>(null);
  private readonly formDisabled = signal(false);
  private readonly formInvalid = signal(false);
  protected readonly required = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly visibleError = computed(
    () => this.error() || (this.formInvalid() ? 'Bitte Eingabe prüfen.' : ''),
  );
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly textInput = viewChild.required<ElementRef<HTMLInputElement>>('textInput');
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionElement');
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Assign directly to avoid the NgControl / NG_VALUE_ACCESSOR provider cycle.
    if (this.ngControl) this.ngControl.valueAccessor = this;
    effect((onCleanup) => {
      const control = this.formControl();
      const sync = () => {
        this.formInvalid.set(!!control && control.invalid && (control.dirty || control.touched));
        this.required.set(control?.hasValidator(Validators.required) ?? false);
      };
      sync();
      const subscription = control?.events.subscribe(sync);
      onCleanup(() => subscription?.unsubscribe());
    });
    effect(() => {
      if (this.isDisabled()) this.close();
      if (this.active() >= this.matches().length) this.active.set(-1);
    });
  }
  ngDoCheck(): void {
    this.formControl.set(this.ngControl?.control ?? null);
  }
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    this.close();
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  protected show(): void {
    if (!this.isDisabled()) {
      this.open.set(true);
      this.active.set(-1);
    }
  }
  protected update(event: Event): void {
    if (this.isDisabled()) return;
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
    this.show();
  }
  protected choose(option: string): void {
    if (this.isDisabled()) return;
    this.value.set(option);
    this.onChange(option);
    this.textInput().nativeElement.focus();
    this.close();
  }
  protected blur(): void {
    this.close();
    this.onTouched();
  }
  private close(): void {
    this.open.set(false);
    this.active.set(-1);
  }
  protected navigate(event: KeyboardEvent): void {
    if (this.isDisabled() || event.altKey || event.ctrlKey || event.metaKey || event.isComposing)
      return;
    const count = this.matches().length;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open.set(true);
      const next =
        event.key === 'ArrowDown'
          ? this.active() + 1
          : this.active() === -1
            ? count - 1
            : this.active() - 1;
      this.active.set(count ? (next + count) % count : -1);
    } else if ((event.key === 'Home' || event.key === 'End') && this.open() && this.active() >= 0) {
      event.preventDefault();
      this.active.set(event.key === 'Home' ? 0 : count - 1);
    } else if (event.key === 'Enter') {
      const option = this.open() ? this.matches()[this.active()] : undefined;
      if (option !== undefined) {
        event.preventDefault();
        this.choose(option);
      } else this.close();
      return;
    } else if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    } else if (event.key === 'Tab') {
      this.close();
      return;
    } else return;
    afterNextRender(
      () =>
        this.optionElements()[this.active()]?.nativeElement.scrollIntoView?.({ block: 'nearest' }),
      { injector: this.injector },
    );
  }
  @HostListener('document:click', ['$event'])
  protected outside(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.close();
  }
}

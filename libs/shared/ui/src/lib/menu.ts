import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostListener,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { UiOption } from './option';

let nextMenuId = 0;

@Directive()
export abstract class MenuBase {
  readonly label = input.required<string>();
  readonly options = input.required<readonly UiOption[]>();
  readonly disabled = input(false);
  readonly selected = output<string>();
  protected readonly open = signal(false);
  protected readonly visible = computed(() => this.open() && !this.disabled());
  protected readonly menuId = `ui-menu-${nextMenuId++}`;
  constructor(protected readonly element: ElementRef<HTMLElement>) {
    effect(() => {
      if (this.disabled()) this.open.set(false);
    });
  }
  protected toggle(): void {
    if (this.disabled()) return;
    this.open.update((value) => !value);
    if (this.open()) this.focusItem(0);
  }
  protected choose(option: UiOption): void {
    if (this.disabled() || option.disabled) return;
    this.selected.emit(option.value);
    this.close(true);
  }
  protected close(restore = false): void {
    this.open.set(false);
    if (restore)
      this.element.nativeElement.querySelector<HTMLButtonElement>('[aria-haspopup]')?.focus();
  }
  protected triggerKey(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open.set(true);
      this.focusItem(event.key === 'ArrowUp' ? -1 : 0);
    }
  }
  protected menuKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
      return;
    }
    if (event.key === 'Tab') {
      this.close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = this.items();
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }
  private items(): HTMLButtonElement[] {
    return [
      ...this.element.nativeElement.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      ),
    ];
  }
  private focusItem(index: number): void {
    // Wait for Angular to render the conditional menu before moving focus.
    setTimeout(() => {
      if (this.visible()) {
        const items = this.items();
        items.at(index)?.focus();
      }
    });
  }
  @HostListener('document:click', ['$event'])
  protected outside(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.close();
  }
  @HostListener('focusout', ['$event'])
  protected focusOut(event: FocusEvent): void {
    if (event.relatedTarget && !this.element.nativeElement.contains(event.relatedTarget as Node))
      this.close();
  }
}

const menuTemplate = `@if (visible()) {
  <div class="ui-menu" role="menu" [id]="menuId" [attr.aria-label]="label()" (keydown)="menuKey($event)">
    @for (option of options(); track option.value) {
      <button type="button" role="menuitem" tabindex="-1" [disabled]="option.disabled"
        (click)="choose(option)">{{ option.label }}</button>
    }
  </div>
}`;
const arrow =
  '<svg aria-hidden="true" class="ui-icon" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" /></svg>';

@Component({
  selector: 'ui-dropdown',
  template: `<div class="ui-menu-anchor">
    <button
      type="button"
      class="ui-button"
      [disabled]="disabled()"
      aria-haspopup="menu"
      [attr.aria-expanded]="visible()"
      [attr.aria-controls]="visible() ? menuId : null"
      (click)="toggle()"
      (keydown)="triggerKey($event)"
    >
      {{ label() }}${arrow}</button
    >${menuTemplate}
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dropdown extends MenuBase {}

@Component({
  selector: 'ui-option-button',
  template: `<div class="ui-menu-anchor">
    <div class="ui-split-button">
      <button type="button" class="ui-button" [disabled]="disabled()" (click)="action.emit()">
        {{ label() }}
      </button>
      <button
        type="button"
        class="ui-button"
        [disabled]="disabled()"
        [attr.aria-label]="label() + ': Optionen'"
        aria-haspopup="menu"
        [attr.aria-expanded]="visible()"
        [attr.aria-controls]="visible() ? menuId : null"
        (click)="toggle()"
        (keydown)="triggerKey($event)"
      >
        ${arrow}
      </button>
    </div>
    ${menuTemplate}
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionButton extends MenuBase {
  readonly action = output<void>();
}

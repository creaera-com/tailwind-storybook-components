import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { Autocomplete } from '../index';

const cities = ['Berlin', 'Bern', 'Bremen', 'Hamburg', 'München', 'Berlin'];
@Component({
  imports: [Autocomplete, ReactiveFormsModule],
  template: '<ui-autocomplete label="Stadt" [options]="cities" [formControl]="control()" />',
})
class ReactiveHost {
  cities = cities;
  control = signal(new FormControl('', { nonNullable: true, validators: [Validators.required] }));
}
@Component({
  imports: [Autocomplete, FormsModule],
  template: '<ui-autocomplete label="Stadt" [options]="cities" [(ngModel)]="city" />',
})
class ModelHost {
  cities = cities;
  city = signal('Berlin');
}
@Component({
  imports: [Autocomplete],
  template: '<ui-autocomplete label="Stadt" [options]="cities" [(value)]="city" />',
})
class ValueHost {
  cities = cities;
  city = signal('');
}
afterEach(() => TestBed.resetTestingModule());

describe('autocomplete', () => {
  function setup() {
    const fixture = TestBed.createComponent(Autocomplete);
    fixture.componentRef.setInput('label', 'Stadt');
    fixture.componentRef.setInput('options', cities);
    fixture.detectChanges();
    return fixture;
  }
  const key = (input: HTMLInputElement, key: string) =>
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  const type = (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  it('labels the native combobox and filters case-insensitively without duplicate suggestions', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    input.focus();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="option"]')).toHaveLength(5);
    type(input, 'BER');
    fixture.detectChanges();
    expect(
      [...fixture.nativeElement.querySelectorAll('[role="option"]')].map((o: any) =>
        o.textContent.trim(),
      ),
    ).toEqual(['Berlin', 'Bern']);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(
      fixture.nativeElement.querySelector('[role="listbox"]').id,
    );
  });
  it('keeps focus on the input and selects the active suggestion on Enter', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input');
    input.focus();
    type(input, 'Ber');
    fixture.detectChanges();
    key(input, 'ArrowDown');
    fixture.detectChanges();
    const option = fixture.nativeElement.querySelector('[role="option"][aria-selected="true"]');
    expect(input.getAttribute('aria-activedescendant')).toBe(option.id);
    expect(document.activeElement).toBe(input);
    key(input, 'ArrowDown');
    fixture.detectChanges();
    key(input, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('Bern');
    expect(input.value).toBe('Bern');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  });
  it('supports upward wrap, Home/End and Escape without changing typed text', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input');
    input.focus();
    fixture.detectChanges();
    key(input, 'ArrowUp');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-selected="true"]').textContent.trim()).toBe(
      'München',
    );
    key(input, 'Home');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-selected="true"]').textContent.trim()).toBe(
      'Berlin',
    );
    key(input, 'End');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-selected="true"]').textContent.trim()).toBe(
      'München',
    );
    key(input, 'Escape');
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();
  });
  it('accepts free text, announces empty results and closes on Tab/outside click', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input');
    input.focus();
    type(input, 'Leipzig');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Keine Vorschläge',
    );
    key(input, 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('Leipzig');
    type(input, 'Ber');
    fixture.detectChanges();
    key(input, 'Tab');
    fixture.detectChanges();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    type(input, 'B');
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
  it('selects by click and updates standalone two-way values', () => {
    const fixture = TestBed.createComponent(ValueHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    input.focus();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[role="option"]').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.city()).toBe('Berlin');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
  it('responds to changing suggestion data and disabled state while open', () => {
    const fixture = setup();
    const input = fixture.nativeElement.querySelector('input');
    input.focus();
    fixture.detectChanges();
    key(input, 'ArrowUp');
    fixture.detectChanges();
    fixture.componentRef.setInput('options', ['Bonn']);
    fixture.detectChanges();
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="listbox"]')).toBeNull();
  });
  it('supports reactive Forms validation, selection, reset and disabled state without value loops', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    const control = fixture.componentInstance.control();
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    input.focus();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(control.touched).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, 'Ber');
    fixture.detectChanges();
    key(input, 'ArrowDown');
    key(input, 'Enter');
    fixture.detectChanges();
    expect(control.value).toBe('Berlin');
    expect(control.dirty).toBe(true);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    let changes = 0;
    const subscription = control.valueChanges.subscribe(() => changes++);
    control.setValue('Hamburg');
    fixture.detectChanges();
    expect(input.value).toBe('Hamburg');
    expect(changes).toBe(1);
    control.reset();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    subscription.unsubscribe();
  });
  it('reconnects a replaced FormControl and supports ngModel', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    fixture.componentInstance.control.set(
      new FormControl('Bern', { nonNullable: true, validators: [Validators.required] }),
    );
    fixture.detectChanges();
    fixture.componentInstance.control().setValue('');
    fixture.componentInstance.control().markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-invalid')).toBe('true');
    fixture.destroy();
    const model = TestBed.createComponent(ModelHost);
    model.detectChanges();
    await model.whenStable();
    model.detectChanges();
    const input = model.nativeElement.querySelector('input');
    expect(input.value).toBe('Berlin');
    type(input, 'Bonn');
    model.detectChanges();
    await model.whenStable();
    expect(model.componentInstance.city()).toBe('Bonn');
  });
});

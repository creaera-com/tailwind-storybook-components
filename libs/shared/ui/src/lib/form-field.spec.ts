import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { afterEach, describe, expect, it } from 'vitest';
import { FormField, Input } from '../index';

@Component({
  imports: [FormField, Input],
  template: `<ui-form-field label="Name" [error]="error()"
      ><input uiInput id="person-name" aria-describedby="help"
    /></ui-form-field>
    <p id="help">Vor- und Nachname</p>
    <ui-form-field label="Nachricht"><textarea uiInput></textarea></ui-form-field>`,
})
class ManualHost {
  error = signal('');
}
@Component({
  imports: [FormField, Input, ReactiveFormsModule],
  template: `<ui-form-field label="E-Mail"
    ><input uiInput type="email" [formControl]="control"
  /></ui-form-field>`,
})
class ReactiveHost {
  readonly controlState = signal(
    new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  );
  get control() {
    return this.controlState();
  }
  set control(value: FormControl<string>) {
    this.controlState.set(value);
  }
}
@Component({
  imports: [FormField, Input, ReactiveFormsModule],
  template: `<ui-form-field label="Anzahl"
    ><input uiInput type="number" [formControl]="control"
  /></ui-form-field>`,
})
class NumberHost {
  control = new FormControl<number | null>(null);
}
@Component({
  imports: [FormField, Input, FormsModule],
  template: `<ui-form-field label="Nachricht">
    <textarea uiInput [(ngModel)]="message" required></textarea>
  </ui-form-field>`,
})
class ModelHost {
  message = 'Hallo';
}

afterEach(() => TestBed.resetTestingModule());

describe('form fields', () => {
  it('connects each small label to its native input/textarea with unique IDs', () => {
    const fixture = TestBed.createComponent(ManualHost);
    fixture.detectChanges();
    const fields = fixture.nativeElement.querySelectorAll('ui-form-field');
    const input = fields[0].querySelector('input');
    const textarea = fields[1].querySelector('textarea');
    expect(input.id).toBe('person-name');
    expect(fields[0].querySelector('label').htmlFor).toBe(input.id);
    expect(textarea.id).toBeTruthy();
    expect(textarea.id).not.toBe(input.id);
    expect(fields[1].querySelector('label').htmlFor).toBe(textarea.id);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
  it('shows an explicit error and adds its description without losing existing help text', () => {
    const fixture = TestBed.createComponent(ManualHost);
    fixture.componentInstance.error.set('Name fehlt.');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    const error = fixture.nativeElement.querySelector('.ui-field-error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(`help ${error.id}`);
    expect(error.textContent).toContain('Name fehlt.');
    fixture.componentInstance.error.set('');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(input.getAttribute('aria-describedby')).toBe('help');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(fixture.nativeElement.querySelector('.ui-field-error')).toBeNull();
  });
  it('keeps pristine invalid controls neutral, shows an error on blur and clears it after valid input', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(fixture.componentInstance.control.invalid).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBeNull();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.ui-field-error').textContent).toContain(
      'Bitte Eingabe prüfen.',
    );
    input.value = 'lea@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('lea@example.com');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
  it('reacts to programmatic touch, disable/enable, values and resets', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    const input = fixture.nativeElement.querySelector('input');
    control.markAsTouched();
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBeNull();
    control.enable();
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    control.setValue('lea@example.com');
    fixture.detectChanges();
    expect(input.value).toBe('lea@example.com');
    control.reset();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });
  it('uses the native number accessor so zero is a number and an empty value is null', () => {
    const fixture = TestBed.createComponent(NumberHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    input.value = '0';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(0);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeNull();
  });
  it('supports textarea ngModel and required validation without a custom value accessor', async () => {
    const fixture = TestBed.createComponent(ModelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea.value).toBe('Hallo');
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.message).toBe('');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });
  it('reconnects validation when the FormControl is replaced', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    const previous = fixture.componentInstance.control;
    fixture.componentInstance.control = new FormControl('ok@example.com', {
      nonNullable: true,
      validators: [Validators.required],
    });
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('ok@example.com');
    fixture.componentInstance.control.setValue('');
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    previous.setValue('old@example.com');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

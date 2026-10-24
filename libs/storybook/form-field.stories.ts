import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormField, Input, Button } from '@creaera/ui';

@Component({
  selector: 'ui-form-example',
  imports: [ReactiveFormsModule, FormField, Input, Button],
  template: `<form [formGroup]="form" (ngSubmit)="submit()" class="max-w-xl space-y-6" novalidate>
    <ui-form-field label="Name"
      ><input
        uiInput
        formControlName="name"
        autocomplete="name"
        placeholder="Vor- und Nachname"
        required
    /></ui-form-field>
    <ui-form-field label="E-Mail"
      ><input
        uiInput
        type="email"
        formControlName="email"
        autocomplete="email"
        placeholder="name@beispiel.de"
        required
    /></ui-form-field>
    <ui-form-field label="Nachricht">
      <textarea
        uiInput
        formControlName="message"
        rows="4"
        placeholder="Deine Nachricht"
        required
      ></textarea>
    </ui-form-field>
    <button uiButton type="submit">Absenden</button>
    @if (submitted) {
      <p role="status">Formular gültig. Die Daten wurden nicht versendet.</p>
    }
  </form>`,
})
class FormExample {
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  submitted = false;
  submit(): void {
    this.form.markAllAsTouched();
    this.submitted = this.form.valid;
  }
}

const meta: Meta<FormField> = {
  title: 'Components/Form Field',
  component: FormField,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Input] })],
  args: { label: 'Name', error: '' },
  render: (args) => ({
    props: args,
    template:
      '<div class="max-w-lg"><ui-form-field [label]="label" [error]="error"><input uiInput placeholder="Vor- und Nachname" /></ui-form-field></div>',
  }),
};
export default meta;
type Story = StoryObj<FormField>;
export const Overview: Story = {
  render: () => ({
    template: `<main class="max-w-3xl space-y-6">
    <header><h1 class="text-2xl font-semibold text-ui-text">Eingabefelder</h1><p class="mt-2 text-ui-text">Kleine Labels, klare Umrandungen und verständliche Fehler.</p></header>
    <div class="grid gap-6 md:grid-cols-2">
      <ui-form-field label="Name"><input uiInput autocomplete="name" placeholder="Vor- und Nachname" /></ui-form-field>
      <ui-form-field label="E-Mail"><input uiInput type="email" autocomplete="email" placeholder="name@beispiel.de" /></ui-form-field>
      <ui-form-field label="Passwort"><input uiInput type="password" autocomplete="new-password" placeholder="Passwort eingeben" /></ui-form-field>
      <ui-form-field label="Anzahl"><input uiInput type="number" min="0" value="3" /></ui-form-field>
      <ui-form-field label="Datum"><input uiInput type="date" /></ui-form-field>
      <ui-form-field label="Referenz"><input uiInput readonly value="UI-2026-001" /></ui-form-field>
      <div class="md:col-span-2"><ui-form-field label="Nachricht"><textarea uiInput rows="4" placeholder="Deine Nachricht"></textarea></ui-form-field></div>
      <ui-form-field label="E-Mail mit Fehler" error="Bitte eine gültige E-Mail-Adresse eingeben."><input uiInput type="email" value="lea@" /></ui-form-field>
      <ui-form-field label="Gesperrtes Feld"><input uiInput disabled value="Nicht verfügbar" /></ui-form-field>
    </div>
  </main>`,
  }),
};
export const Text: Story = {};
export const Email: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="E-Mail"><input uiInput type="email" autocomplete="email" placeholder="name@beispiel.de" /></ui-form-field></div>',
  }),
};
export const Password: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Passwort"><input uiInput type="password" autocomplete="new-password" placeholder="Passwort eingeben" /></ui-form-field></div>',
  }),
};
export const Number: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Anzahl"><input uiInput type="number" min="0" step="1" value="1" /></ui-form-field></div>',
  }),
};
export const Date: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Datum"><input uiInput type="date" /></ui-form-field></div>',
  }),
};
export const Textarea: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Nachricht"><textarea uiInput rows="4" placeholder="Deine Nachricht"></textarea></ui-form-field></div>',
  }),
};
export const Error: Story = { args: { error: 'Bitte einen gültigen Namen eingeben.' } };
export const TextareaError: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Nachricht" error="Die Nachricht ist zu kurz."><textarea uiInput rows="4">Hallo</textarea></ui-form-field></div>',
  }),
};
export const Disabled: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Name"><input uiInput disabled value="Nicht verfügbar" /></ui-form-field></div>',
  }),
};
export const Readonly: Story = {
  render: () => ({
    template:
      '<div class="max-w-lg"><ui-form-field label="Referenz"><input uiInput readonly value="UI-2026-001" /></ui-form-field></div>',
  }),
};
export const ReactiveForm: Story = {
  decorators: [moduleMetadata({ imports: [FormExample] })],
  render: () => ({ template: '<ui-form-example />' }),
};

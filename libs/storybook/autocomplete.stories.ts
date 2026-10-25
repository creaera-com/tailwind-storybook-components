import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Autocomplete, Button } from '@creaera/ui';

const cities = [
  'Berlin',
  'Bern',
  'Bremen',
  'Dresden',
  'Frankfurt',
  'Hamburg',
  'Köln',
  'München',
  'Stuttgart',
  'Wien',
  'Zürich',
];
@Component({
  selector: 'ui-autocomplete-example',
  imports: [Autocomplete, Button, ReactiveFormsModule],
  template: `<form
    [formGroup]="form"
    (ngSubmit)="submit()"
    class="max-w-lg space-y-6 pb-72"
    novalidate
  >
    <ui-autocomplete
      label="Stadt"
      [options]="cities"
      formControlName="city"
      placeholder="Stadt eingeben"
    />
    <button uiButton type="submit">Übernehmen</button>
    @if (submitted()) {
      <p role="status">Ausgewählte Eingabe: {{ form.controls.city.value }}</p>
    }
  </form>`,
})
class AutocompleteExample {
  readonly cities = cities;
  readonly form = new FormGroup({
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly submitted = signal(false);
  submit(): void {
    this.form.markAllAsTouched();
    this.submitted.set(this.form.valid);
  }
}

const meta: Meta<Autocomplete> = {
  title: 'Components/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  args: {
    label: 'Stadt',
    options: cities,
    value: '',
    placeholder: 'Stadt suchen',
    disabled: false,
    error: '',
  },
  render: (args) => ({
    props: args,
    template: `<div class="max-w-lg space-y-4 pb-72"><ui-autocomplete [label]="label" [options]="options" [(value)]="value" [placeholder]="placeholder" [disabled]="disabled" [error]="error" /><p>Eingabe: {{ value || '–' }}</p></div>`,
  }),
};
export default meta;
type Story = StoryObj<Autocomplete>;
export const Default: Story = {};
export const Prefilled: Story = { args: { value: 'Berlin' } };
export const NoResults: Story = { args: { value: 'Leipzig' } };
export const Error: Story = { args: { error: 'Bitte eine Stadt eingeben.' } };
export const Disabled: Story = { args: { disabled: true } };
export const ReactiveForm: Story = {
  decorators: [moduleMetadata({ imports: [AutocompleteExample] })],
  render: () => ({ template: '<ui-autocomplete-example />' }),
};

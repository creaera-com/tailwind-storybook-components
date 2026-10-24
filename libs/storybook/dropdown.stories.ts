import type { Meta, StoryObj } from '@storybook/angular';
import { Dropdown } from '@creaera/ui';
const meta: Meta<Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  args: {
    label: 'Aktionen',
    disabled: false,
    options: [
      { value: 'edit', label: 'Bearbeiten' },
      { value: 'copy', label: 'Duplizieren' },
      { value: 'delete', label: 'Löschen', disabled: true },
    ],
  },
  render: (args) => ({
    props: { ...args, result: '' },
    template:
      '<ui-dropdown [label]="label" [options]="options" [disabled]="disabled" (selected)="result = $event" /><p class="mt-4">Auswahl: {{ result || "–" }}</p>',
  }),
};
export default meta;
export const Default: StoryObj<Dropdown> = {};
export const Disabled: StoryObj<Dropdown> = { args: { disabled: true } };

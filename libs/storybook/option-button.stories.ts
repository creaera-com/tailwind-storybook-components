import type { Meta, StoryObj } from '@storybook/angular';
import { OptionButton } from '@creaera/ui';
const meta: Meta<OptionButton> = {
  title: 'Components/Option Button',
  component: OptionButton,
  tags: ['autodocs'],
  args: {
    label: 'Speichern',
    disabled: false,
    options: [
      { value: 'draft', label: 'Als Entwurf speichern' },
      { value: 'publish', label: 'Speichern und veröffentlichen' },
    ],
  },
  render: (args) => ({
    props: { ...args, result: '' },
    template: `<ui-option-button [label]="label" [options]="options" [disabled]="disabled"
    (action)="result = 'Gespeichert'" (selected)="result = $event" /><p class="mt-4">{{ result }}</p>`,
  }),
};
export default meta;
export const Default: StoryObj<OptionButton> = {};
export const Disabled: StoryObj<OptionButton> = { args: { disabled: true } };

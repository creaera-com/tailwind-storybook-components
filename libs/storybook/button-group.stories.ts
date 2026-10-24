import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonGroup } from '@creaera/ui';
const meta: Meta<ButtonGroup> = {
  title: 'Components/Button Group',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: {
    label: 'Ansicht',
    options: [
      { value: 'day', label: 'Tag' },
      { value: 'week', label: 'Woche' },
      { value: 'month', label: 'Monat' },
      { value: 'year', label: 'Jahr', disabled: true },
    ],
    selected: ['week'],
    multiple: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template:
      '<ui-button-group [label]="label" [options]="options" [selected]="selected" [multiple]="multiple" [disabled]="disabled" />',
  }),
};
export default meta;
type Story = StoryObj<ButtonGroup>;
export const Single: Story = {};
export const Multiple: Story = {
  args: { label: 'Zeiträume', multiple: true, selected: ['day', 'week'] },
};
export const Disabled: Story = { args: { disabled: true } };

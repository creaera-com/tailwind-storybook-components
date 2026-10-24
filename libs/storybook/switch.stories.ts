import type { Meta, StoryObj } from '@storybook/angular';
import { ToggleSwitch } from '@creaera/ui';
const meta: Meta<ToggleSwitch> = {
  title: 'Components/Switch',
  component: ToggleSwitch,
  tags: ['autodocs'],
  args: { checked: false, disabled: false },
  render: (args) => ({
    props: args,
    template:
      '<ui-switch [checked]="checked" [disabled]="disabled">Automatisch speichern</ui-switch>',
  }),
};
export default meta;
type Story = StoryObj<ToggleSwitch>;
export const Inactive: Story = {};
export const Active: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const ActiveDisabled: Story = { args: { checked: true, disabled: true } };

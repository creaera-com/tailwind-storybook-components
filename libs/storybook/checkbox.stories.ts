import type { Meta, StoryObj } from '@storybook/angular';
import { Checkbox } from '@creaera/ui';
const meta: Meta<Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { checked: false, disabled: false },
  render: (args) => ({
    props: args,
    template:
      '<ui-checkbox [checked]="checked" [disabled]="disabled">Benachrichtigungen</ui-checkbox>',
  }),
};
export default meta;
type Story = StoryObj<Checkbox>;
export const Default: Story = {};
export const Selected: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const SelectedDisabled: Story = { args: { checked: true, disabled: true } };

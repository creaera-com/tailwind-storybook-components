import type { Meta, StoryObj } from '@storybook/angular';
import { Button } from '@creaera/ui';

const meta: Meta<Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { variant: 'primary', type: 'button' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'text'] },
  },
  render: (args) => ({
    props: args,
    template: '<button uiButton [variant]="variant" [type]="type">Weiter</button>',
  }),
};
export default meta;
type Story = StoryObj<Button>;
export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Text: Story = { args: { variant: 'text' } };
export const Disabled: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap gap-4">
    <button uiButton disabled>Primär</button><button uiButton variant="secondary" disabled>Sekundär</button>
    <button uiButton variant="tertiary" disabled>Tertiär</button><button uiButton variant="text" disabled>Text</button>
  </div>`,
  }),
};
const icon =
  '<svg uiIcon aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" /></svg>';
export const WithIcon: Story = {
  render: () => ({ template: `<button uiButton>${icon}Hinzufügen</button>` }),
};
export const IconOnly: Story = {
  render: () => ({ template: `<button uiButton aria-label="Hinzufügen">${icon}</button>` }),
};

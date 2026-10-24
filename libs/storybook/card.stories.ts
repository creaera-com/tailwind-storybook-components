import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Card, Button, Checkbox } from '@creaera/ui';
const meta: Meta<Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, Checkbox] })],
  args: { collapsible: false, expanded: false, border: 'primary', label: 'Projektdetails' },
  argTypes: { border: { control: 'select', options: ['primary', 'secondary'] } },
  render: (args) => ({
    props: args,
    template: `
    <div class="max-w-xl pb-8"><ui-card [collapsible]="collapsible" [expanded]="expanded" [border]="border" [label]="label">
      <h2 uiCardHeader class="text-xl font-semibold">Projektdetails</h2>
      <p>Ein klarer Platz für zusammengehörige Informationen.</p>
      <div class="mt-4"><ui-checkbox>Benachrichtigungen erhalten</ui-checkbox></div>
    </ui-card></div>
  `,
  }),
};
export default meta;
type Story = StoryObj<Card>;
export const Default: Story = {};
export const Secondary: Story = { args: { border: 'secondary' } };
export const Collapsible: Story = { args: { collapsible: true } };
export const Expanded: Story = { args: { collapsible: true, expanded: true } };
export const Nested: Story = {
  render: () => ({
    template: `
    <div class="max-w-2xl pb-8"><ui-card collapsible [expanded]="true" label="Projektübersicht">
      <h2 uiCardHeader class="text-xl font-semibold">Projektübersicht</h2>
      <ui-card border="secondary">
        <h3 uiCardHeader class="font-semibold">Zusammenfassung</h3><p>Eine normale Card innerhalb einer ausklappbaren Card.</p>
      </ui-card>
      <ui-card collapsible label="Weitere Details">
        <h3 uiCardHeader class="font-semibold">Weitere Details</h3>
        <p>Dieser Bereich lässt sich unabhängig von der äußeren Card öffnen.</p>
        <button uiButton class="mt-4">Bearbeiten</button>
      </ui-card>
    </ui-card></div>
  `,
  }),
};

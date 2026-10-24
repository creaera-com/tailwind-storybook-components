import type { Meta, StoryObj } from '@storybook/angular';
import { Tree } from '@creaera/ui';
import { projectNodes } from './examples/tree-data';
const meta: Meta<Tree> = {
  title: 'Components/Tree',
  component: Tree,
  tags: ['autodocs'],
  args: {
    label: 'Projektstruktur',
    nodes: projectNodes,
    expanded: ['design', 'components'],
    selected: null,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<div class="max-w-xl space-y-4"><ui-tree [label]="label" [nodes]="nodes" [(expanded)]="expanded" [(selected)]="selected" [disabled]="disabled" /><p>Auswahl: {{ selected || '–' }}</p></div>`,
  }),
};
export default meta;
type Story = StoryObj<Tree>;
export const Default: Story = {};
export const Collapsed: Story = { args: { expanded: [] } };
export const Selected: Story = { args: { selected: 'cards' } };
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { nodes: [] } };

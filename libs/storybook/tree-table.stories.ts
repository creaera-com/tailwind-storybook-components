import type { Meta, StoryObj } from '@storybook/angular';
import { TreeTable } from '@creaera/ui';
import { projectColumns, projectNodes } from './examples/tree-data';
const meta: Meta<TreeTable> = {
  title: 'Components/Tree Table',
  component: TreeTable,
  tags: ['autodocs'],
  args: {
    label: 'Projekte und Zuständigkeiten',
    nodes: projectNodes,
    columns: projectColumns,
    expanded: ['design', 'components'],
    selected: null,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<div class="max-w-4xl space-y-4"><ui-tree-table [label]="label" [nodes]="nodes" [columns]="columns" [(expanded)]="expanded" [(selected)]="selected" [disabled]="disabled" /><p>Auswahl: {{ selected || '–' }}</p></div>`,
  }),
};
export default meta;
type Story = StoryObj<TreeTable>;
export const Default: Story = {};
export const Collapsed: Story = { args: { expanded: [] } };
export const Selected: Story = { args: { selected: 'cards' } };
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { nodes: [] } };

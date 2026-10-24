import type { Meta, StoryObj } from '@storybook/angular';
import { Chip } from '@creaera/ui';
const meta: Meta<Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { disabled: false },
  render: (args) => ({
    props: { ...args, visible: true },
    template: `
    @if (visible) { <ui-chip [disabled]="disabled" (removed)="visible = false">Designsystem</ui-chip> }
    @else { <p>Chip entfernt.</p> }
  `,
  }),
};
export default meta;
export const Default: StoryObj<Chip> = {};
export const Disabled: StoryObj<Chip> = { args: { disabled: true } };

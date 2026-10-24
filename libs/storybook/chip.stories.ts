import type { Meta, StoryObj } from '@storybook/angular';
import { Chip } from '@creaera/ui';
const meta: Meta<Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  render: () => ({ template: '<button uiChip>Designsystem</button>' }),
};
export default meta;
export const Default: StoryObj<Chip> = {};
export const Disabled: StoryObj<Chip> = {
  render: () => ({ template: '<button uiChip disabled>Designsystem</button>' }),
};

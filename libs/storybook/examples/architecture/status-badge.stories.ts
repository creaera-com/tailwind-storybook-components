import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadge } from './status-badge';

const meta: Meta<StatusBadge> = {
  title: 'Components/Status Badge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: { label: 'Bereit', tone: 'normal' },
};
export default meta;
type Story = StoryObj<StatusBadge>;
export const Normal: Story = {};
export const Caution: Story = { args: { label: 'Bitte prüfen', tone: 'caution' } };
export const Dangerous: Story = { args: { label: 'Fehler', tone: 'dangerous' } };

import type { Meta, StoryObj } from '@storybook/angular';
import { RadialMenu, type RadialMenuItem } from '@creaera/ui';

const items = [
  { id: 'edit', label: 'Bearbeiten', icon: '✎' },
  { id: 'view', label: 'Ansicht' },
  { id: 'save', label: 'Speichern' },
  { id: 'help', label: 'Hilfe' },
];

const actions: Record<string, RadialMenuItem[]> = {
  edit: [
    { id: 'cut', label: 'Schnitt' },
    { id: 'copy', label: 'Kopie' },
    { id: 'paste', label: 'Einfügen' },
    { id: 'undo', label: 'Zurück' },
  ],
  view: [
    { id: 'grid', label: 'Raster' },
    { id: 'list', label: 'Liste' },
  ],
};

const meta: Meta<RadialMenu> = {
  title: 'Components/Radial Menu',
  component: RadialMenu,
  render: () => ({
    props: { items, actions, activeId: 'edit', open: true, selection: '' },
    template: `
      @if (open) {
        <ui-radial-menu
          [items]="items"
          [activeId]="activeId"
          [subItems]="actions[activeId] || []"
          (itemSelected)="activeId = $event.id; selection = $event.label"
          (subItemSelected)="selection = $event.label"
          (closed)="open = false" />
      } @else {
        <button type="button" (click)="open = true">Menü öffnen</button>
      }
      <p aria-live="polite">{{ selection }}</p>
    `,
  }),
};

export default meta;
export const Default: StoryObj<RadialMenu> = {};

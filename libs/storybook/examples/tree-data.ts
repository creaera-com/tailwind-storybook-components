import type { UiTreeColumn, UiTreeNode } from '@creaera/ui';

export const projectNodes: readonly UiTreeNode[] = [
  {
    id: 'design',
    label: 'Designsystem',
    data: { owner: 'Team Design', status: 'Aktiv' },
    children: [
      {
        id: 'components',
        label: 'Komponenten',
        data: { owner: 'Team UI', status: 'In Arbeit' },
        children: [
          { id: 'buttons', label: 'Buttons', data: { owner: 'Lea', status: 'Fertig' } },
          { id: 'cards', label: 'Cards', data: { owner: 'Jonas', status: 'Fertig' } },
        ],
      },
      { id: 'tokens', label: 'Design-Tokens', data: { owner: 'Mia', status: 'Aktiv' } },
      {
        id: 'archive',
        label: 'Archiv',
        disabled: true,
        data: { owner: 'Team Design', status: 'Gesperrt' },
        children: [{ id: 'legacy', label: 'Alte Entwürfe', data: { status: 'Archiviert' } }],
      },
    ],
  },
  { id: 'documentation', label: 'Dokumentation', data: { owner: 'Team UI', status: 'Aktiv' } },
];

export const projectColumns: readonly UiTreeColumn[] = [
  { key: 'owner', label: 'Verantwortlich' },
  { key: 'status', label: 'Status' },
];

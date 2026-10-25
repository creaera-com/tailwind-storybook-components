import { setCompodocJson } from '@storybook/addon-docs/angular';
import documentation from '../../../dist/compodoc/documentation.json';
import type { Preview } from '@storybook/angular';
setCompodocJson(documentation);
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Farbschema',
      toolbar: { icon: 'circlehollow', items: ['light', 'dark'] },
    },
    size: {
      description: 'Größenprofil',
      toolbar: { icon: 'grow', items: ['auto', 'small', 'large'] },
    },
  },
  initialGlobals: { theme: 'light', size: 'auto' },
  decorators: [
    (story, context) => {
      document.body.classList.remove('ui-light', 'ui-dark', 'ui-small', 'ui-large');
      document.body.classList.add(context.globals['theme'] === 'dark' ? 'ui-dark' : 'ui-light');
      if (context.globals['size'] !== 'auto')
        document.body.classList.add(`ui-${context.globals['size']}`);
      return story();
    },
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    options: {
      storySort: {
        order: [
          'Anwenderdoku',
          [
            'Start',
            'Farben konfigurieren',
            'Light und Dark Mode',
            'Responsive Größen',
            'Komponenten verwenden',
            'Trees',
            'API und Projektaufbau',
          ],
          'Architektur',
          [
            'Start',
            'Module und Nx',
            'Komponenten anlegen und CLI',
            'Komponenten und APIs',
            'State und Signal Store',
            'HTTP und CRUD',
            'Aktionen und Nebenläufigkeit',
            'Server-Suche',
            'Tests und Weiterentwicklung',
          ],
          'Foundations',
          'Components',
        ],
      },
    },
  },
};
export default preview;

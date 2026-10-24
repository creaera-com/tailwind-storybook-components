import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import {
  Button,
  Card,
  Checkbox,
  ToggleSwitch,
  ButtonGroup,
  Chip,
  Dropdown,
  OptionButton,
  Radio,
} from '@creaera/ui';
const meta: Meta = {
  title: 'Foundations/Overview',
  decorators: [
    moduleMetadata({
      imports: [
        Card,
        Button,
        Checkbox,
        ToggleSwitch,
        ButtonGroup,
        Chip,
        Dropdown,
        OptionButton,
        Radio,
      ],
    }),
  ],
  parameters: { controls: { disable: true } },
};
export default meta;
export const Library: StoryObj = {
  render: () => ({
    props: {
      showChip: true,
      options: [
        { value: 'one', label: 'Erste Option' },
        { value: 'two', label: 'Zweite Option' },
      ],
    },
    template: `
  <main class="mx-auto max-w-4xl space-y-10 p-ui-padding text-ui-text">
    <header><p class="text-sm uppercase tracking-widest text-ui-normal">Creaera · UI Library</p><h1 class="mt-3 text-4xl font-semibold">Klar. Grün. Gemeinsam.</h1><p class="mt-4">Eigenständige Komponenten mit einer kleinen API. Theme und Größe oben in der Toolbar umschalten.</p></header>
    <section class="space-y-4"><h2 class="text-xl font-semibold">Buttons</h2><div class="flex flex-wrap gap-4"><button uiButton>Primär</button><button uiButton variant="secondary">Sekundär</button><button uiButton variant="tertiary">Tertiär</button><button uiButton variant="text">Textbutton</button><button uiButton disabled>Deaktiviert</button></div></section>
    <section class="space-y-4"><h2 class="text-xl font-semibold">Auswahl</h2><div class="flex flex-wrap items-center gap-6"><ui-checkbox>Benachrichtigungen</ui-checkbox><ui-switch [checked]="true">Automatisch speichern</ui-switch><label class="ui-choice"><input type="radio" uiRadio name="example" checked />Standard</label>@if (showChip) { <ui-chip (removed)="showChip = false">Designsystem</ui-chip> }</div><ui-button-group label="Beispielauswahl" [options]="options" /></section>
    <section class="space-y-4"><h2 class="text-xl font-semibold">Aktionen und Optionen</h2><div class="flex flex-wrap gap-4"><ui-dropdown label="Aktionen" [options]="options" /><ui-option-button label="Speichern" [options]="options" /></div></section>
    <section class="space-y-4"><h2 class="text-xl font-semibold">Cards</h2><ui-card collapsible label="Projektübersicht"><h3 uiCardHeader class="font-semibold">Projektübersicht</h3><ui-card border="secondary"><h4 uiCardHeader class="font-semibold">Details</h4><p>Eine Card innerhalb einer Card.</p></ui-card></ui-card></section>
    <section class="space-y-4"><h2 class="text-xl font-semibold">Statusfarben</h2><div class="flex flex-wrap gap-6 font-semibold"><span class="text-ui-normal">Normal</span><span class="text-ui-caution">Caution</span><span class="text-ui-dangerous">Dangerous</span></div></section>
  </main>`,
  }),
};

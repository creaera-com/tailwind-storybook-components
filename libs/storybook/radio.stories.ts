import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { Radio } from '@creaera/ui';
const meta: Meta = {
  title: 'Components/Radio',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Radio, FormsModule] })],
};
export default meta;
export const Selection: StoryObj = {
  render: () => ({
    props: { delivery: 'standard' },
    template: `<fieldset class="flex flex-col gap-3">
    <legend>Versandart</legend>
    <label class="ui-choice"><input type="radio" uiRadio name="delivery" value="standard" [(ngModel)]="delivery" />Standard</label>
    <label class="ui-choice"><input type="radio" uiRadio name="delivery" value="express" [(ngModel)]="delivery" />Express</label>
    <label class="ui-choice"><input type="radio" uiRadio name="delivery" value="pickup" disabled />Abholung (nicht verfügbar)</label>
    <p>Auswahl: {{ delivery }}</p>
  </fieldset>`,
  }),
};

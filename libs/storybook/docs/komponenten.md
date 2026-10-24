# Komponenten verwenden

Alle folgenden Beispiele sind **Angular-Templates**. Die jeweils verwendeten
Standalone-Exporte aus `@creaera/ui` im `imports`-Array der eigenen Komponente
registrieren. Die vollständige Input-/Output-Tabelle steht unter
**API und Projektaufbau**.

## Buttons und Icons

`Button` importieren. Native Attribute und Events bleiben nutzbar:

```html
<button uiButton (click)="save()">Speichern</button>
<button uiButton variant="secondary">Zurück</button>
<button uiButton variant="tertiary">Weitere Aktion</button>
<button uiButton variant="text">Abbrechen</button>
<button uiButton [disabled]="busy">Speichern</button>
<button uiButton type="submit">Formular absenden</button>
```

Ohne `type` gilt `button`, sodass ein Button ein umgebendes Formular nicht
versehentlich absendet. Die Varianten heißen `primary` (Standard), `secondary`,
`tertiary` und `text`.

| Zustand  | Verhalten                                                               |
| -------- | ----------------------------------------------------------------------- |
| Default  | Primär-/Sekundärfarbe; Tertiär grau mit Primärborder; Text transparent  |
| Hover    | Weiße Border; gefüllte Buttons verwenden die gemeinsame Hover-Farbe     |
| Pressed  | Dickere weiße Innenumrandung und Pressed-Farbe; Text bleibt transparent |
| Disabled | Weiße Border, Disabled-Farbe, keine native Aktivierung                  |
| Focused  | Doppelter weißer Fokusrahmen mit grünem Hintergrund für Sichtbarkeit    |

Hover, Pressed und Focused entstehen durch echte Maus-/Tastaturbedienung. Sie
werden nicht über Inputs gesetzt. Icons werden projiziert und sind weiß:

```html
<button uiButton>
  <svg uiIcon aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" />
  </svg>
  Hinzufügen
</button>

<button uiButton aria-label="Hinzufügen">
  <svg uiIcon aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" />
  </svg>
</button>
```

Beim Icon-only Button ist `aria-label` nötig. Dekorative Icons bekommen
`aria-hidden="true"`. `uiIcon` ist ein Styling-Attribut und benötigt keinen
zusätzlichen Angular-Import.

## Checkbox und Switch

`Checkbox` bzw. `ToggleSwitch` importieren. Der projizierte Text ist das Label.
Mit `[(checked)]` wird der Zustand in beide Richtungen gebunden:

```html
<ui-checkbox [(checked)]="accepted">Bedingungen akzeptieren</ui-checkbox>
<ui-switch [(checked)]="autosave">Automatisch speichern</ui-switch>
<ui-checkbox [disabled]="true">Nicht verfügbar</ui-checkbox>
<ui-switch [checked]="true" [disabled]="true">Aktiv, aber gesperrt</ui-switch>
```

Die zugehörigen Felder `accepted` und `autosave` sind Booleans. „Active“ bei der
Checkbox meint den bedienbaren Zustand; `checked` steuert die Auswahl.
Beim Switch entspricht `checked` dem aktiven/eingeschalteten Zustand.

### Angular Forms

Checkbox und Switch unterstützen Angular Forms ohne zusätzlichen Adapter.
Beispiel mit Reactive Forms:

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Checkbox, ToggleSwitch } from '@creaera/ui';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, Checkbox, ToggleSwitch],
  template: `
    <ui-checkbox [formControl]="notifications">Benachrichtigungen</ui-checkbox>
    <ui-switch [formControl]="autosave">Automatisch speichern</ui-switch>
  `,
})
export class Settings {
  notifications = new FormControl(false, { nonNullable: true });
  autosave = new FormControl(true, { nonNullable: true });
}
```

Mit `control.disable()` / `control.enable()` den Formularzustand steuern.
Alternativ `FormsModule` importieren und `[(ngModel)]` verwenden; innerhalb eines
Formulars außerdem einen eindeutigen `name` setzen. Pro Control entweder Forms
oder `[(checked)]` als Zustandsquelle wählen.

## Radio Buttons

`Radio` und bei Verwendung von `ngModel` zusätzlich `FormsModule` importieren:

```html
<fieldset>
  <legend>Versandart</legend>
  <label class="ui-choice">
    <input type="radio" uiRadio name="delivery" value="standard" [(ngModel)]="delivery" />
    Standard
  </label>
  <label class="ui-choice">
    <input type="radio" uiRadio name="delivery" value="express" [(ngModel)]="delivery" />
    Express
  </label>
  <label class="ui-choice">
    <input type="radio" uiRadio name="delivery" value="pickup" disabled />
    Abholung
  </label>
</fieldset>
```

Das Feld `delivery` kann zum Beispiel mit `'standard'` initialisiert werden.
`type="radio"` muss ausdrücklich im Template stehen, damit Angular den
Radio-Forms-Accessor auswählt. Gleicher `name` bedeutet gemeinsame Auswahlgruppe;
verschiedene Gruppen erhalten unterschiedliche Namen. `[formControl]` ist
ebenfalls möglich. `fieldset` und `legend` geben der Gruppe eine Beschriftung.

## Button Group

`ButtonGroup` und für die Typisierung `UiOption` importieren. Optionen haben
eindeutige Werte:

```ts
import type { UiOption } from '@creaera/ui';

// Felder der konsumierenden Angular-Komponente:
const options: UiOption[] = [
  { value: 'day', label: 'Tag' },
  { value: 'week', label: 'Woche' },
  { value: 'month', label: 'Monat', disabled: true },
];
```

Einfachauswahl:

```html
<ui-button-group label="Ansicht" [options]="options" [(selected)]="view" />
```

`view` ist ein `readonly string[]`, zum Beispiel `['day']`. Auch bei
Einfachauswahl wird ein Array mit höchstens einem Eintrag verwendet. Bei einem
leeren Array ist zunächst nichts ausgewählt. In der Einfachauswahl wechseln
Pfeiltasten sowie Home/End die Auswahl und überspringen gesperrte Optionen.

Mehrfachauswahl:

```html
<ui-button-group
  label="Sichtbare Zeiträume"
  [options]="options"
  [multiple]="true"
  [(selected)]="periods"
/>
```

`periods` ist zum Beispiel `['day', 'week']`. Ein weiterer Klick auf einen
aktiven Button entfernt ihn aus der Auswahl. `[disabled]="true"` sperrt die
gesamte Gruppe. `label` ist für eine zugängliche Gruppenbeschriftung erforderlich.
Die Gruppe unterstützt kein `formControl`-/`ngModel`-Binding; sie verwendet
`[(selected)]`.

## Chips

`Chip` importieren:

```html
<button uiChip (click)="openTopic()">Designsystem</button>
<button uiChip disabled>Nicht verfügbar</button>
```

Ein Chip ist zunächst eine Aktion, kein ausgewählter Filter und kein entfernbares
Tag. Er unterstützt Default, Hover, Pressed, Disabled und Tastaturfokus über
native Button-Semantik. Der Button-Typ ist immer `button`.

## Dropdown-Menü

`Dropdown` importieren. Die Optionen verwenden ebenfalls `UiOption`:

```html
<ui-dropdown label="Aktionen" [options]="actions" (selected)="handleAction($event)" />
```

Das Feld `actions` ist ein Optionsarray, etwa
`[{ value: 'copy', label: 'Duplizieren' }]`. `handleAction(value: string)` erhält
den `value` der aktivierten Option. Einzelne Optionen lassen sich mit
`disabled: true` sperren, das ganze Menü mit `[disabled]="true"`.

Das Dropdown ist ein **Aktionsmenü**, kein Formular-Select. Es speichert keine
dauerhafte Auswahl und unterstützt kein `formControl`-/`ngModel`-Binding.

## Option Button / Split Button

`OptionButton` importieren. Der Hauptbutton führt eine Aktion aus; der separate
Pfeil öffnet weitere Aktionen:

```html
<ui-option-button
  label="Speichern"
  [options]="saveOptions"
  (action)="save()"
  (selected)="handleSaveOption($event)"
/>
```

`saveOptions` ist ein `UiOption[]`. `(action)` hat keinen Nutzwert;
`(selected)` liefert den String-Wert der gewählten Menüoption. Ein Klick auf den
Pfeil löst die Hauptaktion nicht aus. `[disabled]="true"` sperrt beide Buttons.

## Menübedienung mit Tastatur

| Taste / Aktion                         | Verhalten                                          |
| -------------------------------------- | -------------------------------------------------- |
| Enter oder Leertaste auf dem Trigger   | Menü öffnen bzw. schließen                         |
| Pfeil abwärts auf dem Trigger          | Öffnen und ersten verfügbaren Eintrag fokussieren  |
| Pfeil aufwärts auf dem Trigger         | Öffnen und letzten verfügbaren Eintrag fokussieren |
| Pfeil aufwärts / abwärts im Menü       | Zwischen verfügbaren Einträgen navigieren          |
| Home / End                             | Ersten / letzten verfügbaren Eintrag fokussieren   |
| Enter oder Leertaste auf einem Eintrag | Aktion auslösen und Menü schließen                 |
| Escape                                 | Schließen und Fokus zum Menütrigger zurückgeben    |
| Tab oder Klick außerhalb               | Menü schließen                                     |

Die sichtbaren Beschriftungen und `label`-Inputs sind Teil der zugänglichen
Bedienung. Deshalb sinnvolle Namen wählen, auch wenn Beispiele kurze Texte verwenden.

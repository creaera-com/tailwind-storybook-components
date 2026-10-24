# Creaera UI

Angular-Komponenten mit einer kleinen API, Tailwind CSS und Storybook in einem
Nx-Workspace. Angular 22 · Nx 24 · Tailwind CSS 4 · Storybook 10.

## Anwenderdokumentation in Storybook

Unter **Anwenderdoku** stehen die Anleitung zum Einstieg, die vollständige
Farbkonfiguration, Light/Dark Mode, responsive Größen und die API-/Projektreferenz.
Die Referenz übernimmt diese README direkt, damit beide Stellen synchron bleiben.

## Entwicklung

Node.js 24 (mindestens 24.15) und npm verwenden:

```sh
npm ci
npm run storybook
npm run build
npm test
npm run build-storybook
```

Storybook läuft auf Port 6006. In einer Cloud-Umgebung ist für einen Zugriff von
außen eine entsprechende Portfreigabe erforderlich.

- `libs/shared/ui`: eigenständige, paketierbare Komponentenbibliothek `@creaera/ui`.
- `libs/storybook`: Stories, Dokumentation und Theme-/Größen-Toolbar.
- `AGENTS.md`: Anforderungen und Arbeitsregeln.

## Zentrale Konfiguration

**`libs/shared/ui/src/theme.css`** enthält alle Farbrollen und Größen. Hier werden
Farben, Paddings, Margins, Buttongrößen und die beiden Größenprofile angepasst.
Die CSS-Variablen gelten für alle Komponenten. Der Breakpoint liegt zunächst bei
48rem und steht ebenfalls in dieser Datei.

Am `body` werden `ui-light` oder `ui-dark` gesetzt. Ohne Klasse gilt Light Mode.
Ohne Größenklasse wird die Bildschirmbreite verwendet. `ui-small` bzw. `ui-large`
überschreiben die automatische Größenwahl. Diese Klassen können auch einen
Teilbaum thematisieren.

```html
<body class="ui-dark ui-large"></body>
```

`styles.css` lädt Tailwind und die zentralen Tokens. Im Workspace diese Datei in
die globalen Styles der Anwendung aufnehmen. Das gebaute Paket liefert die
beiden CSS-Dateien mit; für Tailwind-Verbraucher `@creaera/ui/styles.css`
über deren Tailwind/PostCSS-Pipeline importieren. Für andere Verbraucher zuerst
`npx @tailwindcss/cli -i libs/shared/ui/src/styles.css -o dist/ui.css` ausführen
und das erzeugte CSS laden.

## Kleine öffentliche API

Alle Komponenten und Direktiven sind standalone und aus `@creaera/ui` importierbar.
Kein globales Angular-Modul und keine providers-Konfiguration erforderlich.
Native HTML-Attribute und Events werden verwendet, wo sie bereits ausreichen.

| Export         | Verwendung                                | Minimale API                                                                                                            |
| -------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `<button uiButton>`                       | `variant`: primary (Default), secondary, tertiary, text; `type`: button (Default), submit, reset; native disabled/click |
| `Checkbox`     | `<ui-checkbox>Beschriftung</ui-checkbox>` | `[(checked)]`, disabled; alternativ ngModel oder FormControl                                                            |
| `ToggleSwitch` | `<ui-switch>Beschriftung</ui-switch>`     | `[(checked)]`, disabled; alternativ ngModel oder FormControl                                                            |
| `Radio`        | `<input type="radio" uiRadio>`            | native name/value/disabled; ngModel oder FormControl                                                                    |
| `ButtonGroup`  | `<ui-button-group>`                       | options, label, `[(selected)]` (string[]), multiple (Default false), disabled                                           |
| `Chip`         | `<button uiChip>`                         | native disabled/click; Action-Chip ohne Auswahlmodell                                                                   |
| `Dropdown`     | `<ui-dropdown>`                           | label, options, disabled; `(selected)` liefert den value                                                                |
| `OptionButton` | `<ui-option-button>`                      | wie Dropdown, zusätzlich `(action)` für den Hauptbutton                                                                 |

`UiOption` ist `{ value: string; label: string; disabled?: boolean }`.
Werte müssen innerhalb einer Optionsliste eindeutig sein. In Button Groups ist
`selected` auch bei Einfachauswahl ein Array (höchstens ein Eintrag).

```ts
import { Component } from '@angular/core';
import { Button, Checkbox, Dropdown } from '@creaera/ui';

@Component({
  selector: 'app-example',
  imports: [Button, Checkbox, Dropdown],
  template: `
    <button uiButton variant="secondary" (click)="save()">Speichern</button>
    <ui-checkbox [(checked)]="enabled">Benachrichtigungen</ui-checkbox>
    <ui-dropdown label="Aktionen" [options]="options" (selected)="handle($event)" />
  `,
})
export class Example {
  enabled = false;
  options = [{ value: 'copy', label: 'Duplizieren' }];
  save() {
    /* Anwendungsaktion */
  }
  handle(value: string) {
    /* Menüaktion */
  }
}
```

Icons werden als SVG oder anderes Element mit `uiIcon` projiziert. Icon links,
Text rechts ergibt sich aus der Reihenfolge. Icons bleiben weiß. Icon-only
Buttons benötigen ein `aria-label`; dekorative Icons `aria-hidden="true"`.

```html
<button uiButton aria-label="Hinzufügen">
  <svg uiIcon aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" />
  </svg>
</button>
```

## Bedienung und Annahmen

- Buttons und Chips: Hover, Pressed und Focused sind echte CSS-Zustände.
  Mit Maus, Leertaste und Tab in Storybook ausprobieren.
- Checkbox/Switch: integriertes Label, native Checkbox-Semantik, Forms-Unterstützung.
- Radio: `type="radio"` muss im Template stehen, damit Angular den korrekten
  Forms-Accessor auswählt. Ein gemeinsames `name` gruppiert Radios.
- Button Group: Einfachauswahl mit Radiogroup-Semantik, Pfeiltasten, Home/End;
  Mehrfachauswahl mit Toggle-Buttons und `aria-pressed`.
- Menüs sind **Aktionsmenüs**, keine Select-/Formularfelder: Enter/Leertaste oder
  Pfeiltasten öffnen; Pfeile und Home/End navigieren; Escape schließt und setzt
  den Fokus zurück. Tab und ein Klick außerhalb schließen ebenfalls.
- „Active“ bei Checkbox/Radio ist vorerst der bedienbare, nicht ausgewählte Zustand.
- Textbuttons bleiben auch bei Hover/Pressed transparent. Die weiße Border und
  der Fokusindikator folgen den anderen Buttons. Der Text folgt der Theme-Farbe.
- Es gibt bewusst keine Inputs für lokale Farben, Größen oder zusätzliche
  Chip-Varianten. Cards und Formulare folgen später.

## Tests

`npm test` führt Angular-kompilierte Vitest-Tests mit jsdom aus. Sie prüfen native
Button-Semantik, Forms, Auswahlzustände und Menü-/Tastaturinteraktionen.

`npm run test:e2e` baut Storybook und prüft die echten Browseransichten sowie
Themes/Größenprofile mit Playwright. Einmalig `npx playwright install chromium`
ausführen oder `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` auf einen vorhandenen
Chromium setzen. In CI wird Chromium mit Systemabhängigkeiten installiert.

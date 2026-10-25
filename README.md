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

| Export         | Verwendung                                | Minimale API                                                                                                               |
| -------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `<button uiButton>`                       | `variant`: primary (Default), secondary, tertiary, text; `type`: button (Default), submit, reset; native disabled/click    |
| `Checkbox`     | `<ui-checkbox>Beschriftung</ui-checkbox>` | `[(checked)]`, disabled; alternativ ngModel oder FormControl                                                               |
| `ToggleSwitch` | `<ui-switch>Beschriftung</ui-switch>`     | `[(checked)]`, disabled; alternativ ngModel oder FormControl                                                               |
| `Radio`        | `<input type="radio" uiRadio>`            | native name/value/disabled; ngModel oder FormControl                                                                       |
| `ButtonGroup`  | `<ui-button-group>`                       | options, label, `[(selected)]` (string[]), multiple (Default false), disabled                                              |
| `Chip`         | `<ui-chip>`                               | disabled; `(removed)` beim Klick auf das X; Elternkomponente entfernt den Chip                                             |
| `Card`         | `<ui-card>`                               | collapsible (Default false), `[(expanded)]` (Default false), border (primary/secondary), label für die Toggle-Beschriftung |
| `Dropdown`     | `<ui-dropdown>`                           | label, options, disabled; `(selected)` liefert den value                                                                   |
| `OptionButton` | `<ui-option-button>`                      | wie Dropdown, zusätzlich `(action)` für den Hauptbutton                                                                    |

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
  Chip-Varianten. Formularfelder sind ebenfalls verfügbar.

## Tests

`npm test` führt Angular-kompilierte Vitest-Tests mit jsdom aus. Sie prüfen native
Button-Semantik, Forms, Auswahlzustände und Menü-/Tastaturinteraktionen.

`npm run test:e2e` baut Storybook und prüft die echten Browseransichten sowie
Themes/Größenprofile mit Playwright. Einmalig `npx playwright install chromium`
ausführen oder `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` auf einen vorhandenen
Chromium setzen. In CI wird Chromium mit Systemabhängigkeiten installiert.

## Entfernbare Chips und Cards

Chips verwenden jetzt einen Container mit einem separaten X-Button statt
`<button uiChip>`. So entstehen keine verschachtelten Buttons:

```html
@if (showTag) {
<ui-chip (removed)="showTag = false">Designsystem</ui-chip>
}
```

`removed` meldet den Entfernungswunsch; die konsumierende Komponente aktualisiert
ihre Liste. `[disabled]="true"` sperrt das X. Der zugängliche Name enthält den
sichtbaren Chip-Text.

Cards sind weiß mit primärer oder optional sekundärer (grauer) Border, auch im
Dark Mode. `uiCardHeader` markiert den immer sichtbaren Kopf. Der übrige Inhalt
wird bei ausklappbaren Cards ein-/ausgeblendet. Der Pfeil liegt unten mittig;
die ausklappbare Variante sieht durch zwei zusätzliche Ebenen wie drei gestapelte
Cards aus. Cards können ohne besondere Konfiguration ineinander verschachtelt
werden, inklusive unabhängiger ausklappbarer Cards.

```html
<ui-card>
  <h2 uiCardHeader>Übersicht</h2>
  <ui-card collapsible border="secondary" label="Projektdetails" [(expanded)]="detailsOpen">
    <h3 uiCardHeader>Projektdetails</h3>
    <p>Inhalt der inneren Card.</p>
  </ui-card>
</ui-card>
```

`Card` aus `@creaera/ui` importieren. Ohne `collapsible` ist der Inhalt immer
sichtbar. `expanded` startet mit false, steuert bei ausklappbaren Cards den
Inhalt und unterstützt Two-Way-Binding. Ein-/Ausklappen behält Kindzustände bei.
`label` sollte die Card benennen; der Button ergänzt „ausklappen“ / „einklappen“.
`uiCardHeader` ist ein Projektionsattribut ohne zusätzlichen Angular-Import.
`--ui-card-background` und `--ui-card-text` in `theme.css` steuern die weiße
Card-Fläche und deren dunklen Text zentral.

## Formularfelder

`FormField` und `Input` sind Standalone-Exporte aus `@creaera/ui`. Ein kleines
Label steht links über dem Feld; Border und Fokus verwenden die Primärfarbe,
im Fehlerfall `--ui-status-dangerous`.

```html
<ui-form-field label="E-Mail" [error]="emailError">
  <input uiInput type="email" autocomplete="email" [formControl]="email" />
</ui-form-field>
<ui-form-field label="Nachricht">
  <textarea uiInput rows="4" [(ngModel)]="message"></textarea>
</ui-form-field>
```

`label` ist erforderlich; `error` ist ein optionaler Meldungstext (Standard `''`).
Pro FormField ein direktes natives Feld verwenden. Die Bindung erfolgt am
`input`/`textarea`; dadurch bleiben HTML-Attribute, Events sowie Angular Forms
inklusive Zahlenwerten erhalten. Für Reactive Forms `ReactiveFormsModule`, für
`ngModel` `FormsModule` importieren.

Ungültige Angular-Controls erhalten nach `dirty` oder `touched` automatisch eine
rote Border und eine allgemeine Fehlermeldung. Eigene Texte über `error` setzen;
ein nicht leerer Text aktiviert den Fehlerzustand sofort. Die Anwendung definiert
die Validatoren und ruft bei Bedarf `form.markAllAsTouched()` beim Absenden auf.
Ohne Angular Forms steuert `error` den Fehlerzustand. Label, Feld-ID und
Fehlerbeschreibung sind automatisch zugänglich verknüpft.

Storybook enthält Text-, E-Mail-, Passwort-, Zahlen- und Datumsfelder, Textareas,
Fehler-, Disabled- und Readonly-Zustände sowie ein vollständiges Formularbeispiel.
Die Anleitung steht unter **Anwenderdoku → Formularfelder**. Labelgröße und
Farben werden zentral über `theme.css` konfiguriert.

## Autocomplete

`Autocomplete` ergänzt die Formularfelder um Textvorschläge mit lokaler Filterung.

```html
<ui-autocomplete label="Stadt" [options]="cities" [(value)]="city" placeholder="Stadt suchen" />
```

`Autocomplete` aus `@creaera/ui` importieren. `cities` ist ein `readonly string[]`,
`city` ein String. `label` und `options` sind erforderlich; `placeholder`, `error`
und `disabled` optional. Angular Forms (`formControl`, `formControlName`, `ngModel`)
kann alternativ zum Value-Binding verwendet werden. Freier Text ist erlaubt;
fachliche Validatoren definiert die Anwendung. Pfeiltasten, Home/End, Enter,
Escape und Tab bedienen die Vorschlagsliste; der Fokus bleibt im Eingabefeld.
Die vollständige Anleitung steht unter **Anwenderdoku → Autocomplete**.

## Tree und Tree Table

`Tree` (`<ui-tree>`) und `TreeTable` (`<ui-tree-table>`) verwenden dieselbe kleine
API: `nodes`, `label`, `[(expanded)]` als ID-Array, `[(selected)]` als einzelne ID
oder null und `disabled`. Die Tree Table erhält zusätzlich `columns`; ihre erste
Spalte „Name“ zeigt immer die Hierarchie. Zusätzliche Spalten lesen Werte aus
`node.data[column.key]` und zeigen bei fehlenden Werten „—“ an.

```ts
import type { UiTreeNode, UiTreeColumn } from '@creaera/ui';

const nodes: UiTreeNode[] = [
  {
    id: 'project',
    label: 'Projekt',
    children: [{ id: 'buttons', label: 'Buttons', data: { status: 'Fertig' } }],
  },
];
const columns: UiTreeColumn[] = [{ key: 'status', label: 'Status' }];
```

```html
<ui-tree label="Projektstruktur" [nodes]="nodes" [(expanded)]="openIds" [(selected)]="selectedId" />
<ui-tree-table
  label="Projektübersicht"
  [nodes]="nodes"
  [columns]="columns"
  [(expanded)]="openIds"
  [(selected)]="selectedId"
/>
```

Die Daten und Zustandsfelder gehören in die konsumierende Angular-Komponente;
`Tree` bzw. `TreeTable` in deren `imports` aufnehmen. Initial z. B.
`openIds: readonly string[] = ['project']` und `selectedId: string | null = null`.
IDs müssen im gesamten Baum eindeutig sein; Spaltenschlüssel innerhalb einer
Tree Table ebenfalls. Kinder werden über `children` angegeben. `disabled` am
Knoten sperrt ihn und seine Nachfahren. Die Pfeiltasten steuern den Fokus sowie
das Auf-/Zuklappen; Enter oder Leertaste wählen aus. Die Auswahl folgt nicht
automatisch dem Fokus. Ein Klick auf einen Pfeil ändert nur die Aufklappzustände.
Home/End und Navigation über Anfangsbuchstaben sind unterstützt. Ausgeblendete
Knoten bleiben in der Datenquelle und behalten ihren Auswahl-/Aufklappzustand.

Tree hat ARIA-Tree-Semantik, Tree Table eine zeilenfokussierte Treegrid-Semantik.
Zellen sind rein lesend; kein Forms-Adapter ist nötig. Weitere Beispiele und die
genaue Tastaturbelegung stehen in Storybook unter **Anwenderdoku → Trees**.

## Architekturleitfaden

Storybook enthält unter **Architektur** neun Kapitel zu modularen Angular-/Nx-
Anwendungen, Komponentengrenzen, State-Besitz, NgRx Signal Store, CRUD- und
Aktions-APIs, Server-Suche und Tests. Ein zusammenhängendes Projektverwaltungs-
Beispiel veranschaulicht die Entscheidungen.

Die kompilierten Referenzdateien liegen unter
`libs/storybook/examples/architecture`. Die vorgeschlagenen Fach-Libraries und
Backend-Endpunkte sind ein Zielbild für konsumierende Anwendungen; dieses
Repository enthält weiterhin die UI-Bibliothek und Storybook.

```sh
npm run docs:architecture:sync
npm run docs:architecture:check
npm run test:architecture
```

Codeblöcke in den Kapiteln werden aus den echten Beispieldateien übernommen.
Die separaten Tests verwenden Angulars HTTP-Testbackend und prüfen auch
Stornierung, Nebenläufigkeit und Injector-Lifecycle. NgRx 22.0.1 und der Router
sind Entwicklungsabhängigkeiten für diese Beispiele. Das veröffentlichbare
UI-Paket erhält keine NgRx-Laufzeitabhängigkeit.

## Offline-Handbuch als PDF

Das [PDF-Handbuch](docs/creaera-ui-handbuch.pdf) enthält die Anwender- und
Architektur-Dokumentation inklusive Codebeispielen und verlinktem Inhaltsverzeichnis.
In GitHub die PDF-Datei öffnen und über **Download raw file** herunterladen;
auf dem iPad anschließend in Dateien oder Apple Bücher speichern.

Der Export ist eine Momentaufnahme vom 25. Oktober 2026 (Quellstand `ce81ebc`),
keine automatisch aktualisierte Ausgabe. Interaktive Stories bleiben in Storybook.

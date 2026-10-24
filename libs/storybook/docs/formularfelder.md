# Formularfelder

Ein Feld besteht aus **FormField** und einem nativen `input` oder `textarea` mit
der Direktive **Input** (`uiInput`). Das Label steht klein links über dem Feld.
Die Border verwendet die Primärfarbe; im Fehlerfall verwenden Border,
Fokusindikator und Fehlermeldung die zentrale Fehlerfarbe.

## Einstieg

`FormField` und `Input` aus `@creaera/ui` in die `imports` der eigenen
Standalone-Komponente aufnehmen:

```ts
import { Component } from '@angular/core';
import { FormField, Input } from '@creaera/ui';

@Component({
  selector: 'app-contact',
  imports: [FormField, Input],
  template: `
    <ui-form-field label="Name">
      <input uiInput autocomplete="name" placeholder="Vor- und Nachname" />
    </ui-form-field>
    <ui-form-field label="Nachricht">
      <textarea uiInput rows="4" placeholder="Deine Nachricht"></textarea>
    </ui-form-field>
  `,
})
export class Contact {}
```

Pro `ui-form-field` genau ein direktes `input uiInput` oder `textarea uiInput`
verwenden. Das Label wird automatisch über `for` und eine eindeutige Feld-ID
verbunden. Ein eigenes `id` kann als natives Attribut angegeben werden.
Der Placeholder ersetzt das Label nicht.

## Unterschiedliche Eingabetypen

Die Eingabe bleibt ein natives HTML-Feld. Es braucht keine zusätzliche
Komponentenvariante oder eigene Konfiguration für jeden Typ:

```html
<ui-form-field label="E-Mail">
  <input uiInput type="email" autocomplete="email" />
</ui-form-field>
<ui-form-field label="Passwort">
  <input uiInput type="password" autocomplete="new-password" />
</ui-form-field>
<ui-form-field label="Anzahl">
  <input uiInput type="number" min="0" step="1" />
</ui-form-field>
<ui-form-field label="Datum">
  <input uiInput type="date" />
</ui-form-field>
```

Weitere native Typen wie `tel`, `url` und `search` funktionieren genauso.
`type`, `name`, `autocomplete`, `placeholder`, `required`, `min`, `max`, `step`,
`minlength`, `maxlength`, `readonly`, `disabled` und native Events bleiben
nutzbar. Browserdarstellungen etwa des Datum-Pickers können sich unterscheiden.

## Reactive Forms

Die nativen Angular-Value-Accessor bleiben erhalten. Ein Zahlenfeld liefert mit
`type="number"` Zahlen bzw. null für eine leere Eingabe; es wird kein eigener
Wertadapter benötigt.

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, Input, Button } from '@creaera/ui';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, FormField, Input, Button],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <ui-form-field label="E-Mail">
        <input uiInput type="email" formControlName="email" autocomplete="email" />
      </ui-form-field>
      <ui-form-field label="Nachricht">
        <textarea uiInput formControlName="message" rows="4"></textarea>
      </ui-form-field>
      <button uiButton type="submit">Absenden</button>
    </form>
  `,
})
export class ContactForm {
  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      // Fachliche Aktion der Anwendung
    }
  }
}
```

Das Feld zeigt bei einem ungültigen Angular-Control nach der ersten Änderung
(`dirty`) oder nach Verlassen des Feldes (`touched`) automatisch den Fehlerzustand.
Unberührte, leere Pflichtfelder sind zunächst neutral. Ohne individuelle Meldung
erscheint „Bitte Eingabe prüfen.“. `markAllAsTouched()` macht Fehler bei einem
Absendeversuch sichtbar. `reset()` stellt den unberührten Zustand wieder her.

Die fachlichen Validatoren definiert die Anwendung. `type="email"` allein ersetzt
bei einem Reactive FormControl keinen expliziten `Validators.email`.

## Template-driven Forms

`FormsModule` importieren und die Bindung am nativen Feld setzen:

```html
<ui-form-field label="Name">
  <input uiInput name="name" [(ngModel)]="name" required />
</ui-form-field>
```

`name` ist ein Feld der konsumierenden Komponente. Innerhalb eines `form` braucht
jedes `ngModel` einen eindeutigen Namen. Bei Verwendung von `[formControl]` oder
`formControlName` wird stattdessen `ReactiveFormsModule` benötigt.

## Eigene Fehlermeldungen

Ein nicht leerer `error`-Text aktiviert den Fehlerzustand unmittelbar. Das eignet
sich für eine eigene Validierung oder einen Serverfehler:

```html
<ui-form-field label="E-Mail" [error]="emailError">
  <input uiInput type="email" />
</ui-form-field>
```

`emailError` ist ein String; `''` entfernt den expliziten Fehler. Bei weiterhin
ungültigem und bereits bearbeitetem Angular-Control bleibt der automatische
Fehlerzustand bestehen. Die Anwendung entscheidet, wann eine eigene Meldung
nach einer Änderung entfernt wird.

Ohne Angular-Formularbindung wird die Fehlermeldung über `error` gesteuert.
Native HTML-Validierung bleibt verfügbar, wird aber nicht in eigene fachliche
Fehlermeldungen übersetzt. Im Storybook ist unter **Reactive Form** ein
vollständiges Formularbeispiel vorhanden.

## Disabled und Readonly

```html
<ui-form-field label="Name">
  <input uiInput disabled value="Nicht verfügbar" />
</ui-form-field>
<ui-form-field label="Referenz">
  <input uiInput readonly value="UI-2026-001" />
</ui-form-field>
```

Bei Angular Forms `control.disable()` / `control.enable()` verwenden. Readonly
bleibt fokussierbar und sein Wert kann kopiert werden. Disabled folgt dem nativen
HTML-Verhalten. Ein deaktiviertes Angular-Control löst keinen automatischen
Validierungsfehler aus.

## Zugänglichkeit

- `label` ist erforderlich und bleibt stets oberhalb sichtbar.
- IDs werden automatisch erzeugt oder über `id` vorgegeben.
- Fehler setzen `aria-invalid="true"` und werden über `aria-describedby` verknüpft.
- Zusätzliches Hilfswissen kann über `aria-describedby="help-id"` ergänzt werden;
  die Fehlerbeschreibung wird angehängt.
- Meldungen verwenden eine höfliche Live-Region. Der Fehler wird als Text und
  durch die Border dargestellt.

## Zentrale Gestaltung

| Token                          | Verwendung                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| `--ui-interaction-primary`     | Normale Border und Fokusfarbe                               |
| `--ui-status-dangerous`        | Fehlerborder, Fehlerfokus und Fehlermeldung                 |
| `--ui-field-label-size`        | Kleine Label- und Fehlermeldungsschrift; Standard `0.75rem` |
| `--ui-background-secondary`    | Feldfläche                                                  |
| `--ui-font-default`            | Feldtext und Label                                          |
| `--ui-font-size`               | Eingabeschrift nach Größenprofil                            |
| `--ui-button-height`           | Mindesthöhe einzeiliger Felder nach Größenprofil            |
| `--ui-padding` / `--ui-radius` | Innenabstand und Rundung                                    |

Die Tokens stehen in `libs/shared/ui/src/theme.css`. Light/Dark Mode und die
beiden Größenprofile gelten auch für diese Felder. Textareas sind vertikal
vergrößerbar und haben eine Mindesthöhe von 7rem; `rows` steuert zusätzlich ihre
native Ausgangshöhe.

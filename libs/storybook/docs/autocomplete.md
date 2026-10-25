# Autocomplete

`Autocomplete` ergänzt ein Textfeld um eine gefilterte Vorschlagsliste. Label,
Border und Fehleranzeige folgen den Formularfeldern: kleines Label links oben,
Primärfarbe für die normale Border und die zentrale Fehlerfarbe bei Fehlern.

## Einfacher Einstieg

```ts
import { Component } from '@angular/core';
import { Autocomplete } from '@creaera/ui';

@Component({
  selector: 'app-city',
  imports: [Autocomplete],
  template: `
    <ui-autocomplete label="Stadt" [options]="cities" [(value)]="city" placeholder="Stadt suchen" />
  `,
})
export class City {
  cities = ['Berlin', 'Bern', 'Bremen', 'Hamburg', 'München'];
  city = '';
}
```

Die Vorschläge sind Strings. Der gewählte String wird als Eingabewert übernommen.
Groß-/Kleinschreibung wird beim Filtern ignoriert; gesucht wird nach enthaltenem
Text. Doppelte identische Vorschläge werden zusammengefasst.

Freier Text bleibt erlaubt. Die Liste bietet Vorschläge und erzwingt keine
Auswahl. Wenn die Anwendung ausschließlich vorhandene Werte erlauben soll,
kann sie dafür einen eigenen Angular-Validator hinterlegen.

## API

| Input / Binding | Bedeutung                                                               |
| --------------- | ----------------------------------------------------------------------- |
| `label`         | Erforderliche sichtbare und zugängliche Feldbeschriftung                |
| `options`       | Erforderliches Array von Textvorschlägen (`readonly string[]`)          |
| `[(value)]`     | Aktueller Text; Standard `''`                                           |
| `placeholder`   | Optionaler Placeholder                                                  |
| `error`         | Eigene Fehlermeldung; ein nicht leerer Text aktiviert den Fehlerzustand |
| `disabled`      | Feld und Vorschlagsauswahl sperren                                      |

Alternativ zu `[(value)]` kann Angular Forms verwendet werden. Pro Feld eine
Zustandsquelle wählen, also entweder `value`-Binding oder eine Formularbindung.
Der Fokus bleibt während der Listennavigation auf dem Eingabefeld.

## Angular Forms

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Autocomplete } from '@creaera/ui';

@Component({
  selector: 'app-city-form',
  imports: [ReactiveFormsModule, Autocomplete],
  template: ` <ui-autocomplete label="Stadt" [options]="cities" [formControl]="city" /> `,
})
export class CityForm {
  cities = ['Berlin', 'Bern', 'Hamburg'];
  city = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}
```

`formControlName` innerhalb einer FormGroup und `[(ngModel)]` mit `FormsModule`
werden ebenfalls unterstützt. Das Control speichert einen String, kein
Optionsobjekt. Eingeben und Auswählen melden den neuen Wert an Angular Forms.
Verlassen des Feldes markiert es als berührt.

Ein ungültiges Control zeigt nach `dirty` oder `touched` automatisch „Bitte Eingabe
prüfen.“ an. Eine eigene Meldung kann über `error` gesetzt werden. Beim Absenden
bei Bedarf `form.markAllAsTouched()` aufrufen. `reset()` setzt den Wert und
Formularstatus zurück; `disable()` schließt die Liste und sperrt das Feld.

## Tastatur und Maus

| Aktion                           | Verhalten                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Feld fokussieren                 | Passende Vorschläge öffnen                                                       |
| Tippen                           | Vorschläge lokal filtern, ohne automatisch einen Wert auszuwählen                |
| Pfeil abwärts / aufwärts         | Liste öffnen und zwischen Vorschlägen wechseln, mit Umlauf                       |
| Home / End bei aktivem Vorschlag | Ersten / letzten Vorschlag aktivieren                                            |
| Enter bei aktivem Vorschlag      | Vorschlag übernehmen und Liste schließen                                         |
| Enter ohne aktiven Vorschlag     | Freien Text behalten; normales Absenden eines Formulars bleibt möglich           |
| Escape                           | Liste schließen, eingegebenen Text behalten                                      |
| Tab                              | Liste schließen und zum nächsten Control wechseln; nichts automatisch übernehmen |
| Klick auf Vorschlag              | Vorschlag übernehmen, Fokus bleibt im Textfeld                                   |
| Klick außerhalb / Verlassen      | Liste schließen                                                                  |

Wenn nichts passt, erscheint „Keine Vorschläge gefunden.“. Das Feld bleibt
editierbar. Der aktive Vorschlag und die Listenzuordnung werden über
`aria-activedescendant`, `aria-controls` und `aria-expanded` vermittelt. Die
Vorschläge haben Listbox-/Option-Semantik. Fehler werden mit dem Feld verbunden.

## Vorschläge und Darstellung anpassen

Die Anwendung übergibt ein neues `options`-Array, wenn sich ihre Daten ändern.
Die Komponente filtert dieses Array lokal. Daten laden und fachliche Validierung
bleiben Aufgabe der Anwendung.

Theme und Größenprofil gelten wie bei den Formularfeldern. Die Liste erscheint
unter dem Feld, hat eine begrenzte Höhe und scrollt bei vielen Vorschlägen. Für
Container mit `overflow: hidden` muss die Anwendung ausreichend Platz vorsehen,
damit das lokale Popup nicht abgeschnitten wird.

## In Storybook ausprobieren

Unter **Components → Autocomplete** gibt es Default, Prefilled, No Results, Error,
Disabled und Reactive Form. Zum Beispiel `Ber` tippen, mit den Pfeiltasten einen
Vorschlag aktivieren und Enter drücken. In der Toolbar beide Themes und die
Größenprofile testen.

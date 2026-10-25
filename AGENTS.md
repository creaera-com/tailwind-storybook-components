# Projektanforderungen und Arbeitsregeln

## Freigabestatus

Die Umsetzung der ersten Phase ist vom Nutzer freigegeben.
Die Anforderungen und die Umsetzung dürfen committed werden.

## Git-Workflow

- Änderungen auf einem eigenen Branch entwickeln und als Pull Request öffnen.
- Nicht direkt auf `main` pushen.

## Komponenten-API

- Eigenständige, sinnvoll geschnittene Angular-Komponenten, ähnlich Angular
  Material oder PrimeNG.
- Zum Start die kleinstmögliche sinnvolle öffentliche API: nur notwendige
  Inputs, Outputs und Zustände, keine vorsorglichen Konfigurationsoptionen.
- Gemeinsames Design zentral konfigurieren statt zahlreiche Styling-Inputs
  pro Komponente einzuführen.

## Ziel und Technologie

- Angular-Komponentenbibliothek in einem Nx-Repository.
- Zum Umsetzungsbeginn die aktuellsten stabilen, miteinander kompatiblen
  Versionen von Angular, Tailwind CSS, Storybook und Nx prüfen und verwenden.
  Falls die jeweils neuesten Versionen inkompatibel sind, die Abweichung abstimmen.
- Komponentenbibliothek unter `./libs/shared/ui`.
- Storybook unter `./libs`; der genaue Unterordner ist noch offen.

## Zentrale Design-Konfiguration

Farben und Größen sollen zentral konfigurierbar und nachträglich änderbar sein.
Eine harmonische grüne Palette dient als Ausgangspunkt; konkrete Farbwerte
dürfen bei der Umsetzung sinnvoll angenommen werden.

### Farbrollen

| Bereich      | Rollen                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| Background   | primary, secondary, tertiary                                                     |
| Fonts        | active, default, disabled                                                        |
| Interactions | primary, secondary, disabled, hover, pressed-primary, pressed-secondary, divider |
| Status       | normal, caution, dangerous                                                       |

Die Schreibweisen sind gegenüber der ursprünglichen Aufnahme vereinheitlicht.

### Themes und Größenprofile

- Light Mode und Dark Mode mit zentraler Umschaltung für alle Komponenten.
- Eine Klasse am `body` mit CSS-Variablen ist ein vorgeschlagener Ansatz;
  die konkrete technische Lösung ist noch nicht verbindlich festgelegt.
- Paddings, Margins und Buttongrößen sind zentral konfigurierbar.
- Zwei Größenprofile: kleinere und größere Bildschirme.
- Vorgesehen ist eine automatische Umschaltung nach Bildschirmbreite mit
  möglicher zentraler Überschreibung durch eine CSS-Klasse.
- Konkrete Größen und Breakpoints sind noch offen; sinnvolle Annahmen sind möglich.

## Komponenten der ersten Phase

### Buttons

| Variante       | Default                                      | Weitere Zustände                                                                                                                                              |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primärbutton   | Primärer Standardhintergrund                 | Hover: weiße Border. Pressed: dicke weiße Border. Disabled: weiße Border und Disabled-Farbe. Focused: doppelte weiße Border bei primärem Standardhintergrund. |
| Sekundärbutton | Sekundärer Standardhintergrund               | Dasselbe Zustandsverhalten mit der Sekundärfarbe.                                                                                                             |
| Tertiärbutton  | Grauer Hintergrund und Border in Primärfarbe | Ansonsten dasselbe Zustandsverhalten.                                                                                                                         |
| Textbutton     | Ohne Hintergrundfarbe                        | Das bekannte Zustandsverhalten; genaue Ausgestaltung noch offen.                                                                                              |

- Buttons unterstützen Icon links und Text rechts oder ausschließlich ein Icon.
- Iconfarbe: weiß.
- Die genaue Zuordnung der Standardhintergründe zu den Farbrollen ist noch offen.

### Weitere Komponenten

| Komponente    | Anforderungen                                                                             |
| ------------- | ----------------------------------------------------------------------------------------- |
| Toggle Switch | Zustände active, inactive und disabled.                                                   |
| Button Group  | Weiße Außenborder. Eine Variante mit Einfachauswahl, eine mit Mehrfachauswahl.            |
| Radio Button  | Zustände active, selected und disabled.                                                   |
| Checkbox      | Zustände active, selected und disabled.                                                   |
| Chip          | Zustände default, hover, pressed, disabled und focused.                                   |
| Option Button | Button mit danebenliegendem Pfeil zum Aufklappen einer Optionsliste.                      |
| Dropdown-Menü | Eigenständige gewünschte Komponente; Varianten, Zustände und Auswahlverhalten noch offen. |

Alle Komponenten berücksichtigen die zentralen Themes und Größenprofile.

## Umsetzungsannahmen bis zum Nutzerfeedback

- „Active“ bei Checkbox und Radio bedeutet bedienbar und nicht ausgewählt.
- Textbuttons bleiben in allen Zuständen transparent.
- Dropdown und Optionslisten sind zunächst Aktionsmenüs, keine Formular-Selects.
- Storybook liegt unter `./libs/storybook`.
- CSS-Variablen in `libs/shared/ui/src/theme.css` bilden die zentrale Konfiguration.
- Der automatische Größenwechsel erfolgt ab 48rem; `ui-small` und `ui-large`
  überschreiben ihn. `ui-light` und `ui-dark` steuern das Theme.
- Die konkreten Grün-, Grau- und Statusfarben sowie Größen sind erste Annahmen
  und können nach Nutzerfeedback zentral angepasst werden.

Diese Entscheidungen nicht als ausdrücklich vom Nutzer vorgegebene Details
bezeichnen. Die minimale öffentliche API ist in README.md dokumentiert.

## Spätere Erweiterungen

Cards und Formularfelder sind inzwischen freigegeben.

## Ergänzungen: Chips, Sekundärfarbe und Cards

- Chips erhalten einen kleinen, separaten X-Button zum Entfernen.
- Die Sekundärfarbe ist in beiden Themes grau, inklusive Hover und Pressed.
- Cards: normale und ausklappbare Variante; Cards dürfen verschachtelt werden.
- Ausklappbare Cards haben unten mittig einen Pfeil und sehen wie drei
  übereinander gestapelte Cards aus.
- Card-Flächen sind weiß; die Border ist primär oder optional sekundär.

## Ergänzungen: Formularfelder

- Unterschiedliche native Eingabetypen und mehrzeilige Textfelder anbieten.
- Kleine Labels links oberhalb der Felder.
- Primärfarbene Border im Normalzustand, zentrale rote Fehlerfarbe bei Fehlern.
- Angular Forms, zugängliche Label-/Fehlerverknüpfung sowie zentrale Themes und Größen berücksichtigen.

## Ergänzung: Autocomplete

- Autocomplete mit Vorschlägen, lokaler Textfilterung und Tastaturbedienung.
- Labels, Border, Fehlerzustände, Themes und Größen wie bei den Formularfeldern.
- Kleine API mit Textvorschlägen und Unterstützung für Angular Forms.
- Startannahme: Freier Text ist zulässig; fachliche Einschränkungen über Validatoren.

## Ergänzungen: Tree und Tree Table

- Eigenständige Komponenten für hierarchische Daten und eine hierarchische Tabelle.
- Gemeinsames minimales Datenmodell, Einfachauswahl und steuerbare offene Knoten.
- Zugängliche Tastaturbedienung; Themes und Größen folgen der zentralen Konfiguration.
- Details und getroffene Startannahmen sind in der Storybook-Anwenderdoku beschrieben.

## Architektur-Dokumentation

- Unter Storybook/Architektur liegt der mehrseitige Leitfaden für konsumierende Anwendungen.
- Referenzcode liegt in `libs/storybook/examples/architecture`, getrennt von der UI-Bibliothek.
- Geänderte Codeblöcke mit `npm run docs:architecture:sync` aus den Quellen aktualisieren.
- Synchronität mit `npm run docs:architecture:check` und Verhalten mit `npm run test:architecture` prüfen.
- Beschriebene Zielstrukturen und API-Verträge nicht als bereits implementiertes Backend darstellen.

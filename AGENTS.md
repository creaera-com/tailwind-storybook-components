# Projektanforderungen und Arbeitsregeln

## Freigabestatus

Die Umsetzung der ersten Phase ist vom Nutzer freigegeben.
Die Anforderungen und die Umsetzung dürfen committed werden.

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

| Bereich | Rollen |
| --- | --- |
| Background | primary, secondary, tertiary |
| Fonts | active, default, disabled |
| Interactions | primary, secondary, disabled, hover, pressed-primary, pressed-secondary, divider |
| Status | normal, caution, dangerous |

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

| Variante | Default | Weitere Zustände |
| --- | --- | --- |
| Primärbutton | Primärer Standardhintergrund | Hover: weiße Border. Pressed: dicke weiße Border. Disabled: weiße Border und Disabled-Farbe. Focused: doppelte weiße Border bei primärem Standardhintergrund. |
| Sekundärbutton | Sekundärer Standardhintergrund | Dasselbe Zustandsverhalten mit der Sekundärfarbe. |
| Tertiärbutton | Grauer Hintergrund und Border in Primärfarbe | Ansonsten dasselbe Zustandsverhalten. |
| Textbutton | Ohne Hintergrundfarbe | Das bekannte Zustandsverhalten; genaue Ausgestaltung noch offen. |

- Buttons unterstützen Icon links und Text rechts oder ausschließlich ein Icon.
- Iconfarbe: weiß.
- Die genaue Zuordnung der Standardhintergründe zu den Farbrollen ist noch offen.

### Weitere Komponenten

| Komponente | Anforderungen |
| --- | --- |
| Toggle Switch | Zustände active, inactive und disabled. |
| Button Group | Weiße Außenborder. Eine Variante mit Einfachauswahl, eine mit Mehrfachauswahl. |
| Radio Button | Zustände active, selected und disabled. |
| Checkbox | Zustände active, selected und disabled. |
| Chip | Zustände default, hover, pressed, disabled und focused. |
| Option Button | Button mit danebenliegendem Pfeil zum Aufklappen einer Optionsliste. |
| Dropdown-Menü | Eigenständige gewünschte Komponente; Varianten, Zustände und Auswahlverhalten noch offen. |

Alle Komponenten berücksichtigen die zentralen Themes und Größenprofile.

## Offene Details

- Bedeutung von active gegenüber selected bei Radio Buttons und Checkboxen.
- Konkrete Gestaltung und Zustände der Textbuttons.
- Verhalten und Gestaltung der Optionslisten und des Dropdown-Menüs.
- Genaue Storybook-Verzeichnisstruktur unter `./libs`.
- Farbwerte, Größen, Breakpoints und konkrete Konfigurationsstruktur.

Offene Punkte nicht als bereits abgestimmte Anforderungen darstellen.

## Spätere Erweiterungen

Cards und Formulare sind für eine spätere Phase vorgesehen und gehören nicht
zum aktuellen Implementierungsumfang.

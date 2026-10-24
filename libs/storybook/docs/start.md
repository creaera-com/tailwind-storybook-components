# Creaera UI verwenden

Die Komponentenbibliothek stellt Angular-Komponenten mit einer bewusst kleinen
API bereit. Gemeinsame Farben und Größen werden zentral gepflegt. Es gibt
keine Farb- oder Größenparameter pro Komponente.

## Orientierung in Storybook

- **Anwenderdoku:** Einrichtung, zentrale Farben, Light/Dark Mode, responsive
  Größen und die vollständige API-/Projektreferenz.
- **Foundations → Overview:** alle Komponenten auf einer gemeinsamen Beispielseite.
- **Components:** einzelne Komponenten, Varianten, Controls und automatisch
  erzeugte API-Dokumentation unter **Docs**.

Die Toolbar in den Komponenten-Stories bietet **Farbschema** (`light`, `dark`)
und **Größenprofil** (`auto`, `small`, `large`). Zum Ausprobieren eine Story oder
**Foundations → Overview** öffnen. Die Textseiten dieser Anwenderdoku verwenden
Storybooks eigene Dokumentationsoberfläche; die Toolbar verändert die
Komponenten-Vorschau, nicht das Theme der Storybook-Navigation.

## Lokal starten

Voraussetzungen: Node.js 24 ab Version 24.15 und npm.

```sh
npm ci
npm run storybook
```

Storybook startet auf Port 6006. In einer Cloud-Umgebung benötigt der Zugriff von
außen eine Portfreigabe. Es sind keine Backend-Dienste oder Zugangsdaten nötig.

## Komponenten in Angular einbinden

Alle Komponenten und Direktiven sind standalone und aus `@creaera/ui`
importierbar. Das Alias ist im Nx-Workspace bereits eingerichtet.

```ts
import { Component } from '@angular/core';
import { Button, Checkbox } from '@creaera/ui';

@Component({
  selector: 'app-example',
  imports: [Button, Checkbox],
  template: `
    <button uiButton (click)="save()">Speichern</button>
    <ui-checkbox [(checked)]="enabled">Benachrichtigungen</ui-checkbox>
  `,
})
export class Example {
  enabled = false;

  save() {
    // Aktion der Anwendung
  }
}
```

Angular-Bindings wie `[(checked)]` stehen im Angular-Template. Die API aller
Komponenten und weitere Beispiele finden sich unter **API und Projektaufbau**.

## Globale Styles einbinden

Im Workspace `libs/shared/ui/src/styles.css` in die globalen Styles der
Angular-Anwendung aufnehmen. Storybook macht das bereits über seine
Projektkonfiguration. Die Datei lädt Tailwind CSS und `theme.css`.

Beispiel für den `styles`-Eintrag eines Angular-Build-Targets in `project.json`:

```json
{
  "styles": ["libs/shared/ui/src/styles.css", "apps/my-app/src/styles.css"]
}
```

Die anwendungseigene CSS-Datei kommt danach, damit dort Theme-Tokens überschrieben
werden können. Den Beispielpfad `apps/my-app` an das eigene Projekt anpassen.
Die PostCSS-Konfiguration des Workspaces enthält bereits `@tailwindcss/postcss`.

Das gebaute Paket exportiert `@creaera/ui/styles.css` und `@creaera/ui/theme.css`.
In einem anderen Tailwind-Projekt wird die erste Datei über dessen
Tailwind-/PostCSS-Pipeline importiert. Sie ist Tailwind-Quell-CSS und muss
verarbeitet werden. Wer fertiges CSS ohne Tailwind-Pipeline benötigt, kann es
im Workspace erzeugen und danach global laden:

```sh
npx @tailwindcss/cli -i libs/shared/ui/src/styles.css -o dist/ui.css
```

Eine Veröffentlichung in einer Paket-Registry ist damit nicht verbunden.

## Theme und Größenprofil setzen

```html
<body class="ui-dark ui-large">
  <!-- Angular-Anwendung -->
</body>
```

Ohne Klassen gelten Light Mode und die automatische Größenwahl nach
Bildschirmbreite. Es sollte immer nur eine Theme-Klasse und höchstens eine
Größenklasse aktiv sein. Beide Einstellungen sind voneinander unabhängig.

## Bauen und prüfen

| Befehl                    | Ergebnis                                                        |
| ------------------------- | --------------------------------------------------------------- |
| `npm run build`           | Paketierbare Angular-Bibliothek in `dist/libs/shared/ui`        |
| `npm run storybook`       | Interaktiver Entwicklungsserver auf Port 6006                   |
| `npm run build-storybook` | Statisches Storybook inklusive Anwenderdoku in `dist/storybook` |
| `npm test`                | Komponententests einschließlich Forms und Tastaturbedienung     |
| `npm run test:e2e`        | Storybook-Build und echte Browsertests                          |
| `npm run format:check`    | Formatierungsprüfung                                            |

Für die Browsertests einmalig `npx playwright install chromium` ausführen oder
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` auf einen vorhandenen Chromium setzen.
Cards stehen als normale und ausklappbare Variante bereit. Formulare sind für eine spätere Erweiterung vorgesehen.

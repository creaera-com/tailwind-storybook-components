# Farben zentral konfigurieren

Die zentrale Konfiguration ist **`libs/shared/ui/src/theme.css`**. Sie enthält
CSS-Variablen für alle semantischen Farbrollen und beide Größenprofile.
`styles.css` verwendet diese Variablen für die Komponenten und ordnet ausgewählte
Tokens Tailwind-Utilities zu. Die Ausgangspalette ist Grün.

## Aufbau der Farbkonfiguration

```css
:root,
.ui-light {
  /* Farbwerte für Light Mode */
  --ui-interaction-primary: #146c43;
}

.ui-dark {
  /* Farbwerte für Dark Mode */
  --ui-interaction-primary: #237a4f;
}
```

Zum Ändern der Bibliotheksvorgaben die Werte direkt in `theme.css` bearbeiten.
Die Anpassung gilt für alle Komponenten. Für eine eigene Anwendung können
alternativ Tokens in deren globaler CSS-Datei **nach** den Bibliotheksstyles
überschrieben werden. Dafür sind keine Änderungen an Komponenten nötig.

## Alle Farbrollen

| Bereich      | CSS-Variable                         | Verwendung / Bedeutung                      |
| ------------ | ------------------------------------ | ------------------------------------------- |
| Background   | `--ui-background-primary`            | Seitenhintergrund                           |
| Background   | `--ui-background-secondary`          | Flächen und Menü-Hintergründe               |
| Background   | `--ui-background-tertiary`           | Graue Flächen, etwa Tertiärbuttons          |
| Fonts        | `--ui-font-active`                   | Schrift auf gefüllten Buttons               |
| Fonts        | `--ui-font-default`                  | Standardtext und Textbuttons                |
| Fonts        | `--ui-font-disabled`                 | Text auf deaktivierten gefüllten Buttons    |
| Interactions | `--ui-interaction-primary`           | Primäraktionen und ausgewählte Controls     |
| Interactions | `--ui-interaction-secondary`         | Sekundäraktionen                            |
| Interactions | `--ui-interaction-disabled`          | Deaktivierte Interaktionsflächen bzw. Texte |
| Interactions | `--ui-interaction-hover`             | Gemeinsame Hover-Farbe gefüllter Buttons    |
| Interactions | `--ui-interaction-pressed-primary`   | Gedrückte Primäraktionen                    |
| Interactions | `--ui-interaction-pressed-secondary` | Gedrückte Sekundäraktionen                  |
| Interactions | `--ui-interaction-divider`           | Trennlinien und dezente Umrandungen         |
| Status       | `--ui-status-normal`                 | Normaler Status                             |
| Status       | `--ui-status-caution`                | Hinweis / Vorsicht                          |
| Status       | `--ui-status-dangerous`              | Gefahr / Fehler                             |

Statusfarben stehen als Design-Tokens bereit. Eigenständige Statuskomponenten
sind noch nicht Bestandteil der Bibliothek.

## Beispiel: eine andere Grünpalette

In der globalen Anwendungs-CSS-Datei nach den Bibliotheksstyles:

```css
:root,
.ui-light {
  --ui-interaction-primary: #166534;
  --ui-interaction-secondary: #3f6250;
  --ui-interaction-hover: #14532d;
  --ui-interaction-pressed-primary: #104326;
  --ui-interaction-pressed-secondary: #2e493b;
  --ui-background-primary: #f0fdf4;
  --ui-font-default: #153523;
}

.ui-dark {
  --ui-interaction-primary: #28734c;
  --ui-interaction-secondary: #3d6450;
  --ui-interaction-hover: #205f3f;
  --ui-interaction-pressed-primary: #174b31;
  --ui-interaction-pressed-secondary: #2d4b3b;
  --ui-background-primary: #0d1b13;
  --ui-font-default: #e4f4e9;
}
```

Beide Themes separat pflegen und bei Änderungen auch Hover, Pressed, Disabled
und Focus prüfen. Die Beispiele sind Startwerte, keine verbindliche Farbpalette.

## Tailwind-Utilities

Die Zuordnung steht in `libs/shared/ui/src/styles.css` unter `@theme inline`.
Beispiele:

```html
<section class="bg-ui-background text-ui-text p-ui-padding">
  <p class="text-ui-normal">Gespeichert</p>
  <p class="text-ui-caution">Bitte prüfen</p>
  <p class="text-ui-dangerous">Fehler</p>
</section>
```

| Utility-Beispiel    | Zugeordnetes Token           |
| ------------------- | ---------------------------- |
| `bg-ui-background`  | `--ui-background-primary`    |
| `bg-ui-surface`     | `--ui-background-secondary`  |
| `bg-ui-primary`     | `--ui-interaction-primary`   |
| `bg-ui-secondary`   | `--ui-interaction-secondary` |
| `text-ui-text`      | `--ui-font-default`          |
| `border-ui-divider` | `--ui-interaction-divider`   |
| `text-ui-normal`    | `--ui-status-normal`         |
| `text-ui-caution`   | `--ui-status-caution`        |
| `text-ui-dangerous` | `--ui-status-dangerous`      |

Tailwind muss die Templates der konsumierenden Anwendung als Quellen erfassen.
Falls die automatische Erkennung dort nicht greift, diese über eine eigene
`@source`-Angabe ergänzen.

## Bewusst feste Farben

Die weißen Button-Borders, weißen Icons und weißen Switch-Knöpfe sind derzeit
entsprechend den Anforderungen fest weiß und keine separaten Farb-Tokens.
Checkboxen und Radios nutzen zusätzlich native Browserdarstellung mit
`accent-color`. Daher lassen sich nicht sämtliche Details ihrer Darstellung
über die Palette verändern.

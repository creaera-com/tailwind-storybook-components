# Responsive Größen

Die Bibliothek besitzt zwei Größenprofile. Die Bildschirmbreite wählt das Profil
automatisch; eine zentrale Klasse kann diese Wahl überschreiben. Das Theme bleibt
davon unabhängig.

## Automatische Wahl

Ohne `ui-small` oder `ui-large` gilt:

| Viewportbreite            | Profil |
| ------------------------- | ------ |
| Unter `48rem`             | Klein  |
| Ab einschließlich `48rem` | Groß   |

`48rem` entspricht bei der üblichen Ausgangsschriftgröße von 16px ungefähr 768px.
Maßgeblich ist die Viewportbreite, nicht die Breite eines einzelnen Containers.
Das ist ein gemeinsamer Breakpoint, keine Erkennung eines bestimmten Gerätetyps.

```html
<body class="ui-light">
  <!-- Größenprofil wechselt automatisch mit dem Viewport -->
</body>
```

## Profil ausdrücklich vorgeben

```html
<body class="ui-light ui-small"></body>
<body class="ui-dark ui-large"></body>
```

Dies sind alternative Einstellungen. Immer höchstens eine Größenklasse setzen.
`ui-small` erzwingt das kleine Profil auch auf einem großen Bildschirm;
`ui-large` erzwingt das große Profil auch auf einem kleinen Bildschirm.
Die Klassen können auch auf einem Container einen Teilbaum betreffen.

Zurück zur automatischen Auswahl:

```ts
document.body.classList.remove('ui-small', 'ui-large');
```

Zur Laufzeit ein bestimmtes Profil setzen:

```ts
function setSize(size: 'auto' | 'small' | 'large'): void {
  document.body.classList.remove('ui-small', 'ui-large');
  if (size !== 'auto') document.body.classList.add(`ui-${size}`);
}
```

## Zentrale Größen-Tokens

Die Werte stehen in **`libs/shared/ui/src/theme.css`**:

| Token                 | Klein      | Groß       | Verwendung                                         |
| --------------------- | ---------- | ---------- | -------------------------------------------------- |
| `--ui-padding`        | `0.75rem`  | `1rem`     | Gemeinsames Padding, unter anderem Menüeinträge    |
| `--ui-margin`         | `0.75rem`  | `1rem`     | Gemeinsamer Margin-Token für eigene Layouts        |
| `--ui-button-height`  | `2.75rem`  | `3rem`     | Mindesthöhe und Mindestbreite der Buttons          |
| `--ui-button-padding` | `1rem`     | `1.25rem`  | Horizontaler Button-Innenabstand                   |
| `--ui-font-size`      | `0.875rem` | `1rem`     | Schriftgröße der Buttons und Auswahl-Labels        |
| `--ui-control-size`   | `1.25rem`  | `1.375rem` | Größe nativer Checkboxen und Radios                |
| `--ui-radius`         | `0.625rem` | `0.625rem` | Gemeinsamer Radius, derzeit ohne Profilunterschied |

Nicht jede Komponente verwendet jeden Token. Chips und der Switch haben derzeit
zusätzliche feste Maße in `styles.css`; sie werden nicht vollständig durch das
Button-Höhen-Token skaliert. Es gibt keinen lokalen Größen-Input pro Komponente.

## Werte ändern

`theme.css` hat vier relevante Bereiche:

1. `:root`: Standardwerte für das kleine Profil sowie gemeinsame Werte.
2. `@media (min-width: 48rem)`: automatische Werte für das große Profil.
3. `.ui-small`: erzwungene kleine Werte.
4. `.ui-large`: erzwungene große Werte.

Bei einer Profiländerung **die automatische Variante und die entsprechende
Klassenvariante gemeinsam** ändern. Andernfalls weichen automatische und
manuell gewählte Größe voneinander ab.

Beispiel: Buttonhöhe für das große Profil auf `3.25rem` anheben:

```css
@media (min-width: 48rem) {
  :root {
    --ui-button-height: 3.25rem;
  }
}

.ui-large {
  --ui-button-height: 3.25rem;
}
```

Diese Regeln entweder in der zentralen Datei anpassen oder nach den
Bibliotheksstyles in der Anwendung ergänzen. Für einen anderen Breakpoint die
Media Query in der zentralen Datei ändern. Die Breakpoint-Grenze ist CSS-Syntax
und kein zur Laufzeit überschreibbarer CSS-Variablenwert.

## Padding und Margin in eigenen Layouts

```html
<section class="p-ui-padding m-ui-margin">
  <!-- Layout nutzt dieselben zentralen Abstände -->
</section>
```

Alternativ direkt CSS verwenden:

```css
.my-section {
  padding: var(--ui-padding);
  margin: var(--ui-margin);
}
```

Der Margin-Token verteilt Abstände nicht automatisch auf jedes Element. Die
Anwendung entscheidet, wo sie ihn verwendet.

## In Storybook prüfen

1. **Foundations → Overview** oder eine Komponenten-Story öffnen.
2. In der Toolbar **Größenprofil** auf `auto`, `small` oder `large` setzen.
3. Für `auto` die Viewportbreite über und unter `48rem` ändern.
4. Prüfen, dass `small` bzw. `large` auch bei anderer Viewportbreite bestehen bleibt.

Die Toolbar setzt die Klassen auf den Body der Vorschau, nicht auf die
Storybook-Sidebar. Sie verändert außerdem nicht selbst die Bildschirmauflösung.

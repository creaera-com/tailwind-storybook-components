# Light und Dark Mode

Das Theme wird zentral über eine Klasse am `body` ausgewählt. Die Komponenten
erben die CSS-Variablen und wechseln gemeinsam ihr Farbschema. Ein Theme-Input
an jeder Komponente ist nicht erforderlich.

## Light Mode

```html
<body class="ui-light">
  <!-- Angular-Anwendung -->
</body>
```

Ohne Theme-Klasse gilt ebenfalls Light Mode, weil die Light-Tokens auf `:root`
liegen.

## Dark Mode

```html
<body class="ui-dark">
  <!-- Angular-Anwendung -->
</body>
```

`.ui-dark` überschreibt die Farb-Tokens und setzt `color-scheme: dark`, damit
auch unterstützte native Browser-Controls das dunkle Schema berücksichtigen.
Es wird nicht automatisch anhand der Betriebssystemeinstellung umgeschaltet.

## Zur Laufzeit wechseln

Die bisherige Theme-Klasse entfernen, bevor die neue gesetzt wird:

```ts
function setTheme(theme: 'light' | 'dark'): void {
  document.body.classList.remove('ui-light', 'ui-dark');
  document.body.classList.add(`ui-${theme}`);
}

setTheme('dark');
```

Das Beispiel ist für den Browser gedacht. Falls die Anwendung serverseitig
rendert, darf der Zugriff auf `document` nur im Browser erfolgen. Speichern der
Nutzerpräferenz oder Übernehmen von `prefers-color-scheme` ist Aufgabe der
konsumierenden Anwendung; die Bibliothek legt dafür keine zusätzliche API fest.

## Eigene Flächen und Texte

Damit auch selbst erstellte Layouts umschalten, dort die Tokens oder die
zugehörigen Tailwind-Utilities nutzen. Ein Theme ändert nicht automatisch jeden
beliebigen Hintergrund der Anwendung:

```css
body {
  background: var(--ui-background-primary);
  color: var(--ui-font-default);
}
```

```html
<main class="bg-ui-background text-ui-text">
  <!-- Eigener Inhalt und UI-Komponenten -->
</main>
```

## Theme für einen Teilbaum

Die Klassen können auch auf einem Container liegen. Das ist etwa für eine dunkle
Vorschau innerhalb einer hellen Anwendung sinnvoll:

```html
<section class="ui-dark bg-ui-background text-ui-text p-ui-padding">
  <button uiButton>Aktion im dunklen Bereich</button>
</section>
```

Auf einen Container nicht gleichzeitig `ui-light` und `ui-dark` setzen. Bei
verschachtelten Containern bestimmt der nächste Container mit Theme-Klasse die
vererbten Tokens.

## Mit Größenprofilen kombinieren

Theme und Größe sind unabhängig:

```html
<body class="ui-dark ui-small"></body>
<body class="ui-light ui-large"></body>
```

Die beiden Zeilen sind alternative Einstellungen, keine zwei Body-Elemente auf
einer Seite. Ohne Größenklasse bleibt die automatische Größenwahl erhalten.

## In Storybook ausprobieren

1. **Foundations → Overview** oder eine einzelne Komponenten-Story öffnen.
2. In der Toolbar **Farbschema** öffnen.
3. `light` oder `dark` auswählen.
4. Hover, gedrückten Zustand, Tastaturfokus und deaktivierte Varianten prüfen.

Die Toolbar verändert die Komponenten-Vorschau. Storybooks eigene Sidebar und
Dokumentationsoberfläche haben ihre eigene Darstellung.

# Tree und Tree Table

Beide Komponenten stellen hierarchische Daten dar. **Tree** zeigt die Baumstruktur,
**Tree Table** ergänzt Datenspalten. Zum Start verwenden beide Einfachauswahl und
einen gemeinsamen Zustand für offene Knoten. Die API bleibt bewusst klein.

## Datenmodell

```ts
import type { UiTreeNode, UiTreeColumn } from '@creaera/ui';

const nodes: UiTreeNode[] = [
  {
    id: 'project',
    label: 'Projekt',
    data: { owner: 'Team UI' },
    children: [
      { id: 'buttons', label: 'Buttons', data: { owner: 'Lea', status: 'Fertig' } },
      { id: 'archive', label: 'Archiv', disabled: true },
    ],
  },
];

const columns: UiTreeColumn[] = [
  { key: 'owner', label: 'Verantwortlich' },
  { key: 'status', label: 'Status' },
];
```

| Knotenfeld  | Bedeutung                                                      |
| ----------- | -------------------------------------------------------------- |
| `id`        | Stabile, im gesamten Baum eindeutige String-ID                 |
| `label`     | Sichtbarer Name                                                |
| `children?` | Kindknoten; ohne Kinder ist der Knoten ein Blatt               |
| `disabled?` | Sperrt den Knoten und seine Nachfahren                         |
| `data?`     | Zusätzliche Tabellenwerte: String, Zahl oder null je Schlüssel |

Daten als unveränderliche Arrays behandeln und bei Änderungen ein neues Array
übergeben. Es werden die übergebenen Kinder angezeigt; Nachladen ist Aufgabe
der konsumierenden Anwendung. IDs bleiben bei Datenaktualisierungen stabil.
Die Anwendung hält die Zustands-IDs passend zu ihrer aktuellen Datenquelle.

## Tree einbinden

```ts
import { Component } from '@angular/core';
import { Tree, type UiTreeNode } from '@creaera/ui';

@Component({
  selector: 'app-project-tree',
  imports: [Tree],
  template: `
    <ui-tree
      label="Projektstruktur"
      [nodes]="nodes"
      [(expanded)]="openIds"
      [(selected)]="selectedId"
    />
    <p>Auswahl: {{ selectedId || 'Keine' }}</p>
  `,
})
export class ProjectTree {
  nodes: UiTreeNode[] = [
    { id: 'project', label: 'Projekt', children: [{ id: 'buttons', label: 'Buttons' }] },
  ];
  openIds: readonly string[] = ['project'];
  selectedId: string | null = null;
}
```

`label` ist für die zugängliche Beschriftung erforderlich. Ohne initiale
`expanded`-Werte sind alle Knoten geschlossen. `selected` startet mit null.
Ein Klick auf einen Namen wählt genau diesen Knoten aus. Ein Klick auf den
Pfeil öffnet oder schließt ihn, ohne die Auswahl zu verändern.

## Tree Table einbinden

`TreeTable` in die `imports` der eigenen Angular-Komponente aufnehmen:

```html
<ui-tree-table
  label="Projekte und Zuständigkeiten"
  [nodes]="nodes"
  [columns]="columns"
  [(expanded)]="openIds"
  [(selected)]="selectedId"
/>
```

Die erste Spalte **Name** zeigt immer `node.label` mit Einrückung und Pfeil.
`columns` beschreibt die zusätzlichen Spalten in ihrer Darstellungsreihenfolge.
Jede Spalte hat einen eindeutigen `key` und eine sichtbare `label`. Werte werden
aus `node.data[key]` gelesen. Fehlende Werte oder null erscheinen als „—“;
die Zahl 0 bleibt 0. Texte werden als Text dargestellt, nicht als HTML ausgeführt.

Die Tabelle verwendet Zeilenfokus: Pfeiltasten steuern die Hierarchie und die
Zeilen. Einzelne Datenzellen sind rein lesend. Bei wenig Platz kann der
Tabellencontainer horizontal scrollen. Es gibt keinen lokalen Größenparameter;
das globale Größenprofil steuert Schrift und Zeilenabstände.

## Gemeinsame API

| Input / Binding | Bedeutung                                                 |
| --------------- | --------------------------------------------------------- |
| `nodes`         | Erforderliches Array von `UiTreeNode`                     |
| `label`         | Erforderlicher zugänglicher Name des Controls             |
| `[(expanded)]`  | Array offener Knoten-IDs; Standard `[]`                   |
| `[(selected)]`  | Einzelne ausgewählte Knoten-ID oder null; Standard null   |
| `disabled`      | Gesamtes Control sperren; Standard false                  |
| `columns`       | Nur Tree Table: erforderliches Array zusätzlicher Spalten |

Angulars Model-Bindings stellen auch die Events `(expandedChange)` und
`(selectedChange)` bereit, wenn einseitige Bindung mit eigenem Eventhandler
gewünscht ist. Tree und Tree Table können sich dieselben Zustandsfelder teilen
oder unabhängig voneinander betrieben werden. Kein `ngModel` oder `formControl`
erforderlich.

## Tastaturbedienung

| Taste                    | Verhalten                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Tab                      | Betritt das Control an genau einem verfügbaren Knoten; weiterer Tab verlässt es      |
| Pfeil abwärts / aufwärts | Nächsten / vorherigen sichtbaren, verfügbaren Knoten fokussieren                     |
| Pfeil rechts             | Geschlossenen Knoten öffnen; bei offenem Knoten zum ersten verfügbaren Kind wechseln |
| Pfeil links              | Offenen Knoten schließen; sonst zum verfügbaren Elternknoten wechseln                |
| Home / End               | Ersten / letzten sichtbaren, verfügbaren Knoten fokussieren                          |
| Enter / Leertaste        | Fokussierten Knoten auswählen                                                        |
| Einzelner Buchstabe      | Nächsten sichtbaren Knoten mit diesem Anfangsbuchstaben fokussieren, mit Umlauf      |

Fokus und Auswahl sind getrennt. Navigation wählt nicht automatisch aus.
Gesperrte Knoten und ihre Nachfahren werden bei der Navigation übersprungen.
Nur Knoten mit Kindern erhalten einen Pfeil und `aria-expanded`.

Tree verwendet `role="tree"` mit `treeitem`, Tree Table `role="treegrid"` mit
Zeilen und Spaltenüberschriften. Ebene, Position innerhalb der Geschwister,
Auswahl und Sperrstatus sind für assistive Technologien ausgezeichnet.

## Leere, gesperrte und geschlossene Zustände

Ein leeres Array zeigt „Keine Einträge vorhanden.“ an. Bei einer leeren Tree
Table bleiben die Spaltenüberschriften sichtbar. `[disabled]="true"` sperrt
Auswahl und Auf-/Zuklappen. Ein individuell gesperrter Elternknoten sperrt auch
seine Kinder, selbst wenn diese durch externen Zustand sichtbar sind.

Beim Zuklappen bleiben Daten, Auswahl und Aufklappzustände tieferer Knoten
bestehen. Erneutes Öffnen stellt diesen Zustand wieder dar. Die ausgewählte ID
kann dadurch vorübergehend zu einem nicht sichtbaren Knoten gehören.

## In Storybook ausprobieren

Unter **Components → Tree** und **Components → Tree Table** stehen die Varianten
Default, Collapsed, Selected, Disabled und Empty bereit. Die Beispiele zeigen
mehrere Ebenen und einen gesperrten Zweig. In der Toolbar Light/Dark Mode und
die Größenprofile wechseln; für die Tree Table auch einen schmalen Viewport testen.

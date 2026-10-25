# Komponenten anlegen und wichtige CLI-Befehle

Diese Seite zeigt den Weg vom Generator bis zur verwendbaren und dokumentierten
Komponente. Die Beispiele beziehen sich auf **Angular 22.2.3 und Nx 24.0.1**.

## Welches Werkzeug verwenden?

In diesem Repository werden Projekte durch **Nx** konfiguriert. Deshalb aus dem
Repository-Root `npx nx ...` verwenden. Eine klassische Angular-CLI-Anwendung
mit `angular.json` verwendet dagegen `ng ...`, bei lokal installierter CLI auch
`npx ng ...`.

`g` ist die Kurzform von `generate`. Generatoren erstellen oder ändern Dateien;
Targets wie `build` und `test` führen konfigurierte Aufgaben aus. `--dry-run`
zeigt die geplanten Änderungen, ohne sie zu schreiben. `--help` erklärt die
Optionen der tatsächlich installierten Version.

## Schritt 1: Ziel und kleine API festlegen

Eine generische UI-Komponente gehört hier unter `libs/shared/ui/src/lib`.
Fachliche Komponenten gehören in den jeweiligen Bereich, beispielsweise in
eine später angelegte `projects/ui`-Library. Vor dem Generieren klären:

- Welcher sichtbare Zweck und welche Interaktion gehören zur Komponente?
- Welche Inputs braucht ein konkreter Consumer tatsächlich?
- Gibt es eine Benutzerabsicht, die als typisierter Output gemeldet werden muss?
- Welche Darstellung ergibt sich bereits aus den zentralen Design-Tokens?

Das Beispiel ist eine reine Statusanzeige mit `label` und einem semantischen
`tone`. Sie braucht kein Klick-Event, keinen Store und keinen HTTP-Client.

## Schritt 2: Komponente mit Nx erzeugen

Zuerst den Dry-Run ansehen:

```sh
npx nx g @nx/angular:component libs/shared/ui/src/lib/status-badge/status-badge \
  --selector=ui-status-badge \
  --standalone \
  --changeDetection=OnPush \
  --style=none \
  --inlineTemplate \
  --export \
  --dry-run
```

Für die echte Anlage denselben Befehl ohne `--dry-run` ausführen. Er erzeugt
hier `status-badge.ts` und `status-badge.spec.ts` im angegebenen Ordner und
aktualisiert den Library-Einstiegspunkt. Er kann zusätzlich Generator-Defaults
in `nx.json` anpassen; deshalb die gesamte Änderung ansehen.

Nx 24 erwartet bei diesem Generator einen **Dateipfad**, nicht das früher oft
gezeigte `--project`-/`--directory`-Schema. Der Pfad bestimmt das Projekt.
Andere Generatoren können weiterhin `--project` und `--path` benötigen.

| Option                       | Warum sie im Beispiel vorkommt                                   |
| ---------------------------- | ---------------------------------------------------------------- |
| `--selector=ui-status-badge` | HTML-Name mit dem UI-Präfix                                      |
| `--standalone`               | Nutzung über `imports`, ohne eigenes NgModule                    |
| `--changeDetection=OnPush`   | Explizite Darstellungsstrategie                                  |
| `--style=none`               | Keine zusätzliche Stylesheet-Datei für diese kleine Anzeige      |
| `--inlineTemplate`           | Kurzes Template direkt in der TypeScript-Datei                   |
| `--export`                   | Standalone-Komponente aus dem Library-Einstiegspunkt exportieren |

Standalone und OnPush sind bei den hier installierten Generatoren bereits
Standard. Die Flags machen die Absicht sichtbar. Aktuelle Dateinamen müssen
nicht auf `.component.ts` enden; das Beispiel folgt der kurzen Benennung dieses
Repositories. Falls ein Team einen Suffix vereinbart, dessen Generatoroptionen
explizit wählen und die Ausgabe im Dry-Run prüfen.

## Schritt 3: Das Gerüst mit Verhalten füllen

Ein mögliches fertiges Beispiel:

<!-- example: status-badge.ts -->

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<span>{{ label() }}</span>',
  host: { '[style.color]': "'var(--ui-status-' + tone() + ')'" },
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<'normal' | 'caution' | 'dangerous'>('normal');
}
```

<!-- /example -->

Die Statusfarben stammen aus `theme.css`. Der Text erklärt den Zustand
zusätzlich zur Farbe. `label` ist erforderlich, `tone` hat einen sinnvollen
Standard. Die Komponente verändert keine fachlichen Daten.

Die Datei oben liegt hier als kompilierte **Referenz** unter
`libs/storybook/examples/architecture`. Es wurde für diese Anleitung keine neue
öffentliche Badge-Komponente in `libs/shared/ui` angelegt. Beim Nachbauen ersetzt
man damit den Inhalt der wirklich generierten Komponentendatei.

## Schritt 4: Exportieren und verwenden

Der `--export`-Schritt ergänzt den Einstiegspunkt `libs/shared/ui/src/index.ts`.
Falls der Export manuell nötig ist, lautet er für diesen Beispielpfad:

```ts
export { StatusBadge } from './lib/status-badge/status-badge';
```

In der konsumierenden Standalone-Komponente `StatusBadge` aus `@creaera/ui`
importieren und in deren `imports` aufnehmen. Danach im Template verwenden:

```html
<ui-status-badge label="Bereit" />
<ui-status-badge label="Bitte prüfen" tone="caution" />
<ui-status-badge label="Fehler" tone="dangerous" />
```

Ein TypeScript-Import allein reicht für Angular-Templates nicht; die Komponente
muss auch in `imports` verfügbar sein. Ein öffentliches Library-API wird über den
Einstiegspunkt genutzt, nicht über den internen Dateipfad einer anderen Library.

## Schritt 5: Eine Story ergänzen

Im tatsächlichen Storybook eine Datei
`libs/storybook/status-badge.stories.ts` anlegen. Ein Gerüst:

<!-- example: status-badge.stories.ts -->

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadge } from './status-badge';

const meta: Meta<StatusBadge> = {
  title: 'Components/Status Badge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: { label: 'Bereit', tone: 'normal' },
};
export default meta;
type Story = StoryObj<StatusBadge>;
export const Normal: Story = {};
export const Caution: Story = { args: { label: 'Bitte prüfen', tone: 'caution' } };
export const Dangerous: Story = { args: { label: 'Fehler', tone: 'dangerous' } };
```

<!-- /example -->

Die kompilierte Referenz importiert ihr Badge aus der benachbarten Beispieldatei.
In der echten Story nach dem Library-Export stattdessen
`import { StatusBadge } from '@creaera/ui'` verwenden. Dieses Storybook findet
`*.stories.ts` direkt unter `libs/storybook`; eine Story an einem anderen Ort
braucht ein passendes Glob in `.storybook/main.ts`.

Die Referenz-Story ist kein zusätzlicher Eintrag im produktiven Komponentenkatalog.
Beim Umsetzen echte Varianten, relevante Zustände und Interaktionen zeigen.

## Schritt 6: Tests und Build prüfen

```sh
npx nx test ui
npx nx build ui
npm run storybook
npm run build-storybook
```

Der Generator legt eine Spec-Datei an. Diese mit Tests für das tatsächliche
Verhalten füllen, etwa erforderliche Beschriftung, Interaktion, Disabled und
Formularbindung. Ein bloßes `should create` ist bei komplexeren Komponenten kein
ausreichender Funktionstest. Für eine reine Anzeige reichen passende, kleine
Prüfungen; keine Infrastruktur nur für einen trivialen Wert aufbauen.

## Häufige Generatoren in diesem Nx-Workspace

Diese Befehle sind bewusst **Dry-Runs**. Die Namen sind Beispiele für neue
Dateien; sie sind noch keine zusätzlichen Library-Exporte.

```sh
# Fachneutrales Service-Gerüst; --injectable passt zu den @Injectable-Beispielen
npx nx g @nx/angular:service format-label --project=ui --path=libs/shared/ui/src/lib --injectable --dry-run

# Attributdirektive: der Nx-Parameter bekommt den Namen ohne eckige Klammern
npx nx g @nx/angular:directive libs/shared/ui/src/lib/auto-focus --selector=uiAutoFocus --standalone --dry-run

# Pipe
npx nx g @nx/angular:pipe libs/shared/ui/src/lib/display-label --standalone --dry-run
```

Der Direktiven-Generator erzeugt aus `--selector=uiAutoFocus` den Selektor
`[uiAutoFocus]`. Die Beispiel-Pipe heißt bei dieser Generatorversion in der
Dateiausgabe `display-label-pipe.ts`. Die tatsächlich erzeugten Namen prüfen,
bevor Imports oder Exporte ergänzt werden.

API-Clients gehören in Data Access, Auth-Guards und Interceptors in die
entsprechende App-/Feature-Infrastruktur. Die UI-Library ist dafür kein
fachlicher Ablageort. Bei solchen Generatoren erst das richtige vorhandene
Projekt bestimmen.

## Neue Nx-Library oder App anlegen

Nur wenn ein neues Projekt gebraucht wird; für eine einzelne neue Komponente
ist keine zusätzliche Library nötig. Die folgenden Pfade sind vorgeschlagene
neue Projekte aus dem Architekturleitfaden:

```sh
npx nx g @nx/angular:library libs/projects/ui --name=projects-ui \
  --buildable --standalone --unitTestRunner=vitest-angular --linter=none --dry-run

npx nx g @nx/angular:application apps/admin --name=admin \
  --standalone --routing --bundler=esbuild --unitTestRunner=vitest-angular \
  --e2eTestRunner=none --linter=none --dry-run
```

Die Beispiele wählen explizit den nativen Angular-Vitest-Runner. Eine Library
braucht dafür in dieser Nx-Version `--buildable` oder `--publishable`.
`--linter=none` und `--e2eTestRunner=none` vermeiden für diese Vorschau zusätzliche
Tool-Einrichtungen. Für eine echte Anwendung passende Lint- und E2E-Targets
nach dem Teamstandard einrichten.

## Die wichtigsten ng-Befehle im klassischen Angular-CLI-Projekt

Die folgenden Generatoren wurden in einem separaten kleinen CLI-Prüfworkspace
mit dem Projektnamen **demo** als Dry-Run geprüft. Sie sind für einen klassischen
Angular-Workspace gedacht, nicht zum direkten Generieren in diesem Nx-Repository.
Bei einem eigenen Projekt `demo` durch dessen tatsächlichen Projektnamen ersetzen.

| Zweck                         | Befehl                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Komponente (`g c`)            | `npx ng g c features/projects/project-list --project=demo --standalone --change-detection=OnPush --style=css --dry-run` |
| Service (`g s`)               | `npx ng g s data-access/projects-api --project=demo --injectable --dry-run`                                             |
| Direktive (`g d`)             | `npx ng g d shared/highlight --project=demo --standalone --dry-run`                                                     |
| Pipe (`g p`)                  | `npx ng g p shared/display-label --project=demo --standalone --dry-run`                                                 |
| Interface (`g i`)             | `npx ng g i domain/project --project=demo --dry-run`                                                                    |
| Funktionaler Guard (`g g`)    | `npx ng g g guards/auth --project=demo --functional --implements=CanActivate --dry-run`                                 |
| Funktionaler Interceptor      | `npx ng g interceptor http/correlation --project=demo --functional --dry-run`                                           |
| Funktionaler Resolver (`g r`) | `npx ng g r data/project --project=demo --functional --dry-run`                                                         |

Ein generierter Service ist noch kein API-Client mit Endpunkten. Ein generierter
Guard enthält noch keine fachliche Berechtigungslogik. Ein Interceptor muss
bewusst registriert und ein Resolver beziehungsweise Guard in den Routes
verwendet werden. Generatoren liefern das Gerüst, nicht die Fachfunktion.

Für ein **neues, separates CLI-Projekt**, außerhalb eines vorhandenen Workspaces:

```sh
npx @angular/cli@22.2.3 new demo --standalone --routing --style=css
```

Das erstellt einen neuen Workspace und kann Abhängigkeiten installieren. Es
wandelt dieses bestehende Nx-Repository nicht um.

## Häufige Befehle gegenübergestellt

| Aufgabe                 | In diesem Repository                                         | Klassischer Angular-Workspace               |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Versionen               | `npx nx report`                                              | `npx ng version`                            |
| Projekte sehen          | `npx nx show projects`                                       | Projekte in `angular.json` ansehen          |
| Projekt / Targets sehen | `npx nx show project ui`                                     | `npx ng config projects`                    |
| Entwicklungsserver      | `npm run storybook`; für eine echte App deren `serve`-Target | `npx ng serve demo`                         |
| Build                   | `npx nx build ui`                                            | `npx ng build demo`                         |
| Unit-Tests              | `npx nx test ui`                                             | `npx ng test demo`                          |
| Storybook statisch      | `npm run build-storybook`                                    | Nur nach eigener Storybook-Einrichtung      |
| Architekturbeispiele    | `npm run test:architecture`                                  | Kein allgemeiner Angular-CLI-Standardbefehl |
| Generatorhilfe          | `npx nx g @nx/angular:component --help`                      | `npx ng g component --help`                 |

`ui` ist hier eine Library und hat kein eigenes `serve`-Target. `storybook`
ist der vorhandene interaktive Host. Für eine später generierte App zeigt
`nx show project <name>`, welche Targets tatsächlich konfiguriert sind.

`ng add` installiert und konfiguriert ein Add-on; `ng update` plant bzw. führt
Angular-Updates aus. In einem Nx-Workspace die passende Nx-Migration verwenden
und alle betroffenen Pakete gemeinsam betrachten. Solche Befehle können
Abhängigkeiten und Quellcode ändern und sind keine Diagnose- oder reinen
Generatorvorschauen.

## Und einen NgRx Signal Store anlegen?

`ng generate store` ist kein eingebauter Angular-CLI-Befehl. Auch das hier
installierte `@ngrx/signals` 22.0.1 bringt in seiner Schematic-Collection nur die
Initialisierung mit, keinen Signal-Store-Generator. Die Store-Datei im passenden
Data-Access-Bereich wie im Kapitel **State und Signal Store** anlegen. Ein
Service-Generator erzeugt nicht automatisch den dort beschriebenen Signal Store.

## Ein kurzer Arbeitsablauf

Passenden Bereich wählen → kleine API festlegen → Generator mit `--dry-run`
prüfen → wirklich generieren → Verhalten und Tokens ergänzen → öffentliches
API prüfen → Story und sinnvolle Tests ergänzen → Build und Tests ausführen →
Änderung auf einem Branch als Pull Request öffnen.

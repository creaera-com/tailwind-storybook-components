# Komponenten und ihre APIs

Eine gute Aufteilung folgt der Verantwortung: Die Seite kennt den Ablauf,
fachliche UI kennt ihre Darstellung, generische Controls kennen Interaktion
und Gestaltung. Die Zahl der Komponenten allein ist kein Qualitätsmaß.

## Die drei Ebenen

| Ebene               | Kennt                                                        | Meldet / tut                                 |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Generisches Control | Label, Wert, Disabled, Gestaltung                            | Kleine UI-Ereignisse und Formularbindung     |
| Fachliche UI        | Beispielsweise `Project` und verfügbare Darstellungsaktionen | Typisierte Ereignisse wie `publishRequested` |
| Feature-Page        | Store, Routing, Formulardraft und Ablauf                     | Übersetzt Ereignisse in fachliche Methoden   |

Eine ProjectList braucht weder HttpClient noch einen eigenen Signal Store.
Eine Feature-Page darf dagegen den passenden Store injizieren. Dependency
Injection an der richtigen Grenze ist normal; fachliche UI muss nicht durch
beliebig viele Ebenen mit Infrastruktur versorgt werden.

## Eine kleine fachliche UI

<!-- example: project-list.ts -->

```ts
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '@creaera/ui';
import { type Project } from './project.model';

@Component({
  selector: 'app-project-list',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ul>
    @for (project of projects(); track project.id) {
      <li>
        <button
          uiButton
          [variant]="selectedId() === project.id ? 'primary' : 'secondary'"
          [attr.aria-pressed]="selectedId() === project.id"
          (click)="selected.emit(project.id)"
        >
          {{ project.name }}
        </button>
        <span>{{ project.status }}</span>
        @if (project.status === 'draft') {
          <button uiButton [disabled]="busy()" (click)="publishRequested.emit(project)">
            Veröffentlichen
          </button>
        }
      </li>
    } @empty {
      <li>Keine Projekte gefunden.</li>
    }
  </ul>`,
})
export class ProjectList {
  readonly projects = input.required<readonly Project[]>();
  readonly selectedId = input<string | null>(null);
  readonly busy = input(false);
  readonly selected = output<string>();
  readonly publishRequested = output<Project>();
}
```

<!-- /example -->

Die API beschreibt Absichten. `publishRequested` sagt mehr als `buttonClicked`.
Die UI verändert die übergebenen Projekte nicht. Readonly-Daten und stabile IDs
unterstützen einen klaren Datenfluss; `@for (...; track project.id)` bewahrt
Elementidentitäten beim Aktualisieren der Liste.

Inputs nur für tatsächlich unterschiedliche Verwendungsszenarien ergänzen.
Farben und Größen weiterhin über die zentralen Design-Tokens steuern. Ein
Config-Objekt mit dutzenden optionalen Eigenschaften macht eine kleine
Komponente nicht automatisch wiederverwendbar.

## Die Feature-Page setzt den Ablauf zusammen

<!-- example: project-page.ts -->

```ts
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@creaera/ui';
import { ProjectList } from './project-list';
import { type CreateProject, type Project } from './project.model';
import { ProjectsStore } from './projects-store';

@Component({
  selector: 'app-project-page',
  imports: [ProjectList, Button, ReactiveFormsModule],
  providers: [ProjectsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Projekte</h1>
    <label for="project-search">Suchen</label>
    <input id="project-search" type="search" [value]="store.query()" (input)="search($event)" />
    @if (store.loading()) {
      <p role="status">Projekte werden geladen.</p>
    } @else if (store.loadError(); as error) {
      <p role="alert">{{ error.message }}</p>
      <button uiButton (click)="store.reload()">Erneut laden</button>
    } @else {
      <app-project-list
        [projects]="store.entities()"
        [selectedId]="store.selectedId()"
        [busy]="store.writing()"
        (selected)="store.select($event)"
        (publishRequested)="publish($event)"
      />
    }
    <form [formGroup]="form" (ngSubmit)="create()">
      <label for="project-name">Projektname</label>
      <input id="project-name" formControlName="name" />
      @if (form.controls.name.invalid && form.controls.name.touched) {
        <p>Bitte einen Namen eingeben.</p>
      }
      <button uiButton type="submit" [disabled]="store.writing()">Anlegen</button>
    </form>
    @if (store.writeError(); as error) {
      <p role="alert">{{ error.message }}</p>
    }`,
})
export class ProjectPage {
  readonly store = inject(ProjectsStore);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  private createAttempt: { input: CreateProject; requestId: string } | null = null;
  private readonly publishAttempts = new Map<string, { version: number; requestId: string }>();

  constructor() {
    this.store.reload();
    let completed = 0;
    // A UI side effect: clear the draft only after a confirmed server creation.
    effect(() => {
      const current = this.store.completedCreates();
      if (current > completed) {
        if (this.createAttempt?.input.name === this.form.controls.name.value) this.form.reset();
        this.createAttempt = null;
        completed = current;
      }
    });
  }
  search(event: Event): void {
    this.store.search((event.target as HTMLInputElement).value);
  }
  create(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid || this.store.writing()) return;
    const input = this.form.getRawValue();
    if (!this.createAttempt || this.createAttempt.input.name !== input.name) {
      this.createAttempt = { input, requestId: crypto.randomUUID() };
    }
    this.store.create(this.createAttempt.input, this.createAttempt.requestId);
  }
  publish(project: Project): void {
    let attempt = this.publishAttempts.get(project.id);
    if (!attempt || attempt.version !== project.version) {
      attempt = { version: project.version, requestId: crypto.randomUUID() };
      this.publishAttempts.set(project.id, attempt);
    }
    this.store.publish(project, attempt.requestId);
  }
}
```

<!-- /example -->

Der Store ist über `providers` an diese Seiteninstanz gebunden. Die Page
koordiniert Suche, Auswahl, Formular und Veröffentlichung. Das Beispiel
verwendet native Formularelemente, damit die Architektur unabhängig von den
noch separat entwickelten Formularfeld-Komponenten verständlich bleibt.
Diese können in einer konsumierenden Anwendung die nativen Wrapper ersetzen.

Das Formular wird erst nach einer bestätigten **Erstellung** zurückgesetzt.
Ein fehlgeschlagener Request oder eine andere Aktion wie Veröffentlichen soll
einen begonnenen Formulardraft erhalten. Auch ein während der Anfrage bereits
geänderter Entwurf bleibt erhalten; zurückgesetzt wird nur die unveränderte
abgesendete Eingabe. Bei größeren Formularen gehört dazu ein passender
DTO- oder Draft-Versionsvergleich. Der Zähler im Beispiel ist eine kleine
Erfolgsbestätigung für ein einzelnes Formular; bei mehreren Formularen pro
Feature sind korrelierte Operationsergebnisse mit einer Request-ID geeigneter.

## Lokales Formular oder Store-State?

Der noch nicht gespeicherte Entwurf gehört normalerweise in das Formular oder
in lokalen Komponenten-State. Persistierte Serverdaten liegen im Feature-Store.
Nicht jeden Tastendruck in eine globale Kopie des gesamten Datensatzes spiegeln.

Bei mehrstufigen Formularen, Draft-Wiederherstellung oder mehreren beteiligten
Seiten kann ein eigener, bewusst begrenzter Draft-Store sinnvoll sein. Die
fachliche Anforderung bestimmt die Lebensdauer.

## Wann eine Komponente teilen?

Eine Aufteilung hilft, wenn ein Teil eine eigene Aufgabe, eine verständliche
API, eigenständige Interaktion oder echte Wiederverwendung hat. Beispiele:
Suchleiste, Ergebnisliste, Editor und Bestätigungsdialog.

Wenn das Template nur durch viele Weiterleitungen von Inputs/Outputs länger
wird, ist eine weitere Ebene möglicherweise nicht hilfreich. Fachliche
Container dürfen überschaubare Ablauflogik enthalten. Reine Berechnungen können
in `computed` oder in kleine, getestete Domain-Funktionen wandern.

## Signals passend einsetzen

- `input()` für Daten von außen, `output()` für typisierte Absichten.
- `model()` für ein tatsächlich gewolltes Two-Way-Value-API eines Controls.
- `signal()` für lokalen veränderbaren Zustand.
- `computed()` für abgeleitete Werte.
- `effect()` für echte Seiteneffekte, etwa das Zurücksetzen eines Formulars
  nach bestätigtem Erfolg.

Abgeleitete Zustände brauchen keine zweite manuell synchronisierte Kopie.
Angulars Signal-Tracking und eine klare OnPush-Grenze passen zu diesem Ansatz.
Reactive Forms bleiben im Beispiel die explizit getestete Formularlösung.

# State und NgRx Signal Store

Signal Store ist eine Möglichkeit, Feature-Zustand, abgeleitete Werte und
fachliche Methoden zusammenzufassen. Lokale Signals, die URL und der Server
behalten dabei ihre eigenen Aufgaben.

## Wer besitzt welchen Zustand?

| Zustand                                                        | Typischer Besitzer                                      |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| Offenes Menü, Hover, temporäre Ansicht                         | Lokale UI-Komponente                                    |
| Noch nicht gespeicherter Formulardraft                         | Formular / lokaler Draft-State                          |
| Teilbare Suche, Filter, Sortierung, Seitenposition             | URL, wenn Deep Links / Zurück-Navigation gewünscht sind |
| Geladene Projektdaten, Lade-/Fehlerzustände, laufende Aktionen | Feature-Store                                           |
| Persistierte Wahrheit und erlaubte Zustandswechsel             | Server                                                  |
| Tatsächlich app-weite Sitzung oder Präferenzen                 | Bewusst app-weiter Store                                |

Im Referenzbeispiel ist die Suche bewusst lokal im Feature-Store. Für eine
teilbare Suchseite wird sie stattdessen aus Query-Parametern angestoßen. Dann
darf nicht zusätzlich eine unkoordinierte zweite Suchwert-Kopie entstehen.

## Store-Lebensdauer

`ProjectsStore` hat kein `providedIn: 'root'`. Die Page stellt ihn bereit, sodass
zwei Seiteninstanzen getrennten Zustand besitzen. Der getestete Lifecycle
beendet auch die aktiven RxJS-Reads beim Zerstören des Injectors.

Für zusammengehörige Kindseiten kann eine Feature-Shell die Instanz teilen.
Root-State nur dann verwenden, wenn die gewünschte Lebensdauer wirklich die
App ist; bei einem Benutzerwechsel müssen benutzerabhängige Caches bewusst
zurückgesetzt werden. Auf dem Server keine benutzerbezogenen Daten in
prozessweiten, veränderbaren Modulvariablen halten.

## Modell und DTO auseinanderhalten

<!-- example: project.model.ts -->

```ts
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly status: 'draft' | 'published';
  readonly version: number;
  readonly updatedAt: string;
}

export interface CreateProject {
  readonly name: string;
}
export interface UpdateProject {
  readonly name: string;
}

export interface ProjectDto {
  readonly id: string;
  readonly title: string;
  readonly status: 'draft' | 'published';
  readonly version: number;
  readonly updated_at: string;
}

export interface ProjectPageDto {
  readonly items: readonly ProjectDto[];
  readonly nextCursor: string | null;
}
export interface ProjectPage {
  readonly items: readonly Project[];
  readonly nextCursor: string | null;
}

export function fromProjectDto(dto: ProjectDto): Project {
  return {
    id: dto.id,
    name: dto.title,
    status: dto.status,
    version: dto.version,
    updatedAt: dto.updated_at,
  };
}
```

<!-- /example -->

Das Domain-Modell verwendet `name` und `updatedAt`, der Beispielserver `title`
und `updated_at`. Ein zentraler Mapper hält solche Unterschiede aus den
Komponenten heraus. Das Domain-Modell verwendet hier serialisierbare Werte;
Datumsformatierung bleibt eine Darstellungsaufgabe.

## Der vollständige Store

<!-- example: projects-store.ts -->

```ts
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { defer, exhaustMap, pipe, switchMap, timer, type Observable } from 'rxjs';
import { ProjectsApi } from './projects-api';
import { type CreateProject, type Project, type UpdateProject } from './project.model';
import { toUserError, type UserError } from './user-error';

type ProjectCommand =
  | { kind: 'create'; input: CreateProject; requestId: string }
  | { kind: 'update'; project: Project; input: UpdateProject }
  | { kind: 'remove'; project: Project }
  | { kind: 'publish'; project: Project; requestId: string };

function execute(api: ProjectsApi, command: ProjectCommand): Observable<unknown> {
  switch (command.kind) {
    case 'create':
      return api.create(command.input, command.requestId);
    case 'update':
      return api.update(command.project, command.input);
    case 'remove':
      return api.remove(command.project);
    case 'publish':
      return api.publish(command.project, command.requestId);
  }
}

export const ProjectsStore = signalStore(
  withState(() => ({
    query: '',
    selectedId: null as string | null,
    loading: false,
    writing: false,
    loadError: null as UserError | null,
    writeError: null as UserError | null,
    completedCreates: 0,
  })),
  withEntities<Project>(),
  withComputed(({ entityMap, selectedId }) => ({
    selectedProject: computed(() => entityMap()[selectedId() ?? ''] ?? null),
  })),
  withMethods((store, api = inject(ProjectsApi)) => {
    const load = rxMethod<{ query: string; delay: number }>(
      pipe(
        // Cancel both the old debounce timer and any old HTTP read immediately.
        switchMap(({ query, delay }) =>
          defer(() => {
            patchState(store, { loading: true, loadError: null });
            return timer(delay).pipe(
              switchMap(() => api.list(query)),
              tapResponse({
                next: (page) => patchState(store, setAllEntities([...page.items])),
                error: (error) => patchState(store, { loadError: toUserError(error) }),
                finalize: () => patchState(store, { loading: false }),
              }),
            );
          }),
        ),
      ),
    );
    const write = rxMethod<ProjectCommand>(
      pipe(
        // This feature accepts one write at a time; repeated clicks are ignored.
        exhaustMap((command) =>
          defer(() => {
            patchState(store, { writing: true, writeError: null });
            return execute(api, command).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    completedCreates:
                      store.completedCreates() + (command.kind === 'create' ? 1 : 0),
                  });
                  // Re-query the current server filter instead of guessing list membership.
                  load({ query: store.query(), delay: 0 });
                },
                error: (error) => patchState(store, { writeError: toUserError(error) }),
                finalize: () => patchState(store, { writing: false }),
              }),
            );
          }),
        ),
      ),
    );
    return {
      reload(): void {
        load({ query: store.query(), delay: 0 });
      },
      search(query: string): void {
        if (query === store.query()) return;
        patchState(store, { query });
        load({ query, delay: 250 });
      },
      select(id: string | null): void {
        patchState(store, { selectedId: id });
      },
      create(input: CreateProject, requestId: string): void {
        write({ kind: 'create', input, requestId });
      },
      update(project: Project, input: UpdateProject): void {
        write({ kind: 'update', project, input });
      },
      remove(project: Project): void {
        write({ kind: 'remove', project });
      },
      publish(project: Project, requestId: string): void {
        write({ kind: 'publish', project, requestId });
      },
    };
  }),
);
```

<!-- /example -->

## Die Bausteine verstehen

| API                       | Aufgabe im Beispiel                                            |
| ------------------------- | -------------------------------------------------------------- |
| `signalStore`             | Erzeugt den injizierbaren Store aus Features                   |
| `withState`               | Query, Auswahl-ID, getrennte Read-/Write-Zustände              |
| `withEntities<Project>()` | Normalisierte `entityMap`, `ids` und abgeleitete `entities`    |
| `withComputed`            | `selectedProject` aus ID und Entities ableiten                 |
| `withMethods`             | Kleine fachliche Methoden veröffentlichen                      |
| `patchState`              | Zustandsänderungen kontrolliert und unveränderlich anwenden    |
| `rxMethod`                | RxJS-Nebenläufigkeit und Lifecycle an den Store binden         |
| `tapResponse`             | Erfolg, Fehler und Abschluss innerhalb einer Anfrage behandeln |

State-Features stehen vor Features, die darauf zugreifen. Die State-Factory
liefert frische Startwerte je Instanz. Die intern erzeugten Read-/Write-Streams
werden nicht als öffentliche generische Execute-API veröffentlicht.

`withProps` ist sinnvoll, wenn mehrere Store-Features dieselbe Abhängigkeit oder
abgeleitete Eigenschaft brauchen. Hier reicht die Injection im Methoden-Feature.
`withHooks` kann einen immer benötigten Initial-Load starten; das Beispiel lässt
die Page ausdrücklich `reload()` aufrufen. Neue APIs wie Resource-Integration
oder Events gezielt nach Versionsstand und Anforderungen einsetzen.

## Wichtige Entscheidungen des Beispiels

Die Entities repräsentieren **die aktuelle erste Ergebnisseite**, keinen
vollständigen globalen Projektcache. Die API liefert einen Cursor, aber ein
„Weitere laden“-Ablauf ist hier noch nicht implementiert. Bei Filterwechseln
wird die Liste vom Server ersetzt. Eine getrennte Detailansicht benötigt einen
eigenen klaren Cache-/Ladevertrag.

`selectedProject` ist abgeleitet. Wird eine gewählte ID herausgefiltert, ist
dieser Wert null, obwohl die Auswahl-ID zunächst bestehen bleibt. Die Anwendung
entscheidet, ob sie die Auswahl in diesem Fall explizit zurücksetzt.

Nach Mutationen lädt der Store die aktuelle Liste neu. Das hält Serverfilter
und Sortierung konsistent. Blindes Einfügen einer neuen Entity würde bei einer
gefilterten oder paginierten Liste möglicherweise einen falschen Inhalt zeigen.

## Keine Promise-Annahme bei rxMethod

Die veröffentlichten Command-Methoden im Beispiel geben `void` zurück.
`await store.create(...)` würde hier nicht auf HTTP-Erfolg warten. Die UI liest
`writing`, Fehler und die bestätigten Ergebnisse. Eine alternative, bewusst als
Promise entworfene Methode ist möglich, braucht aber denselben klaren Vertrag
für Fehler, Nebenläufigkeit und Lifecycle.

Der Store hält eine parallele Leseoperation und maximal einen Schreibvorgang.
Die passenden Operatoren und die Gründe dafür stehen im Kapitel
**Aktionen und Nebenläufigkeit**.

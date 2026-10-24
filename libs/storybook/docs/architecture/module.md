# Module und Nx

„Modular“ bedeutet zunächst klare Verantwortlichkeiten und gerichtete
Abhängigkeiten. Moderne Angular-Anwendungen können dafür Standalone-Komponenten,
Lazy Routes und Dependency Injection verwenden. Für fachliche Grenzen ist kein
NgModule pro Bereich nötig.

## Nach Fachlichkeit schneiden

Ein mögliches Zielbild für eine konsumierende Anwendung:

```text
apps/
  admin/                         # Bootstrap, globale Provider, Root-Routen
libs/
  projects/
    feature/                     # Seiten, Routing, Ablaufsteuerung
    data-access/                 # ProjectsStore, ProjectsApi, DTO-Mapping
    ui/                          # ProjectList, ProjectEditor
    domain/                      # Project, Commands, reine Fachfunktionen
  shared/
    ui/                          # bestehende generische Komponentenbibliothek
    util/                        # wenige fachneutrale Hilfen
  storybook/                     # bestehende Dokumentation und Stories
```

`apps/admin` und `libs/projects/*` sind hier ein vorgeschlagener Aufbau. Die
kompilierten Beispiele liegen zur besseren Lesbarkeit gemeinsam unter
`libs/storybook/examples/architecture` und verwenden dort relative Imports.

Zuerst die Fachlichkeit verstehen: Eine Rechnungsverwaltung muss nicht denselben
Store oder dieselben Modelle wie eine Projektverwaltung besitzen. Gemeinsame
Daten über klar benannte Verträge austauschen. Ein großer Ordner `shared` sollte
nicht zur Ablage für alles werden, das zwei Dateien brauchen.

## Erlaubte Abhängigkeiten

| Typ          | Typische erlaubte Ziele                                         |
| ------------ | --------------------------------------------------------------- |
| App          | Features und explizite Bootstrap-Konfiguration, Shared UI/Util  |
| Feature      | Data Access, fachliche UI, Domain, Shared UI/Util               |
| Data Access  | Domain, fachneutrale Utilities, Angular HTTP, NgRx              |
| Fachliche UI | Domain-Typen, Shared UI/Util                                    |
| Shared UI    | Generische Darstellung und Interaktion; keine fachlichen Stores |
| Domain       | Reine Typen und Funktionen; möglichst ohne Angular/HTTP         |

Eine fachliche UI darf `Project` als Typ kennen. Ein generischer Button kennt
keinen `ProjectsStore`. Eine UI-Library importiert nicht zurück in ein Feature.
Zyklische Imports sind ein Signal, die Zuständigkeiten erneut zu prüfen.

## Öffentliche Einstiegspunkte

Jede Library veröffentlicht eine kleine API über ihren Einstiegspunkt. Consumer
importieren beispielsweise `@creaera/projects/domain` und greifen nicht direkt
auf interne Dateipfade einer anderen Library zu. Solche Aliase werden erst beim
Anlegen der entsprechenden Libraries konfiguriert; sie existieren in diesem
Repository noch nicht.

Anfangs reichen Exporte für die tatsächlich benötigten Typen, Komponenten,
Routes und Services. Interne HTTP-DTOs müssen nicht automatisch Teil jeder
öffentlichen Domain-API werden.

## Grenzen durch Nx prüfen

Libraries können etwa diese Tags bekommen:

```json
{
  "name": "projects-feature",
  "tags": ["scope:projects", "type:feature"]
}
```

Mit `@nx/enforce-module-boundaries` lassen sich die Regeln in ESLint durchsetzen.
Beispiel für den Regelteil einer Nx-Flat-Config:

```js
const boundaryRules = {
  '@nx/enforce-module-boundaries': [
    'error',
    {
      enforceBuildableLibDependency: true,
      allow: [],
      depConstraints: [
        {
          sourceTag: 'scope:projects',
          onlyDependOnLibsWithTags: ['scope:projects', 'scope:shared'],
        },
        { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
        {
          sourceTag: 'type:feature',
          onlyDependOnLibsWithTags: ['type:data-access', 'type:ui', 'type:domain', 'type:util'],
        },
        { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:domain', 'type:util'] },
        { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:domain', 'type:util'] },
        { sourceTag: 'type:domain', onlyDependOnLibsWithTags: ['type:domain', 'type:util'] },
        { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
      ],
    },
  ],
};
```

Dieses Rules-Objekt wird als `rules: boundaryRules` in die vorhandene ESLint-Konfiguration integriert,
nachdem die Nx-ESLint-Unterstützung eingerichtet ist. Er ist keine bereits
aktivierte Regel dieses Workspaces. Alle Libraries passend taggen und Lint in
CI ausführen. Ein ungetaggtes Projekt erhält durch die Beispiele nicht
versehentlich eine sinnvolle fachliche Grenze.

## Lazy Loading und Bootstrap

Die Root-App stellt Infrastruktur bereit und lädt den Bereich bei Bedarf:

<!-- example: app.config.ts -->

```ts
import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig } from '@angular/core';
import { provideRouter, type Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'projects',
    loadChildren: () => import('./project.routes').then((module) => module.PROJECT_ROUTES),
  },
];
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(APP_ROUTES)],
};
```

<!-- /example -->

Der Bereich veröffentlicht seine eigenen Routes:

<!-- example: project.routes.ts -->

```ts
import { type Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./project-page').then((module) => module.ProjectPage) },
];
```

<!-- /example -->

Die Page stellt im Beispiel ihren Store selbst bereit. Das schafft eine klare
Lebensdauer pro Seiteninstanz. Für mehrere Kindseiten kann eine gemeinsame
Feature-Shell den Store bereitstellen. Bei Route-Providern, Route-Caching und
einer eigenen RouteReuseStrategy die tatsächliche Lebensdauer bewusst prüfen.

## Wann eine neue Library sinnvoll ist

Eine neue Library hilft bei einer stabilen fachlichen Grenze, Wiederverwendung,
eigener Zuständigkeit, einem separaten Build oder einer gewünschten
Abhängigkeitsregel. Für einen kleinen Bereich dürfen Feature, Store und
API-Client zunächst in einer zusammenhängenden Library liegen und später
gezielt getrennt werden.

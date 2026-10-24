# Moderne Angular-Architektur

Dieser Leitfaden zeigt eine pragmatische modulare Architektur mit **Angular 22,
Nx 24 und NgRx Signal Store 22**. Durchgehend geht es um eine Projektverwaltung:
Projekte suchen, anlegen, ändern, löschen und veröffentlichen.

## Was hier tatsächlich vorhanden ist

Die produktive Bibliothek bleibt unter `libs/shared/ui`. Die Architektur ist eine
Anleitung für konsumierende Anwendungen, kein bereits eingerichtetes Backend
und keine neue fachliche Anwendung in diesem Repository.

Die vollständigen, kompilierten Referenzdateien liegen unter
`libs/storybook/examples/architecture`. Ihre HTTP- und Store-Tests verwenden
Angulars HTTP-Testbackend. Die Beispiele wurden mit Angular **22.2.3**, NgRx
**22.0.1** und den im Lockfile festgelegten Werkzeugen geprüft.
Stand: **24. Oktober 2026**. Architekturentscheidungen hängen zusätzlich von
Teamgröße, Datenmengen und fachlichen Grenzen ab.

## Ein durchgehender Datenfluss

```text
Benutzeraktion
  → Feature-Page / Container
  → fachliche Methode am Signal Store
  → typisierter API-Client
  → HTTP / Server mit Geschäftsregeln
  → DTO-Mapping
  → Store-Zustand
  → computed View-State
  → UI-Komponenten
```

Eine UI-Komponente meldet zum Beispiel `publishRequested(project)`. Der Container
ruft `store.publish(project, requestId)` auf. Der API-Client sendet den Befehl.
Nach bestätigtem Erfolg lädt der Store die aktuelle Liste neu. Der Server prüft,
ob das Projekt veröffentlicht werden darf.

## Die neun Kapitel

| Kapitel                      | Entscheidung, die es erklärt                                           |
| ---------------------------- | ---------------------------------------------------------------------- |
| Start                        | Gesamtbild, Umfang und Quellen                                         |
| Komponenten anlegen und CLI  | Generatoren, Library-Export, Stories und wichtige Befehle              |
| Module und Nx                | Fachliche Grenzen, Libraries, Imports und Lazy Loading                 |
| Komponenten und APIs         | Container, fachliche UI, wiederverwendbare Controls und Formulare      |
| State und Signal Store       | Zustandsbesitz, Lebensdauer, Entities, Methoden und abgeleitete Werte  |
| HTTP und CRUD                | Ressourcen, DTOs, Clients, Pagination und Konfliktbehandlung           |
| Aktionen und Nebenläufigkeit | Fachliche Commands, Idempotenz und RxJS-Operatoren                     |
| Server-Suche                 | Debounce, sofortige Stornierung alter Reads und Autocomplete-Anbindung |
| Tests und Weiterentwicklung  | Ausführbare Beispiele, sinnvolle Tests und schrittweiser Ausbau        |

## Ein sinnvoller Startumfang

Mit einer Fachfunktion, einem Feature-Store, einem API-Client und wenigen
fachlichen UI-Komponenten beginnen. Libraries erst an stabilen Grenzen
herauslösen. Ein Store pro Button oder eine Library pro kleiner Datei bringt
meist keine zusätzliche Klarheit.

Die UI-Bibliothek enthält Gestaltung und generische Interaktion. Fachliche
Regeln, Serverzugriff und konkrete Anwendungs-Stores liegen in der konsumierenden
Anwendung. NgRx ist deshalb nur eine Entwicklungsabhängigkeit für die geprüften
Dokumentationsbeispiele und keine Laufzeitabhängigkeit von `@creaera/ui`.

## Offizielle Grundlagen

Die Beispiele verwenden die aktuellen, installierten NgRx-APIs. Weiterführend:

- [Angular Style Guide](https://angular.dev/style-guide)
- [Angular Dependency Injection](https://angular.dev/guide/di/hierarchical-dependency-injection)
- [Angular HttpClient](https://angular.dev/guide/http)
- [NgRx Signal Store](https://ngrx.io/guide/signals/signal-store)
- [NgRx RxJS-Integration](https://ngrx.io/guide/signals/rxjs-integration)
- [NgRx Entity Management](https://ngrx.io/guide/signals/signal-store/entity-management)
- [Nx Module Boundaries](https://nx.dev/features/enforce-module-boundaries)
- [HTTP-Semantik, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- [Problem Details, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457)

Die NgRx-APIs wurden zusätzlich gegen die offiziellen Quellen im
[NgRx-Repository](https://github.com/ngrx/platform) und die installierte Version
22.0.1 geprüft. Neuere optionale APIs sollten passend zur konkreten Version
bewertet werden; der Leitfaden setzt sie nicht pauschal voraus.

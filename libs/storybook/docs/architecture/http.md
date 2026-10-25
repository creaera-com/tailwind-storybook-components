# HTTP und CRUD-APIs

Eine gute API beschreibt Ressourcen und fachliche Verträge. Die Oberfläche
bekommt typisierte Methoden; URL-Bau, Header und DTO-Mapping liegen am
HTTP-Rand. Der Server entscheidet über Validierung, Berechtigungen und
zulässige Zustandsänderungen.

## Ein konkreter Ressourcenvertrag

| Anfrage                                      | Erfolg         | Bedeutung                            |
| -------------------------------------------- | -------------- | ------------------------------------ |
| `GET /api/projects?q=ui&limit=20&cursor=...` | 200            | Gefilterte Ergebnisseite             |
| `GET /api/projects/{id}`                     | 200            | Einzelnes Projekt                    |
| `POST /api/projects`                         | 201 + Location | Projekt anlegen                      |
| `PATCH /api/projects/{id}`                   | 200            | Erlaubte Felder ändern               |
| `DELETE /api/projects/{id}`                  | 204            | Projekt löschen                      |
| `POST /api/projects/{id}/actions/publish`    | 200            | Fachlichen Zustandswechsel ausführen |

Die Referenz implementiert den Client gegen diesen Beispielvertrag. Ein Backend
ist nicht Teil des Repositories. `PATCH` akzeptiert hier nur den Namen; der
Statuswechsel wird über eine fachliche Aktion ausgeführt.

### Liste und Pagination

```json
{
  "items": [
    {
      "id": "p1",
      "title": "Designsystem",
      "status": "draft",
      "version": 3,
      "updated_at": "2026-10-24T10:00:00Z"
    }
  ],
  "nextCursor": "opaque-next-page-token"
}
```

`nextCursor: null` bedeutet letzte Seite. Der Server begrenzt `limit`, definiert
eine stabile Reihenfolge mit einem eindeutigen Tie-Breaker wie der ID und bindet
Cursor an die passenden Filter. Clients interpretieren oder erzeugen Cursor
nicht selbst. Bei Filterwechsel beginnt die Pagination erneut.

Das Beispiel fragt die erste Seite mit Limit 20 ab. Weitere Seiten werden im
Client-Vertrag unterstützt, aber noch nicht im Store angehängt. Für einen
vollständigen Pagination-Ablauf gehören Cursor, Ladezustände und Deduplizierung
bewusst zum Feature.

## Typisierter API-Client

<!-- example: projects-api.ts -->

```ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';
import {
  fromProjectDto,
  type CreateProject,
  type Project,
  type ProjectDto,
  type ProjectPage,
  type ProjectPageDto,
  type UpdateProject,
} from './project.model';

export const PROJECTS_API_URL = new InjectionToken<string>('PROJECTS_API_URL', {
  factory: () => '/api/projects',
});

@Injectable({ providedIn: 'root' })
export class ProjectsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(PROJECTS_API_URL);
  private url(id: string): string {
    return `${this.base}/${encodeURIComponent(id)}`;
  }
  private version(version: number): HttpHeaders {
    // This example backend defines an ETag as the quoted DTO version.
    return new HttpHeaders({ 'If-Match': `"${version}"` });
  }
  list(query: string, cursor?: string): Observable<ProjectPage> {
    let params = new HttpParams().set('q', query.trim()).set('limit', 20);
    if (cursor) params = params.set('cursor', cursor);
    return this.http
      .get<ProjectPageDto>(this.base, { params })
      .pipe(
        map((page) => ({ items: page.items.map(fromProjectDto), nextCursor: page.nextCursor })),
      );
  }
  get(id: string): Observable<Project> {
    return this.http.get<ProjectDto>(this.url(id)).pipe(map(fromProjectDto));
  }
  create(input: CreateProject, requestId: string): Observable<Project> {
    return this.http
      .post<ProjectDto>(
        this.base,
        { title: input.name },
        {
          headers: new HttpHeaders({ 'Idempotency-Key': requestId }),
        },
      )
      .pipe(map(fromProjectDto));
  }
  update(project: Project, input: UpdateProject): Observable<Project> {
    return this.http
      .patch<ProjectDto>(
        this.url(project.id),
        { title: input.name },
        {
          headers: this.version(project.version),
        },
      )
      .pipe(map(fromProjectDto));
  }
  remove(project: Project): Observable<void> {
    return this.http.delete<void>(this.url(project.id), { headers: this.version(project.version) });
  }
  publish(project: Project, requestId: string): Observable<Project> {
    return this.http
      .post<ProjectDto>(
        `${this.url(project.id)}/actions/publish`,
        {},
        {
          headers: this.version(project.version).set('Idempotency-Key', requestId),
        },
      )
      .pipe(map(fromProjectDto));
  }
}
```

<!-- /example -->

Der API-Client ist zustandsarm und kann deshalb app-weit bereitgestellt werden.
Ladezustände gehören zum jeweiligen Verbraucher. Es gibt hier keine globale
Variable `isLoading` für sämtliche HTTP-Anfragen.

`HttpParams` übernimmt das Encoding. IDs werden für Pfadsegmente kodiert.
Create- und Update-DTOs erlauben nur die vom Server vorgesehenen Eingaben;
`Partial<Project>` würde etwa ID, Status und Version ungewollt zu Schreibfeldern
machen. Für unterschiedliche Anwendungsfälle sind explizite Methoden gut lesbar.

`HttpClient<T>` prüft die Antwort **nicht zur Laufzeit**. Für unzuverlässige oder
kritische Grenzen gehört eine Schema-Prüfung vor das DTO-Mapping. Das Beispiel
setzt einen vereinbarten, getesteten Antwortvertrag voraus.

## Gleichzeitige Änderungen erkennen

Ein Client sendet beim Ändern oder Löschen `If-Match`. Der Beispielserver definiert
seinen ETag als in Anführungszeichen gesetzte DTO-Version, zum Beispiel `"3"`.
In einer echten API sind ETags häufig opake Strings; dann den vom Server
empfangenen ETag unverändert halten und zurücksenden.

Bei veralteter Version liefert der Server **412 Precondition Failed**. Die UI
bietet Neuladen beziehungsweise einen bewussten Konfliktablauf an. Eine alte
Version wird nicht still durch die gerade geladene ersetzt und erneut gesendet,
weil dadurch fremde Änderungen überschrieben werden könnten.

## Einheitliche Fehler

Für API-Fehler eignet sich `application/problem+json` nach RFC 9457. Ein Beispiel
mit einer dokumentierten Erweiterung für Feldfehler:

```json
{
  "type": "https://api.example.com/problems/validation",
  "title": "Eingaben ungültig",
  "status": 422,
  "instance": "/requests/req-123",
  "errors": { "name": ["Der Name darf höchstens 120 Zeichen lang sein."] }
}
```

`errors` ist eine eigene Erweiterung, kein automatisch festgelegter Teil des
Standards. Der Vertrag muss festlegen, wie Serverfelder zu Formularfeldern
passen. Der Demo-Client zeigt zunächst allgemeine, kontrollierte Meldungen:

<!-- example: user-error.ts -->

```ts
import { HttpErrorResponse } from '@angular/common/http';

export interface UserError {
  readonly message: string;
  readonly status: number | null;
}

export function toUserError(error: unknown): UserError {
  const status = error instanceof HttpErrorResponse ? error.status : null;
  const message =
    status === 0
      ? 'Die Verbindung ist unterbrochen.'
      : status === 412
        ? 'Die Daten wurden inzwischen geändert. Bitte neu laden.'
        : status === 409
          ? 'Die Aktion ist im aktuellen Zustand nicht möglich.'
          : status === 422
            ? 'Bitte die Eingaben prüfen.'
            : status === 401
              ? 'Bitte erneut anmelden.'
              : status === 403
                ? 'Für diese Aktion fehlt die Berechtigung.'
                : 'Die Anfrage konnte nicht abgeschlossen werden.';
  return { message, status };
}
```

<!-- /example -->

| Status              | Typische UI-Reaktion                                      |
| ------------------- | --------------------------------------------------------- |
| 0 im Angular-Client | Netzwerk-/Verbindungsfehler anzeigen                      |
| 401                 | Sitzung / Anmeldung klären                                |
| 403                 | Fehlende Berechtigung erklären                            |
| 404                 | Nicht mehr vorhandene Ressource behandeln                 |
| 409                 | Fachlicher Konflikt / Zustand passt nicht                 |
| 412                 | Veraltete Version, bewusster Reload-/Konfliktablauf       |
| 422                 | Eingaben korrigieren, Feldfehler zuordnen                 |
| 429                 | Wartezeit / Retry-After berücksichtigen                   |
| 5xx                 | Allgemeine Störung, passende Wiederholungsoption anbieten |

Der kleine Error-Mapper deckt nicht jeden Status gesondert ab. Read- und
Write-Fehler bleiben im Store getrennt. Backend-Details und Stacktraces gehören
nicht ungeprüft in eine Meldung der Oberfläche.

## Infrastruktur an der richtigen Stelle

Basis-URLs über Konfiguration oder einen InjectionToken bereitstellen.
Auth-/Korrelations-Header können funktionale HTTP-Interceptors übernehmen.
Die gewählte Session-Lösung bestimmt Cookie-, Token- und XSRF-Verhalten;
Berechtigungen werden auf dem Server geprüft.

Eine geänderte Domäne erfordert gegebenenfalls einen passenden CORS-Vertrag für
Header wie `If-Match` und `Idempotency-Key`. Fachliche Fehlerbehandlung bleibt
beim Feature. Ein globaler Interceptor sollte nicht unbemerkt alle Writes
wiederholen oder jede fachliche Meldung als denselben Toast anzeigen.

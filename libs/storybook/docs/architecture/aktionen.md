# Aktionen und Nebenläufigkeit

CRUD beschreibt Änderungen an Ressourcen. Manche Vorgänge haben zusätzliche
Geschäftsregeln: veröffentlichen, genehmigen, archivieren oder eine Berechnung
starten. Eine passende API gibt solchen Absichten einen klaren Vertrag.

## Ein expliziter fachlicher Command

```http
POST /api/projects/p1/actions/publish
Content-Type: application/json
If-Match: "3"
Idempotency-Key: 0b77a144-4e94-4d26-a755-000000000001

{}
```

Der Server prüft Berechtigung, Version und den erlaubten Zustandswechsel. Die
Antwort enthält im Beispiel das aktualisierte Projekt. Ein beliebiges
`PATCH { "status": "published" }` würde diese Absicht und ihre Voraussetzungen
weniger ausdrücklich darstellen.

Der Pfad `/actions/publish` ist eine hier gewählte Konvention. Manche APIs
modellieren denselben Vorgang als fachliche Unterressource, etwa eine
Veröffentlichung. Wichtig sind konsistente Semantik, Vorbedingungen und ein
nachvollziehbares Ergebnis, nicht eine einzige verbindliche URL-Schreibweise.

In der UI lautet das Ereignis `publishRequested`; am Store und API-Client heißt
die Methode `publish`. So bleibt die fachliche Absicht über die Schichten lesbar.

## Den passenden RxJS-Operator wählen

| Operator     | Geeignetes Muster                         | Verhalten                                                   |
| ------------ | ----------------------------------------- | ----------------------------------------------------------- |
| `switchMap`  | Suche / neueste Lesesicht                 | Vorherige Subscription beenden, neueste Sicht übernehmen    |
| `exhaustMap` | Ein Schreibvorgang, Doppelklick vermeiden | Weitere Auslöser während des laufenden Vorgangs ignorieren  |
| `concatMap`  | Gewollte Reihenfolge von Commands         | Jeder Auslöser wird nacheinander ausgeführt                 |
| `mergeMap`   | Unabhängige parallele Vorgänge            | Mehrere Requests gleichzeitig; Zustand je Vorgang verwalten |

Der Referenz-Store verwendet `switchMap` für Reads und einen gemeinsamen
`exhaustMap` für alle Writes dieses Features. Das bedeutet bewusst: Während
irgendein Write läuft, wird ein zweiter Write ignoriert. Die UI sperrt die
entsprechenden Aktionen zusätzlich mit `writing`.

Für einen großen Tabelleneditor können unabhängige Vorgänge je Datensatz
angemessener sein. Dann gehören Pending-/Fehlerzustände und Konkurrenzkontrolle
zu den jeweiligen IDs. Ein einzelnes globales Boolean reicht bei echten
parallelen Requests nicht.

## Client-Abbruch ist kein Server-Rollback

Eine beendete HTTP-Subscription kann den Client-Request abbrechen. Der Server
kann einen Schreibvorgang zu diesem Zeitpunkt bereits verarbeitet haben.
Deshalb ist `switchMap` keine allgemeine Rückgängig-Funktion für Mutationen.
Ein fachlicher Abbruch benötigt einen eigenen Serververtrag.

## Idempotenz bewusst entwerfen

Create und Publish erhalten im Beispiel eine Request-ID. Die Page merkt sich
beim Anlegen Payload und Key. Ein weiterer Versuch mit unverändertem Payload
verwendet denselben Key; erst eine andere Eingabe oder ein bestätigter Erfolg
beendet diesen Versuch. Für Publish wird der Key pro Projektversion gehalten.
Der HTTP-Client erzeugt nicht bei jeder Wiederholung einen neuen Key.

Der Server muss Idempotenz tatsächlich implementieren, etwa über den
Schlüssel aus Akteur, Operation und Idempotency-Key mit einem Payload-Hash und
gespeichertem Ergebnis. Gleichzeitig eintreffende gleiche Keys dürfen nicht
beide die Wirkung ausführen. Derselbe Key mit anderem Payload ist ein Konflikt.
Aufbewahrungsdauer und Wiederholungsverhalten gehören in den API-Vertrag.

Eine Wiederholung **derselben** fehlgeschlagenen Absicht muss ihren Key behalten.
Automatische Write-Retries sind im Beispiel nicht eingebaut. Die gespeicherten
Versuche leben nur so lange wie die Page. Für Wiederaufnahme nach einem Reload
braucht das Produkt eine passende Persistenz- oder Operationsstatus-Lösung.
Ein neuer Payload ist eine neue Absicht, keine unbemerkte Wiederholung der alten.

HTTP-Idempotenz beschreibt die beabsichtigte Wirkung, nicht zwingend identische
Statuscodes. Ein wiederholtes DELETE kann je nach dokumentiertem Vertrag etwa
204 oder 404 liefern, obwohl die Ressource in beiden Fällen nicht mehr existiert.

## Erfolg, Fehler und erneute Versuche

`tapResponse` sitzt im inneren HTTP-Stream. So beendet ein einzelner Fehler
nicht die ganze `rxMethod`-Eingabepipeline. `finalize` räumt den jeweiligen
Pending-Zustand auf. Ein Write-Fehler verändert im Beispiel keine Entities.

Nach Erfolg wird die aktuelle Serverliste neu angefragt. Eine lokale optimistische
Aktualisierung ist möglich, benötigt aber einen konkreten Plan für Rücknahme,
Versionen, Filterzugehörigkeit und Pagination. Für den Einstieg ist der bestätigte
Serverzustand oft leichter korrekt zu halten.

Retries für Reads und Writes getrennt entscheiden. Für geeignete Reads können
begrenzte Versuche mit Backoff und gegebenenfalls Retry-After passen. Writes
benötigen zusätzlich klare Idempotenz-/Konfliktregeln. Der Beispiel-Client führt
keine automatischen HTTP-Retries aus.

## Lang laufende Aktionen

Für einen länger dauernden Auftrag ist dieser alternative Vertrag sinnvoll:

```http
HTTP/1.1 202 Accepted
Location: /api/operations/op-123
Retry-After: 2
Content-Type: application/json

{ "id": "op-123", "status": "queued" }
```

Die UI verfolgt anschließend `/api/operations/op-123` per Polling oder einer
vereinbarten Push-Verbindung. Der Operationszustand kann beispielsweise
`queued`, `running`, `succeeded`, `failed` und `cancelled` umfassen. Eine
angenommene Anfrage ist noch kein fachlich abgeschlossener Vorgang.

Polling endet bei einem terminalen Zustand oder beim passenden UI-Lifecycle.
Ein Client-Timeout kann einen unbekannten Ausgang bedeuten; vor einem erneuten
Command zunächst den Operations-/Idempotenzstatus klären. Dieser 202-Ablauf ist
ein Architekturvertrag und nicht Teil des synchronen Publish-Referenzclients.

# Tests und schrittweise Weiterentwicklung

Architektur wird belastbar, wenn ihre wichtigsten Grenzen und Abläufe geprüft
werden. Viele kleine Mocks allein beweisen noch keinen korrekten Datenfluss.

## Ausführbare Referenz

Die Dateien unter `libs/storybook/examples/architecture` sind echte Angular-
und NgRx-Quellen. Die Dokumentation übernimmt deren Codeblöcke automatisch.
Sie lassen sich aus dem Repository-Root prüfen:

```sh
npm ci
npm run docs:architecture:check
npm run test:architecture
npm run build-storybook
```

`docs:architecture:check` erkennt Abweichungen zwischen den Quellen und ihren
Codeblöcken. Mit `npm run docs:architecture:sync` werden die Blöcke nach einer
bewussten Quellenänderung aktualisiert. Der eigene Test-Target verwendet Angulars
Compiler und das HTTP-Testbackend. Es wird keine echte Backend-Verbindung
vorausgesetzt und kein Netzwerk-End-to-End-Erfolg behauptet.

## Was geprüft wird

| Grenze / Ablauf | Aussage des Tests                                                            |
| --------------- | ---------------------------------------------------------------------------- |
| API-Client      | HTTP-Methode, Parameter, DTO-Mapping und Header stimmen                      |
| Read-Pipeline   | Alter Read wird sofort storniert; nur der neue startet nach der Pause        |
| Fehler          | Ein HTTP-Fehler beendet nicht alle künftigen Read-/Write-Aufrufe             |
| Write-Pipeline  | Gleichzeitig ausgelöste Writes werden gemäß exhaustMap-Regel behandelt       |
| Mutationserfolg | Aktueller Filter wird neu geladen, statt unpassende Entities einzufügen      |
| Konflikt        | 412 wird sichtbar und verändert keine Daten optimistisch                     |
| Lifecycle       | Zerstören des Injectors beendet offene Reads                                 |
| Store-Scope     | Zwei Pages erhalten getrennte Store-Instanzen                                |
| Formular        | Publish erhält den Entwurf; erst eine bestätigte Erstellung setzt ihn zurück |

Ein Test gegen einen Mock-Server ersetzt keine Backend-Vertragstests. Ergänzend
braucht ein Produkt mindestens aussagekräftige Backend-Tests und repräsentative
Browserabläufe gegen eine Testumgebung.

## Welche Tests auf welche Ebene gehören

Reine Domain-Regeln können ohne Angular getestet werden. Der API-Client wird
mit `provideHttpClientTesting()` gegen Request- und Response-Verträge geprüft.
Store-Tests prüfen den öffentlichen Zustand und konkrete Abläufe einschließlich
Fehlern, Stornierung und Konkurrenz. UI-Tests prüfen Beschriftung, Interaktion,
Outputs, Fokus und Formulare.

Ein Browser-Smoke-Test verbindet die relevanten Teile: suchen, anlegen, Fehler
korrigieren und eine fachliche Aktion ausführen. Dabei muss unterscheidbar sein,
ob wirklich ein Backend aufgerufen wurde oder nur ein Testdouble geantwortet hat.

## Anforderungsgetriebener Ausbau

- Mehrere Seiten brauchen denselben Zustand: eine passende Feature-Shell oder
  einen ausdrücklich gemeinsamen Cache einführen.
- Viele Entities: Pagination, serverseitige Suche oder Virtualisierung nach
  tatsächlichem Bedarf ergänzen; ein Entity-Store rendert nicht automatisch
  große Listen performant.
- Parallele Aktionen: Pending-/Fehlerstatus je Entity oder Operation modellieren.
- Mehrstufige Formulare: eigenen Draft-Lifecycle und bestätigte Speicherpunkte klären.
- Offline/optimistische UI: Konflikte, Rollback und Serverabgleich vorher entwerfen.
- Generische Store-Features: erst aus mehreren echten, gleichen Abläufen
  abstrahieren. Fachliche Methoden dürfen lesbar bleiben.

## Gute öffentliche APIs erhalten

Neue Inputs und Methoden mit einem konkreten Consumer begründen. Eine kleine
Komponenten-API kann sich später gezielt erweitern; das Entfernen eines breiten,
bereits verwendeten Config-Objekts ist aufwendiger.

Für HTTP-Verträge sind kompatible Ergänzungen, versionierte Änderungen bei
Brüchen und ein überprüfbares Schema sinnvoll. OpenAPI kann Clients und
Vertragstests unterstützen; generierte Transporttypen müssen nicht automatisch
das Domain-Modell jeder UI werden.

Eine Anwendung sollte dokumentieren, wer welche Daten besitzt, wie lange eine
Instanz lebt und was nach Fehler, Erfolg, Reload und Benutzerwechsel passiert.
Diese Entscheidungen helfen später mehr als eine große Zahl abstrakter Basisklassen.

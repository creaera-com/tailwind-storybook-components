# Server-Suche und Autocomplete

Bei einer Server-Suche besitzt die UI den Eingabetext, ein Feature-Store den
Anfragezustand und ein API-Client den HTTP-Vertrag. Das generische Eingabefeld
kennt weder URLs noch Fachregeln.

## Die richtige Reihenfolge

```text
Neuer Suchwert
  → alten Debounce-Timer und alten Read sofort beenden
  → kurze Pause vor dem neuen Request
  → API anfragen
  → nur Ergebnis der aktuellen Subscription übernehmen
```

Der vollständige Code steht im Kapitel **State und Signal Store**. Entscheidend
ist die Struktur des dortigen `load`-Helpers:

```text
rxMethod-Eingabe
  → switchMap
      → defer: loading einschalten
      → timer(delay)
      → switchMap: api.list(query)
      → tapResponse: Ergebnis / Fehler / finalize
```

Der Timer liegt innerhalb des äußeren `switchMap`. Dadurch wird ein älterer
HTTP-Read schon beim neuen Suchwert beendet und nicht erst nach der neuen
Debounce-Pause. Andernfalls könnte ein altes Ergebnis in dieser Pause noch die
neue Ansicht überschreiben. Genau diese Reihenfolge wird im Referenztest geprüft.

## Ladezustand ohne Rennen

Die vorherige Subscription wird zuerst beendet. Ihr `finalize` läuft, bevor
`defer` der neuen Subscription `loading` erneut einschaltet. Dadurch kann der
Abschluss des alten Requests den neuen Ladezustand nicht verspätet löschen.

Bei anderen Nebenläufigkeitsmodellen, etwa mehreren gleichzeitigen Reads,
werden stattdessen requestbezogene IDs, Zähler oder Status-Maps benötigt.
Nicht denselben Boolean aus beliebig vielen unabhängigen Subscriptions setzen.

## Eingabetext und Serverparameter

Die Page übergibt den rohen Text an `store.search`. Der Store behält ihn als
UI-Wert; der API-Client trimmt den Suchparameter für den Server. So wird der
Benutzer nicht bei jedem Leerzeichen mitten beim Tippen korrigiert.

Der Demo-Store wartet 250ms auf eine neue Suche und lädt bei `reload()` ohne
zusätzliche Suchpause. Die Dauer ist eine Startannahme und sollte zum Produkt
passen. Fehler lassen die Eingabepipeline weiterleben, sodass eine neue Suche
oder ein Reload danach wieder funktioniert.

## Autocomplete mit einer Serverliste

Die bestehende Autocomplete-Komponente erhält derzeit Textvorschläge über
`options` und filtert diese zusätzlich lokal. Eine Anwendung kann dieses Array
asynchron ersetzen. Das ist noch kein dediziertes API für reine Server-Suche.

Für eine passende spätere Erweiterung sind drei kleine, klar getrennte
Vertragsbestandteile sinnvoll:

| Bestandteil                  | Verantwortung                                                   |
| ---------------------------- | --------------------------------------------------------------- |
| Suchtext-Ereignis            | UI meldet die Eingabe an das Feature                            |
| Ladezustand                  | UI zeigt, dass die aktuelle Suche läuft                         |
| Lokale Filterung abschaltbar | Server-Ranking, Synonyme oder Fuzzy-Ergebnisse bleiben erhalten |

Diese Erweiterung wird hier beschrieben und nicht als bereits implementierte
Autocomplete-API ausgegeben. Der Serverzugriff bleibt im API-Client und Store.
Das UI-Control sollte nicht selbst eine URL oder ein HttpClient benötigen.

Wenn der Server anhand von Synonymen „München“ für „Munich“ findet, würde eine
zusätzliche einfache lokale Teilstringsuche möglicherweise genau dieses
Ergebnis entfernen. Deshalb muss die Verantwortung für die Filterung bewusst
festgelegt werden.

## Query und Auswahl getrennt halten

Bei fachlichen Vorschlägen wie Kunden oder Projekten ist häufig die stabile
ID der gewählten Entity relevant, während der Suchtext nur deren sichtbares
Label ist. Dafür braucht eine spätere Objekt-Autocomplete-API einen ausdrücklich
definierten Wertvertrag. Freie Texteingabe, gewählte ID und angezeigter Text
sollten dann nicht versehentlich denselben State-Slot verwenden.

Das aktuelle Autocomplete speichert einen String. Ein Formular kann einen eigenen
Validator verwenden, wenn es nur existierende Vorschläge zulassen soll.
Die Architekturbeispiele selbst verwenden die Suchliste der Projektverwaltung
und setzen die noch offenen Formular-/Autocomplete-PRs nicht voraus.

## URL und Lifecycle

Für eine teilbare Ergebnisseite können Query-Parameter die Suchquelle sein.
Die UI aktualisiert dann die URL und der Store reagiert auf diese Quelle.
Die Registrierung einer Signal-/Observable-Eingabe an einer `rxMethod` gehört
in einen passenden Injection-/Lifecycle-Kontext und wird einmal eingerichtet,
nicht erneut bei jedem `effect`-Durchlauf.

Beim Verlassen der im Beispiel komponentenlokal bereitgestellten Seite werden
offene Reads beendet. Ein Write-Abbruch macht dessen Serverwirkung nicht
rückgängig; dafür gelten die Regeln aus **Aktionen und Nebenläufigkeit**.

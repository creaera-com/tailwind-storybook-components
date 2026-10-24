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

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

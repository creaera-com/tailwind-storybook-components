import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ProjectDto } from './project.model';
import { ProjectsApi } from './projects-api';
import { ProjectPage } from './project-page';
import { ProjectsStore } from './projects-store';
import { toUserError } from './user-error';

const dto: ProjectDto = {
  id: 'p1',
  title: 'Designsystem',
  status: 'draft',
  version: 3,
  updated_at: '2026-10-24T10:00:00Z',
};
const project = {
  id: 'p1',
  name: 'Designsystem',
  status: 'draft' as const,
  version: 3,
  updatedAt: dto.updated_at,
};
let http: HttpTestingController;
beforeEach(() => {
  vi.useFakeTimers();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), ProjectsStore],
  });
  http = TestBed.inject(HttpTestingController);
});
afterEach(() => {
  http.verify({ ignoreCancelled: true });
  TestBed.resetTestingModule();
  vi.useRealTimers();
});

describe('typed API boundary', () => {
  it('encodes query parameters and maps DTOs to the domain model', () => {
    let name = '';
    TestBed.inject(ProjectsApi)
      .list('  Grün & UI  ', 'opaque cursor')
      .subscribe((page) => (name = page.items[0].name));
    const request = http.expectOne((req) => req.url === '/api/projects');
    expect(request.request.params.get('q')).toBe('Grün & UI');
    expect(request.request.params.get('cursor')).toBe('opaque cursor');
    expect(request.request.params.get('limit')).toBe('20');
    request.flush({ items: [dto], nextCursor: null });
    expect(name).toBe('Designsystem');
  });
  it('uses explicit CRUD methods, version headers and idempotency keys', () => {
    const api = TestBed.inject(ProjectsApi);
    api.get('p/1').subscribe();
    http.expectOne('/api/projects/p%2F1').flush(dto);
    api.create({ name: 'Neu' }, 'intent-create').subscribe();
    const create = http.expectOne('/api/projects');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ title: 'Neu' });
    expect(create.request.headers.get('Idempotency-Key')).toBe('intent-create');
    create.flush(dto);
    api.update(project, { name: 'Umbenannt' }).subscribe();
    const update = http.expectOne('/api/projects/p1');
    expect(update.request.method).toBe('PATCH');
    expect(update.request.headers.get('If-Match')).toBe('"3"');
    update.flush(dto);
    api.remove(project).subscribe();
    const remove = http.expectOne('/api/projects/p1');
    expect(remove.request.method).toBe('DELETE');
    expect(remove.request.headers.get('If-Match')).toBe('"3"');
    remove.flush(null, { status: 204, statusText: 'No Content' });
    api.publish(project, 'intent-publish').subscribe();
    const publish = http.expectOne('/api/projects/p1/actions/publish');
    expect(publish.request.headers.get('If-Match')).toBe('"3"');
    expect(publish.request.headers.get('Idempotency-Key')).toBe('intent-publish');
    publish.flush({ ...dto, status: 'published', version: 4 });
  });
});

describe('feature Signal Store', () => {
  it('loads entity state and computes selection without copying the selected entity', () => {
    const store = TestBed.inject(ProjectsStore);
    store.reload();
    expect(store.loading()).toBe(true);
    vi.advanceTimersByTime(0);
    http.expectOne((req) => req.url === '/api/projects').flush({ items: [dto], nextCursor: null });
    expect(store.entities()[0].name).toBe('Designsystem');
    expect(store.loading()).toBe(false);
    store.select('p1');
    expect(store.selectedProject()?.id).toBe('p1');
    store.select(null);
    expect(store.selectedProject()).toBeNull();
  });
  it('cancels stale reads immediately, debounces only the new request and keeps loading accurate', () => {
    const store = TestBed.inject(ProjectsStore);
    store.search('alt');
    vi.advanceTimersByTime(250);
    const old = http.expectOne((req) => req.params.get('q') === 'alt');
    store.search('neu');
    expect(old.cancelled).toBe(true);
    expect(store.loading()).toBe(true);
    vi.advanceTimersByTime(249);
    http.expectNone((req) => req.params.get('q') === 'neu');
    vi.advanceTimersByTime(1);
    http.expectOne((req) => req.params.get('q') === 'neu').flush({ items: [], nextCursor: null });
    expect(store.entities()).toEqual([]);
    expect(store.loading()).toBe(false);
  });
  it('keeps the read method alive after an HTTP error', () => {
    const store = TestBed.inject(ProjectsStore);
    store.reload();
    vi.advanceTimersByTime(0);
    http
      .expectOne((req) => req.url === '/api/projects')
      .flush({}, { status: 500, statusText: 'Server Error' });
    expect(store.loadError()?.status).toBe(500);
    expect(store.loading()).toBe(false);
    store.reload();
    vi.advanceTimersByTime(0);
    http.expectOne((req) => req.url === '/api/projects').flush({ items: [dto], nextCursor: null });
    expect(store.loadError()).toBeNull();
    expect(store.entities()).toHaveLength(1);
  });
  it('ignores concurrent writes, then invalidates and reloads the latest filter after success', () => {
    const store = TestBed.inject(ProjectsStore);
    store.create({ name: 'Neu' }, 'one');
    store.create({ name: 'Doppelt' }, 'two');
    const posts = http.match((req) => req.method === 'POST');
    expect(posts).toHaveLength(1);
    expect(store.writing()).toBe(true);
    store.search('anderer Filter');
    vi.advanceTimersByTime(250);
    const staleRead = http.expectOne((req) => req.params.get('q') === 'anderer Filter');
    posts[0].flush(dto);
    expect(staleRead.cancelled).toBe(true);
    expect(store.completedCreates()).toBe(1);
    expect(store.writing()).toBe(false);
    vi.advanceTimersByTime(0);
    http
      .expectOne((req) => req.params.get('q') === 'anderer Filter')
      .flush({ items: [], nextCursor: null });
    expect(store.entities()).toEqual([]);
  });
  it('does not change data after a conflict and allows a later action attempt', () => {
    const store = TestBed.inject(ProjectsStore);
    store.publish(project, 'one');
    http
      .expectOne('/api/projects/p1/actions/publish')
      .flush({}, { status: 412, statusText: 'Precondition Failed' });
    expect(store.writeError()?.status).toBe(412);
    expect(store.writing()).toBe(false);
    expect(store.completedCreates()).toBe(0);
    store.publish(project, 'one');
    http
      .expectOne('/api/projects/p1/actions/publish')
      .flush({ ...dto, status: 'published', version: 4 });
    vi.advanceTimersByTime(0);
    http
      .expectOne((req) => req.url === '/api/projects')
      .flush({ items: [{ ...dto, status: 'published', version: 4 }], nextCursor: null });
    expect(store.writeError()).toBeNull();
    expect(store.entities()[0].status).toBe('published');
  });
  it('cancels active reads when its injector is destroyed', () => {
    const store = TestBed.inject(ProjectsStore);
    store.reload();
    vi.advanceTimersByTime(0);
    const request = http.expectOne((req) => req.url === '/api/projects');
    TestBed.resetTestingModule();
    expect(request.cancelled).toBe(true);
  });
  it('normalizes errors without exposing arbitrary backend details', () => {
    expect(
      toUserError(new HttpErrorResponse({ status: 412, error: { detail: 'internal stack trace' } }))
        .message,
    ).not.toContain('stack');
    expect(toUserError(new Error('internal')).status).toBeNull();
  });
});

describe('component boundaries', () => {
  it('provides independent stores per page and preserves a create draft during a publish action', () => {
    const first = TestBed.createComponent(ProjectPage);
    first.detectChanges();
    const second = TestBed.createComponent(ProjectPage);
    second.detectChanges();
    vi.advanceTimersByTime(0);
    for (const request of http.match((req) => req.url === '/api/projects'))
      request.flush({ items: [dto], nextCursor: null });
    expect(first.componentInstance.store).not.toBe(second.componentInstance.store);
    first.componentInstance.form.controls.name.setValue('Mein Entwurf');
    first.componentInstance.publish(project);
    http.expectOne('/api/projects/p1/actions/publish').flush({ ...dto, status: 'published' });
    vi.advanceTimersByTime(0);
    http.expectOne((req) => req.url === '/api/projects').flush({ items: [], nextCursor: null });
    first.detectChanges();
    expect(first.componentInstance.form.controls.name.value).toBe('Mein Entwurf');
    first.componentInstance.create();
    http.expectOne((req) => req.method === 'POST').flush(dto);
    vi.advanceTimersByTime(0);
    http.expectOne((req) => req.url === '/api/projects').flush({ items: [dto], nextCursor: null });
    first.detectChanges();
    expect(first.componentInstance.form.controls.name.value).toBe('');
    expect(second.componentInstance.store.entities()[0].status).toBe('draft');
  });
});

describe('idempotent UI retry', () => {
  it('preserves both the draft and its idempotency key after an uncertain create failure', () => {
    const fixture = TestBed.createComponent(ProjectPage);
    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    http.expectOne((req) => req.url === '/api/projects').flush({ items: [], nextCursor: null });
    fixture.componentInstance.form.controls.name.setValue('Neues Projekt');
    fixture.componentInstance.create();
    const first = http.expectOne((req) => req.method === 'POST');
    const key = first.request.headers.get('Idempotency-Key');
    first.flush({}, { status: 500, statusText: 'Unknown outcome' });
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.name.value).toBe('Neues Projekt');
    fixture.componentInstance.create();
    const retry = http.expectOne((req) => req.method === 'POST');
    expect(retry.request.headers.get('Idempotency-Key')).toBe(key);
    retry.flush(dto);
    vi.advanceTimersByTime(0);
    http.expectOne((req) => req.url === '/api/projects').flush({ items: [dto], nextCursor: null });
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.name.value).toBe('');
  });
});

it('preserves edits made after a create request was sent', () => {
  const fixture = TestBed.createComponent(ProjectPage);
  fixture.detectChanges();
  vi.advanceTimersByTime(0);
  http.expectOne((req) => req.url === '/api/projects').flush({ items: [], nextCursor: null });
  fixture.componentInstance.form.controls.name.setValue('Erstes Projekt');
  fixture.componentInstance.create();
  const create = http.expectOne((req) => req.method === 'POST');
  fixture.componentInstance.form.controls.name.setValue('Schon ein neuer Entwurf');
  fixture.componentInstance.create();
  http.expectNone((req) => req.method === 'POST');
  create.flush(dto);
  vi.advanceTimersByTime(0);
  http.expectOne((req) => req.url === '/api/projects').flush({ items: [dto], nextCursor: null });
  fixture.detectChanges();
  expect(fixture.componentInstance.form.controls.name.value).toBe('Schon ein neuer Entwurf');
});

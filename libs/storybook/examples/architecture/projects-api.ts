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

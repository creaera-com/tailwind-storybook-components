import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@creaera/ui';
import { ProjectList } from './project-list';
import { type CreateProject, type Project } from './project.model';
import { ProjectsStore } from './projects-store';

@Component({
  selector: 'app-project-page',
  imports: [ProjectList, Button, ReactiveFormsModule],
  providers: [ProjectsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Projekte</h1>
    <label for="project-search">Suchen</label>
    <input id="project-search" type="search" [value]="store.query()" (input)="search($event)" />
    @if (store.loading()) {
      <p role="status">Projekte werden geladen.</p>
    } @else if (store.loadError(); as error) {
      <p role="alert">{{ error.message }}</p>
      <button uiButton (click)="store.reload()">Erneut laden</button>
    } @else {
      <app-project-list
        [projects]="store.entities()"
        [selectedId]="store.selectedId()"
        [busy]="store.writing()"
        (selected)="store.select($event)"
        (publishRequested)="publish($event)"
      />
    }
    <form [formGroup]="form" (ngSubmit)="create()">
      <label for="project-name">Projektname</label>
      <input id="project-name" formControlName="name" />
      @if (form.controls.name.invalid && form.controls.name.touched) {
        <p>Bitte einen Namen eingeben.</p>
      }
      <button uiButton type="submit" [disabled]="store.writing()">Anlegen</button>
    </form>
    @if (store.writeError(); as error) {
      <p role="alert">{{ error.message }}</p>
    }`,
})
export class ProjectPage {
  readonly store = inject(ProjectsStore);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  private createAttempt: { input: CreateProject; requestId: string } | null = null;
  private readonly publishAttempts = new Map<string, { version: number; requestId: string }>();

  constructor() {
    this.store.reload();
    let completed = 0;
    // A UI side effect: clear the draft only after a confirmed server creation.
    effect(() => {
      const current = this.store.completedCreates();
      if (current > completed) {
        if (this.createAttempt?.input.name === this.form.controls.name.value) this.form.reset();
        this.createAttempt = null;
        completed = current;
      }
    });
  }
  search(event: Event): void {
    this.store.search((event.target as HTMLInputElement).value);
  }
  create(): void {
    this.form.markAllAsTouched();
    if (!this.form.valid || this.store.writing()) return;
    const input = this.form.getRawValue();
    if (!this.createAttempt || this.createAttempt.input.name !== input.name) {
      this.createAttempt = { input, requestId: crypto.randomUUID() };
    }
    this.store.create(this.createAttempt.input, this.createAttempt.requestId);
  }
  publish(project: Project): void {
    let attempt = this.publishAttempts.get(project.id);
    if (!attempt || attempt.version !== project.version) {
      attempt = { version: project.version, requestId: crypto.randomUUID() };
      this.publishAttempts.set(project.id, attempt);
    }
    this.store.publish(project, attempt.requestId);
  }
}

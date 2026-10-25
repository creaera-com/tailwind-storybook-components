import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '@creaera/ui';
import { type Project } from './project.model';

@Component({
  selector: 'app-project-list',
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ul>
    @for (project of projects(); track project.id) {
      <li>
        <button
          uiButton
          [variant]="selectedId() === project.id ? 'primary' : 'secondary'"
          [attr.aria-pressed]="selectedId() === project.id"
          (click)="selected.emit(project.id)"
        >
          {{ project.name }}
        </button>
        <span>{{ project.status }}</span>
        @if (project.status === 'draft') {
          <button uiButton [disabled]="busy()" (click)="publishRequested.emit(project)">
            Veröffentlichen
          </button>
        }
      </li>
    } @empty {
      <li>Keine Projekte gefunden.</li>
    }
  </ul>`,
})
export class ProjectList {
  readonly projects = input.required<readonly Project[]>();
  readonly selectedId = input<string | null>(null);
  readonly busy = input(false);
  readonly selected = output<string>();
  readonly publishRequested = output<Project>();
}

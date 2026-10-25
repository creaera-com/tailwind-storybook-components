import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TreeState } from './tree-state';

@Component({
  selector: 'ui-tree',
  template: `
    <div
      class="ui-tree"
      role="tree"
      [attr.aria-label]="label()"
      [attr.aria-disabled]="disabled()"
      [attr.tabindex]="enabledRows().length ? null : 0"
    >
      @for (row of rows(); track row.node.id) {
        <div
          class="ui-tree-row"
          role="treeitem"
          [attr.data-tree-id]="row.node.id"
          [attr.aria-label]="row.node.label"
          [attr.aria-level]="row.level"
          [attr.aria-posinset]="row.position"
          [attr.aria-setsize]="row.siblings"
          [attr.aria-expanded]="hasChildren(row) ? isExpanded(row) : null"
          [attr.aria-selected]="selected() === row.node.id"
          [attr.aria-disabled]="row.disabled"
          [tabIndex]="row.node.id === tabStop() ? 0 : -1"
          [style.--ui-tree-level]="row.level - 1"
          (focus)="focused.set(row.node.id)"
          (click)="choose(row)"
          (keydown)="navigate($event, row)"
        >
          @if (hasChildren(row)) {
            <button
              type="button"
              class="ui-tree-toggle"
              tabindex="-1"
              [disabled]="row.disabled"
              [attr.aria-label]="row.node.label + (isExpanded(row) ? ' einklappen' : ' ausklappen')"
              [attr.aria-expanded]="isExpanded(row)"
              (click)="toggle(row, $event)"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                [class.ui-tree-arrow-expanded]="isExpanded(row)"
              >
                <path
                  d="m9 6 6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          } @else {
            <span class="ui-tree-spacer" aria-hidden="true"></span>
          }
          <span class="ui-tree-label">{{ row.node.label }}</span>
        </div>
      }
    </div>
    @if (!rows().length) {
      <p class="ui-tree-empty">Keine Einträge vorhanden.</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tree extends TreeState {}

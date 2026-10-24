import {
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

/** IDs must be unique across the entire tree, not only among siblings. */
export interface UiTreeNode {
  readonly id: string;
  readonly label: string;
  readonly children?: readonly UiTreeNode[];
  readonly disabled?: boolean;
  readonly data?: Readonly<Record<string, string | number | null>>;
}

/** Additional table columns; the hierarchy always appears in the first Name column. */
export interface UiTreeColumn {
  readonly key: string;
  readonly label: string;
}

export interface TreeRow {
  readonly node: UiTreeNode;
  readonly parentId: string | null;
  readonly level: number;
  readonly position: number;
  readonly siblings: number;
  readonly disabled: boolean;
}

/** Shared row navigation for the tree and the row-focused treegrid. */
@Directive()
export abstract class TreeState {
  readonly nodes = input.required<readonly UiTreeNode[]>();
  readonly label = input.required<string>();
  readonly expanded = model<readonly string[]>([]);
  readonly selected = model<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly focused = signal<string | null>(null);
  protected readonly rows = computed(() => {
    const rows: TreeRow[] = [];
    const expanded = new Set(this.expanded());
    const visit = (
      nodes: readonly UiTreeNode[],
      parentId: string | null,
      level: number,
      disabled: boolean,
    ) => {
      nodes.forEach((node, index) => {
        const row = {
          node,
          parentId,
          level,
          position: index + 1,
          siblings: nodes.length,
          disabled: disabled || !!node.disabled,
        };
        rows.push(row);
        if (node.children?.length && expanded.has(node.id))
          visit(node.children, node.id, level + 1, row.disabled);
      });
    };
    visit(this.nodes(), null, 1, this.disabled());
    return rows;
  });
  protected readonly enabledRows = computed(() => this.rows().filter((row) => !row.disabled));
  protected readonly tabStop = computed(() => {
    const rows = this.enabledRows();
    return (
      rows.find((row) => row.node.id === this.focused())?.node.id ??
      rows.find((row) => row.node.id === this.selected())?.node.id ??
      rows[0]?.node.id
    );
  });
  protected isExpanded(row: TreeRow): boolean {
    return this.expanded().includes(row.node.id);
  }
  protected hasChildren(row: TreeRow): boolean {
    return !!row.node.children?.length;
  }
  protected choose(row: TreeRow): void {
    if (row.disabled) return;
    this.selected.set(row.node.id);
    this.focus(row.node.id);
  }
  protected toggle(row: TreeRow, event?: MouseEvent): void {
    event?.stopPropagation();
    if (row.disabled || !this.hasChildren(row)) return;
    this.expanded.update((ids) =>
      ids.includes(row.node.id) ? ids.filter((id) => id !== row.node.id) : [...ids, row.node.id],
    );
    this.focus(row.node.id);
  }
  protected focus(id: string): void {
    this.focused.set(id);
    const applyFocus = () => {
      // Compare values rather than interpolate user IDs into a CSS selector.
      const row = [
        ...this.element.nativeElement.querySelectorAll<HTMLElement>('[data-tree-id]'),
      ].find((element) => element.dataset['treeId'] === id);
      row?.focus();
      return !!row;
    };
    if (!applyFocus()) {
      // A quick second ArrowRight may target a child before Angular renders it.
      afterNextRender(
        () => {
          if (this.focused() === id) applyFocus();
        },
        { injector: this.injector },
      );
    }
  }

  protected navigate(event: KeyboardEvent, row: TreeRow): void {
    if (
      event.target !== event.currentTarget ||
      row.disabled ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const rows = this.enabledRows();
    const index = rows.findIndex((item) => item.node.id === row.node.id);
    let target: TreeRow | undefined;
    switch (event.key) {
      case 'ArrowDown':
        target = rows[Math.min(index + 1, rows.length - 1)];
        break;
      case 'ArrowUp':
        target = rows[Math.max(0, index - 1)];
        break;
      case 'Home':
        target = rows[0];
        break;
      case 'End':
        target = rows.at(-1);
        break;
      case 'ArrowRight':
        if (this.hasChildren(row) && !this.isExpanded(row)) this.toggle(row);
        else target = rows.find((item) => item.parentId === row.node.id);
        break;
      case 'ArrowLeft':
        if (this.hasChildren(row) && this.isExpanded(row)) this.toggle(row);
        else target = rows.find((item) => item.node.id === row.parentId);
        break;
      case 'Enter':
      case ' ':
        this.choose(row);
        break;
      default: {
        if (event.key.length !== 1 || !event.key.trim()) return;
        // Type-ahead starts after the current row and wraps around.
        const ordered = [...rows.slice(index + 1), ...rows.slice(0, index + 1)];
        target = ordered.find((item) =>
          item.node.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()),
        );
      }
    }
    event.preventDefault();
    if (target) this.focus(target.node.id);
  }
}

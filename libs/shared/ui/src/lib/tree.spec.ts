import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tree, TreeTable, type UiTreeNode } from '../index';

const nodes: readonly UiTreeNode[] = [
  {
    id: 'root',
    label: 'Projects',
    children: [
      {
        id: 'branch',
        label: 'Components',
        children: [
          { id: 'leaf', label: 'Buttons', data: { count: 0, unsafe: '<script>bad()</script>' } },
        ],
      },
      {
        id: 'disabled',
        label: 'Disabled',
        disabled: true,
        children: [{ id: 'locked-child', label: 'Locked child' }],
      },
      { id: 'other', label: 'Tokens' },
    ],
  },
  { id: 'docs', label: 'Documentation' },
];
afterEach(() => TestBed.resetTestingModule());

for (const component of [Tree, TreeTable] as const) {
  describe(component.name, () => {
    function setup(expanded: readonly string[] = []) {
      const fixture =
        component === Tree ? TestBed.createComponent(Tree) : TestBed.createComponent(TreeTable);
      fixture.componentRef.setInput('nodes', nodes);
      fixture.componentRef.setInput('label', 'Projects');
      fixture.componentRef.setInput('expanded', expanded);
      if (component === TreeTable)
        fixture.componentRef.setInput('columns', [
          { key: 'count', label: 'Count' },
          { key: 'unsafe', label: 'Value' },
        ]);
      fixture.detectChanges();
      return fixture;
    }
    const rows = (fixture: ReturnType<typeof setup>) =>
      [...fixture.nativeElement.querySelectorAll('[data-tree-id]')] as HTMLElement[];
    const key = (element: HTMLElement, key: string) =>
      element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

    it('renders only visible nodes with hierarchy metadata and a single tab stop', () => {
      const fixture = setup(['root', 'branch']);
      expect(rows(fixture).map((row) => row.dataset['treeId'])).toEqual([
        'root',
        'branch',
        'leaf',
        'disabled',
        'other',
        'docs',
      ]);
      expect(rows(fixture).filter((row) => row.tabIndex === 0)).toHaveLength(1);
      expect(rows(fixture)[2].getAttribute('aria-level')).toBe('3');
      expect(rows(fixture)[2].hasAttribute('aria-expanded')).toBe(false);
      expect(rows(fixture)[1].getAttribute('aria-posinset')).toBe('1');
      expect(rows(fixture)[1].getAttribute('aria-setsize')).toBe('3');
    });
    it('expands with the arrow without selecting, preserves descendant expansion on collapse', () => {
      const fixture = setup(['branch']);
      const selected = vi.fn();
      fixture.componentInstance.selected.subscribe(selected);
      rows(fixture)[0].querySelector('button')!.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.expanded()).toEqual(['branch', 'root']);
      expect(rows(fixture).some((row) => row.dataset['treeId'] === 'leaf')).toBe(true);
      expect(selected).not.toHaveBeenCalled();
      rows(fixture)[0].querySelector('button')!.click();
      fixture.detectChanges();
      expect(rows(fixture)).toHaveLength(2);
      expect(fixture.componentInstance.expanded()).toEqual(['branch']);
    });
    it('navigates visible rows, skips disabled nodes and selects only on Enter/Space or click', () => {
      const fixture = setup(['root', 'branch']);
      const list = rows(fixture);
      list[2].focus();
      key(list[2], 'ArrowDown');
      fixture.detectChanges();
      expect(document.activeElement).toBe(list[4]);
      expect(fixture.componentInstance.selected()).toBeNull();
      key(list[4], ' ');
      fixture.detectChanges();
      expect(fixture.componentInstance.selected()).toBe('other');
      key(list[4], 'Home');
      expect(document.activeElement).toBe(list[0]);
      key(list[0], 'End');
      expect(document.activeElement).toBe(list[5]);
      key(list[5], 'ArrowUp');
      expect(document.activeElement).toBe(list[4]);
      list[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selected()).toBe('leaf');
    });
    it('implements right/left expansion, child/parent navigation and type-ahead', () => {
      const fixture = setup();
      let list = rows(fixture);
      list[0].focus();
      key(list[0], 'ArrowRight');
      fixture.detectChanges();
      expect(fixture.componentInstance.expanded()).toEqual(['root']);
      list = rows(fixture);
      key(list[0], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement).toBe(list[1]);
      key(list[1], 'ArrowLeft');
      expect(document.activeElement).toBe(list[0]);
      key(list[0], 't');
      expect(document.activeElement).toBe(list[3]);
      key(list[3], 'Enter');
      fixture.detectChanges();
      expect(fixture.componentInstance.selected()).toBe('other');
      key(list[0], 'ArrowLeft');
      fixture.detectChanges();
      expect(fixture.componentInstance.expanded()).toEqual([]);
    });
    it('focuses a newly expanded child even before its row has rendered', async () => {
      const fixture = setup();
      const root = rows(fixture)[0];
      root.focus();
      key(root, 'ArrowRight');
      key(root, 'ArrowRight');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement?.getAttribute('data-tree-id')).toBe('branch');
    });
    it('disables nodes and their descendants, and supports disabling the complete control', () => {
      const fixture = setup(['root', 'disabled']);
      const list = rows(fixture);
      const disabled = list.find((row) => row.dataset['treeId'] === 'disabled')!;
      const child = list.find((row) => row.dataset['treeId'] === 'locked-child')!;
      expect(child.getAttribute('aria-disabled')).toBe('true');
      disabled.click();
      key(disabled, 'Enter');
      expect(fixture.componentInstance.selected()).toBeNull();
      expect((disabled.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      rows(fixture)[0].click();
      key(rows(fixture)[0], 'ArrowRight');
      expect(fixture.componentInstance.selected()).toBeNull();
      expect(rows(fixture).every((row) => row.tabIndex === -1)).toBe(true);
    });
    it('responds to replacement data, controlled selection and empty data', () => {
      const fixture = setup();
      fixture.componentRef.setInput('selected', 'docs');
      fixture.detectChanges();
      expect(rows(fixture)[1].getAttribute('aria-selected')).toBe('true');
      fixture.componentRef.setInput('nodes', [{ id: 'new"[id]', label: 'New' }]);
      fixture.detectChanges();
      rows(fixture)[0].click();
      expect(fixture.componentInstance.selected()).toBe('new"[id]');
      fixture.componentRef.setInput('nodes', []);
      fixture.detectChanges();
      expect(rows(fixture)).toHaveLength(0);
      expect(fixture.nativeElement.textContent).toContain('Keine Einträge');
    });
  });
}

describe('TreeTable columns', () => {
  it('uses real table headers, preserves zero values and escapes cell content', () => {
    const fixture = TestBed.createComponent(TreeTable);
    fixture.componentRef.setInput('label', 'Tree data');
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('expanded', ['root', 'branch']);
    fixture.componentRef.setInput('columns', [
      { key: 'count', label: 'Count' },
      { key: 'unsafe', label: 'Value' },
    ]);
    fixture.detectChanges();
    expect(
      [...fixture.nativeElement.querySelectorAll('th')].map((cell: any) => cell.textContent.trim()),
    ).toEqual(['Name', 'Count', 'Value']);
    const row = fixture.nativeElement.querySelector('[data-tree-id="leaf"]');
    expect(row.children[1].textContent.trim()).toBe('0');
    expect(row.children[2].textContent).toContain('<script>bad()</script>');
    expect(row.querySelector('script')).toBeNull();
    expect(fixture.nativeElement.querySelector('caption').textContent.trim()).toBe('Tree data');
  });
});

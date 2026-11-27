import { Component, computed, input, output } from '@angular/core';

export interface RadialMenuItem {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'ui-radial-menu',
  templateUrl: './radial-menu.html',
  styleUrl: './radial-menu.css',
})
export class RadialMenu {
  readonly items = input.required<readonly RadialMenuItem[]>();
  readonly activeId = input<string>();
  readonly subItems = input<readonly RadialMenuItem[]>([]);

  readonly itemSelected = output<RadialMenuItem>();
  readonly subItemSelected = output<RadialMenuItem>();
  readonly closed = output<void>();

  protected readonly innerStep = computed(() => 360 / Math.max(1, this.items().length));
  protected readonly outerStep = computed(() =>
    Math.min(45, 360 / Math.max(1, this.subItems().length)),
  );
  protected readonly activeIndex = computed(() =>
    this.items().findIndex((item) => item.id === this.activeId()),
  );
}

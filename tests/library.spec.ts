import { expect, test } from '@playwright/test';

test('all published stories render without Angular or browser errors', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const index = await (await request.get('/index.json')).json();
  const stories = Object.values(index.entries).filter((entry: any) => entry.type === 'story') as {
    id: string;
  }[];
  expect(stories.length).toBeGreaterThan(20);
  for (const story of stories) {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await expect(
      page
        .locator(
          '#storybook-root .ui-button, #storybook-root .ui-choice, #storybook-root .ui-radio, #storybook-root .ui-chip, #storybook-root .ui-card, #storybook-root .ui-tree, #storybook-root .ui-tree-table',
        )
        .first(),
    ).toBeVisible();
    await expect(page.locator('.sb-errordisplay')).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('themes and responsive size profiles change real computed styles', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto('/iframe.html?id=components-button--primary&viewMode=story');
  const button = page.getByRole('button', { name: 'Weiter' });
  await expect(button).toBeVisible();
  const initial = await button.evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    color: getComputedStyle(el).backgroundColor,
  }));
  expect(initial.height).toBe(48);
  await page.evaluate(() => document.body.classList.replace('ui-light', 'ui-dark'));
  await expect
    .poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(initial.color);
  await page.setViewportSize({ width: 375, height: 800 });
  expect(await button.evaluate((el) => el.getBoundingClientRect().height)).toBe(44);
  await page.evaluate(() => document.body.classList.add('ui-large'));
  expect(await button.evaluate((el) => el.getBoundingClientRect().height)).toBe(48);
  await page.evaluate(() => {
    document.body.classList.remove('ui-large');
    document.body.classList.add('ui-small');
  });
  await page.setViewportSize({ width: 1000, height: 800 });
  expect(await button.evaluate((el) => el.getBoundingClientRect().height)).toBe(44);
  await button.hover();
  await expect(button).toHaveCSS('border-top-color', 'rgb(255, 255, 255)');
  await page.mouse.down();
  expect(await button.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('inset');
  await page.mouse.up();
  await page.mouse.click(800, 700);
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'double');
});

test('checkbox, switch and radios respond in the browser', async ({ page }) => {
  await page.goto('/iframe.html?id=components-checkbox--default&viewMode=story');
  const checkbox = page.getByRole('checkbox', { name: 'Benachrichtigungen' });
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await page.goto('/iframe.html?id=components-switch--inactive&viewMode=story');
  const toggle = page.getByRole('switch', { name: 'Automatisch speichern' });
  await toggle.check();
  await expect(toggle).toBeChecked();
  await page.goto('/iframe.html?id=components-radio--selection&viewMode=story');
  await page.getByRole('radio', { name: 'Express' }).check();
  await expect(page.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
  await expect(page.getByText('Auswahl: express')).toBeVisible();
});

test('dropdown supports keyboard selection and split button actions are separate', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-dropdown--default&viewMode=story');
  const trigger = page.getByRole('button', { name: 'Aktionen', exact: true });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Bearbeiten' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Duplizieren' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).not.toBeVisible();
  await expect(page.getByText('Auswahl: copy')).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.goto('/iframe.html?id=components-option-button--default&viewMode=story');
  await page.getByRole('button', { name: 'Speichern', exact: true }).click();
  await expect(page.getByText('Gespeichert', { exact: true })).toBeVisible();
  await expect(page.getByRole('menu')).not.toBeVisible();
  await page.getByRole('button', { name: 'Speichern: Optionen' }).click();
  await page.getByRole('menuitem', { name: 'Als Entwurf speichern' }).click();
  await expect(page.getByText('draft', { exact: true })).toBeVisible();
});

test('Storybook toolbar switches the preview theme and size', async ({ page }) => {
  await page.goto('/?path=/story/foundations-overview--library');
  const preview = page.frameLocator('#storybook-preview-iframe');
  await expect(preview.getByRole('heading', { name: 'Klar. Grün. Gemeinsam.' })).toBeVisible();
  await page.getByRole('button', { name: 'Farbschema' }).click();
  await page.getByText('dark', { exact: true }).click();
  await expect(preview.locator('body')).toHaveClass(/ui-dark/);
  await page.getByRole('button', { name: 'Größenprofil' }).click();
  await page.getByText('small', { exact: true }).click();
  await expect(preview.locator('body')).toHaveClass(/ui-small/);
});

test('user documentation renders all guides, code examples and the shared README', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const index = await (await request.get('/index.json')).json();
  const guides = [
    ['Anwenderdoku/Start', 'Creaera UI verwenden', 'npm ci'],
    [
      'Anwenderdoku/Farben konfigurieren',
      'Farben zentral konfigurieren',
      '--ui-interaction-primary',
    ],
    ['Anwenderdoku/Light und Dark Mode', 'Light und Dark Mode', "setTheme('dark')"],
    ['Anwenderdoku/Responsive Größen', 'Responsive Größen', '--ui-button-height'],
    ['Anwenderdoku/Komponenten verwenden', 'Komponenten verwenden', 'ReactiveFormsModule'],
    ['Anwenderdoku/Trees', 'Tree und Tree Table', 'UiTreeNode'],
    ['Anwenderdoku/API und Projektaufbau', 'Creaera UI', 'Kleine öffentliche API'],
  ];
  for (const [title, heading, example] of guides) {
    const entry = Object.values(index.entries).find(
      (entry: any) => entry.type === 'docs' && entry.title === title,
    ) as { id: string } | undefined;
    expect(entry, `${title} must appear in Storybook navigation`).toBeDefined();
    await page.goto(`/?path=/docs/${entry!.id}`);
    const preview = page.frameLocator('#storybook-preview-iframe');
    await expect(preview.getByRole('heading', { name: heading })).toBeVisible();
    await expect(preview.locator('.sbdocs-content')).toContainText(example);
    await expect(preview.locator('.sbdocs-content pre').first()).toBeVisible();
    await expect(preview.locator('.sb-errordisplay')).not.toBeVisible();
    if (title.endsWith('Farben konfigurieren')) {
      await expect(preview.getByRole('table').first()).toContainText('--ui-status-dangerous');
    }
    if (title.endsWith('Responsive Größen')) {
      await expect(preview.getByRole('table').nth(1)).toContainText('--ui-control-size');
    }
    if (title.endsWith('API und Projektaufbau')) {
      await expect(preview.locator('.sbdocs-content')).toContainText('OptionButton');
      await expect(preview.locator('.sbdocs-content')).toContainText('Bedienung und Annahmen');
    }
  }
  expect(errors).toEqual([]);
});

test('chips remove by keyboard and disabled chips remain inert', async ({ page }) => {
  await page.goto('/iframe.html?id=components-chip--default&viewMode=story');
  const close = page.getByRole('button', { name: 'Entfernen: Designsystem' });
  await close.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Chip entfernt.')).toBeVisible();
  await expect(page.locator('ui-chip')).toHaveCount(0);
  await page.goto('/iframe.html?id=components-chip--disabled&viewMode=story');
  await expect(page.getByRole('button', { name: 'Entfernen: Designsystem' })).toBeDisabled();
});

test('cards toggle by keyboard, nest independently and keep their white surface', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-card--collapsible&viewMode=story');
  const card = page.locator('ui-card');
  const toggle = card.locator('.ui-card-toggle');
  await expect(toggle).toHaveAccessibleName('Projektdetails ausklappen');
  await expect(card.locator('.ui-card-content')).toBeHidden();
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(card.locator('.ui-card-content')).toBeVisible();
  await expect(card.locator('.ui-card-surface')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  const layers = await card.evaluate((el) =>
    ['::before', '::after'].map((p) => getComputedStyle(el, p).content),
  );
  expect(layers).toEqual(['""', '""']);
  await page.evaluate(() => {
    document.body.classList.remove('ui-light');
    document.body.classList.add('ui-dark');
  });
  await expect(card.locator('.ui-card-surface')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(card.getByText('Benachrichtigungen erhalten')).toHaveCSS('color', 'rgb(24, 60, 42)');
  await page.goto('/iframe.html?id=components-card--nested&viewMode=story');
  await page.getByRole('button', { name: 'Weitere Details ausklappen' }).click();
  await expect(page.getByRole('button', { name: 'Projektübersicht einklappen' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Bearbeiten' })).toBeVisible();
  await page.getByRole('button', { name: 'Projektübersicht einklappen' }).click();
  await expect(page.getByRole('button', { name: 'Bearbeiten' })).toBeHidden();
  await page.getByRole('button', { name: 'Projektübersicht ausklappen' }).click();
  await expect(page.getByRole('button', { name: 'Bearbeiten' })).toBeVisible();
});

test('secondary buttons and card borders use neutral gray tokens', async ({ page }) => {
  await page.goto('/iframe.html?id=components-button--secondary&viewMode=story');
  await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCSS(
    'background-color',
    'rgb(82, 82, 91)',
  );
  const secondary = page.getByRole('button', { name: 'Weiter' });
  await secondary.hover();
  await expect(secondary).toHaveCSS('background-color', 'rgb(70, 70, 79)');
  await page.mouse.down();
  await expect(secondary).toHaveCSS('background-color', 'rgb(63, 63, 70)');
  await page.mouse.up();
  await page.goto('/iframe.html?id=components-card--secondary&viewMode=story');
  await expect(page.locator('.ui-card-surface')).toHaveCSS('border-top-color', 'rgb(82, 82, 91)');
});

for (const kind of ['tree', 'tree-table']) {
  test(`${kind}: expands, selects and navigates the hierarchy with keyboard and mouse`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=components-${kind}--collapsed&viewMode=story`);
    const control = page.locator(`ui-${kind}`);
    const root = control.locator('[data-tree-id="design"]');
    await expect(control.locator('[data-tree-id]')).toHaveCount(2);
    await root.focus();
    await page.keyboard.press('ArrowRight');
    await expect(root).toHaveAttribute('aria-expanded', 'true');
    await expect(control.locator('[data-tree-id]')).toHaveCount(5);
    await page.keyboard.press('ArrowRight');
    const components = control.locator('[data-tree-id="components"]');
    await expect(components).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const buttons = control.locator('[data-tree-id="buttons"]');
    await expect(buttons).toBeFocused();
    await expect(buttons).toHaveAttribute('aria-level', '3');
    await expect(buttons).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('Space');
    await expect(buttons).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Auswahl: buttons')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(components).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(components).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowDown');
    await expect(control.locator('[data-tree-id="tokens"]')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(control.locator('[data-tree-id="documentation"]')).toBeFocused();
    await page.keyboard.press('Home');
    await expect(root).toBeFocused();
    await root.getByRole('button', { name: 'Designsystem einklappen' }).click();
    await expect(control.locator('[data-tree-id]')).toHaveCount(2);
    await control.locator('[data-tree-id="documentation"]').click();
    await expect(page.getByText('Auswahl: documentation')).toBeVisible();
    await page.goto(`/iframe.html?id=components-${kind}--disabled&viewMode=story`);
    await expect(page.locator(`ui-${kind} [data-tree-id][tabindex="0"]`)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Designsystem einklappen' })).toBeDisabled();
  });
}

test('tree table exposes column headings and keeps data aligned at narrow widths and in Dark Mode', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/iframe.html?id=components-tree-table--default&viewMode=story');
  const table = page.getByRole('treegrid', { name: 'Projekte und Zuständigkeiten' });
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader')).toHaveText(['Name', 'Verantwortlich', 'Status']);
  const buttons = table.locator('[data-tree-id="buttons"]');
  await expect(buttons.getByRole('gridcell')).toHaveText(['Buttons', 'Lea', 'Fertig']);
  const before = await table.evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.evaluate(() => {
    document.body.classList.remove('ui-light');
    document.body.classList.add('ui-dark');
  });
  await expect
    .poll(() => table.evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(before);
  await expect(table.locator('[data-tree-id="archive"]')).toHaveAttribute('aria-disabled', 'true');
  await table.locator('[data-tree-id="documentation"]').click();
  await expect(table.locator('[data-tree-id="documentation"]')).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('architecture guide renders its nine chapters with compiled source examples', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const index = await (await request.get('/index.json')).json();
  const chapters = [
    ['Architektur/Start', 'Moderne Angular-Architektur', '22.0.1'],
    ['Architektur/Module und Nx', 'Module und Nx', 'loadComponent'],
    [
      'Architektur/Komponenten anlegen und CLI',
      'Komponenten anlegen und wichtige CLI-Befehle',
      '--dry-run',
    ],
    ['Architektur/Komponenten und APIs', 'Komponenten und ihre APIs', 'publishRequested'],
    ['Architektur/State und Signal Store', 'State und NgRx Signal Store', 'setAllEntities'],
    ['Architektur/HTTP und CRUD', 'HTTP und CRUD-APIs', 'Idempotency-Key'],
    ['Architektur/Aktionen und Nebenläufigkeit', 'Aktionen und Nebenläufigkeit', '202 Accepted'],
    ['Architektur/Server-Suche', 'Server-Suche und Autocomplete', 'Debounce'],
    [
      'Architektur/Tests und Weiterentwicklung',
      'Tests und schrittweise Weiterentwicklung',
      'test:architecture',
    ],
  ];
  for (const [title, heading, content] of chapters) {
    const entry = Object.values(index.entries).find(
      (entry: any) => entry.type === 'docs' && entry.title === title,
    ) as { id: string } | undefined;
    expect(entry, title).toBeDefined();
    await page.goto(`/?path=/docs/${entry!.id}`);
    const preview = page.frameLocator('#storybook-preview-iframe');
    await expect(preview.getByRole('heading', { name: heading })).toBeVisible();
    await expect(preview.locator('.sbdocs-content')).toContainText(content);
    await expect(preview.locator('.sbdocs-content pre').first()).toBeVisible();
    await expect(preview.locator('.sb-errordisplay')).not.toBeVisible();
    if (title === 'Architektur/State und Signal Store') {
      await expect(preview.locator('.sbdocs-content pre.prismjs')).toHaveCount(2);
      await expect(preview.locator('.sbdocs-content')).toContainText('completedCreates');
    }
    if (title === 'Architektur/HTTP und CRUD') {
      await expect(preview.getByRole('table').first()).toContainText('PATCH');
      await expect(preview.locator('.sbdocs-content')).toContainText('toUserError');
    }
  }
  expect(errors).toEqual([]);
});

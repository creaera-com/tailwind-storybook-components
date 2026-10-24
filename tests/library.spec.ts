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
          '#storybook-root .ui-button, #storybook-root .ui-choice, #storybook-root .ui-radio, #storybook-root .ui-chip, #storybook-root .ui-card, #storybook-root .ui-form-field',
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
    ['Anwenderdoku/Formularfelder', 'Formularfelder', 'ReactiveFormsModule'],
    ['Anwenderdoku/Autocomplete', 'Autocomplete', 'ReactiveFormsModule'],
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

test('form inputs have a small label above, primary borders and accessible error descriptions', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-form-field--text&viewMode=story');
  const input = page.getByRole('textbox', { name: 'Name', exact: true });
  const label = page.locator('.ui-field-label');
  await expect(input).toHaveCSS('border-top-color', 'rgb(20, 108, 67)');
  await expect(label).toHaveCSS('font-size', '12px');
  const inputBox = await input.boundingBox();
  const labelBox = await label.boundingBox();
  expect(labelBox!.y + labelBox!.height).toBeLessThan(inputBox!.y);
  expect(labelBox!.x).toBe(inputBox!.x);
  await label.click();
  await expect(input).toBeFocused();
  await page.goto('/iframe.html?id=components-form-field--error&viewMode=story');
  const errorInput = page.getByRole('textbox', { name: 'Name', exact: true });
  await expect(errorInput).toHaveCSS('border-top-color', 'rgb(180, 35, 53)');
  await expect(errorInput).toHaveAttribute('aria-invalid', 'true');
  await expect(errorInput).toHaveAccessibleDescription('Bitte einen gültigen Namen eingeben.');
  await errorInput.focus();
  await expect(errorInput).toHaveCSS('outline-color', 'rgb(180, 35, 53)');
  await page.evaluate(() => {
    document.body.classList.remove('ui-light');
    document.body.classList.add('ui-dark');
  });
  await expect(errorInput).toHaveCSS('border-top-color', 'rgb(255, 154, 165)');
});

test('reactive form validates on submit and clears errors when values become valid', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-form-field--reactive-form&viewMode=story');
  const name = page.getByRole('textbox', { name: 'Name', exact: true });
  const email = page.getByRole('textbox', { name: 'E-Mail', exact: true });
  const message = page.getByRole('textbox', { name: 'Nachricht', exact: true });
  await expect(page.locator('.ui-field-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Absenden' }).click();
  await expect(page.locator('.ui-field-error')).toHaveCount(3);
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await name.fill('Lea');
  await email.fill('ungültig');
  await message.fill('Eine Nachricht.');
  await expect(page.locator('.ui-field-error')).toHaveCount(1);
  await email.fill('lea@example.com');
  await expect(page.locator('.ui-field-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Absenden' }).click();
  await expect(page.getByRole('status')).toContainText('Formular gültig.');
});

test('input types, multiline content, readonly, disabled and responsive sizes remain native', async ({
  page,
}) => {
  for (const [story, type] of [
    ['email', 'email'],
    ['password', 'password'],
    ['number', 'number'],
    ['date', 'date'],
  ]) {
    await page.goto(`/iframe.html?id=components-form-field--${story}&viewMode=story`);
    await expect(page.locator('input.ui-input')).toHaveAttribute('type', type);
  }
  await page.goto('/iframe.html?id=components-form-field--textarea&viewMode=story');
  const textarea = page.getByRole('textbox', { name: 'Nachricht' });
  await textarea.fill('Erste Zeile\nZweite Zeile');
  await expect(textarea).toHaveValue('Erste Zeile\nZweite Zeile');
  await page.goto('/iframe.html?id=components-form-field--disabled&viewMode=story');
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeDisabled();
  await page.goto('/iframe.html?id=components-form-field--readonly&viewMode=story');
  await expect(page.getByRole('textbox', { name: 'Referenz' })).toHaveAttribute('readonly', '');
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/iframe.html?id=components-form-field--text&viewMode=story');
  const input = page.getByRole('textbox', { name: 'Name' });
  await expect(input).toHaveCSS('min-height', '44px');
  await page.evaluate(() => document.body.classList.add('ui-large'));
  await expect(input).toHaveCSS('min-height', '48px');
});

test('autocomplete filters, selects by keyboard and retains focus on its combobox', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-autocomplete--default&viewMode=story');
  const input = page.getByRole('combobox', { name: 'Stadt' });
  await input.fill('ber');
  await expect(page.getByRole('option')).toHaveText(['Berlin', 'Bern']);
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('ArrowDown');
  await expect(page.getByRole('option', { name: 'Berlin', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue('Bern');
  await expect(input).toBeFocused();
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await expect(page.getByText('Eingabe: Bern')).toBeVisible();
  await input.fill('Mün');
  await page.getByRole('option', { name: 'München' }).click();
  await expect(input).toHaveValue('München');
  await expect(input).toBeFocused();
  await expect(page.getByRole('listbox')).not.toBeVisible();
});

test('autocomplete handles empty results, Escape, Tab and required form validation', async ({
  page,
}) => {
  await page.goto('/iframe.html?id=components-autocomplete--default&viewMode=story');
  const input = page.getByRole('combobox', { name: 'Stadt' });
  await input.fill('Leipzig');
  await expect(page.getByRole('status')).toHaveText('Keine Vorschläge gefunden.');
  await input.press('Escape');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await expect(input).toHaveValue('Leipzig');
  await input.fill('Ber');
  await input.press('Tab');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await page.goto('/iframe.html?id=components-autocomplete--reactive-form&viewMode=story');
  const formInput = page.getByRole('combobox', { name: 'Stadt' });
  await page.getByRole('button', { name: 'Übernehmen' }).click();
  await expect(formInput).toHaveAttribute('aria-invalid', 'true');
  await expect(formInput).toHaveAccessibleDescription('Bitte Eingabe prüfen.');
  await formInput.fill('Ber');
  await formInput.press('ArrowDown');
  await formInput.press('Enter');
  await expect(formInput).toHaveValue('Berlin');
  await page.getByRole('button', { name: 'Übernehmen' }).click();
  await expect(page.getByRole('status')).toHaveText('Ausgewählte Eingabe: Berlin');
});

test('autocomplete supports disabled, error and Dark Mode states', async ({ page }) => {
  await page.goto('/iframe.html?id=components-autocomplete--disabled&viewMode=story');
  await expect(page.getByRole('combobox', { name: 'Stadt' })).toBeDisabled();
  await page.goto('/iframe.html?id=components-autocomplete--error&viewMode=story');
  const input = page.getByRole('combobox', { name: 'Stadt' });
  await expect(input).toHaveCSS('border-top-color', 'rgb(180, 35, 53)');
  await page.evaluate(() => {
    document.body.classList.remove('ui-light');
    document.body.classList.add('ui-dark');
  });
  await expect(input).toHaveCSS('border-top-color', 'rgb(255, 154, 165)');
  await input.fill('Ber');
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.locator('.ui-autocomplete-popup')).toHaveCSS(
    'background-color',
    'rgb(26, 44, 33)',
  );
});

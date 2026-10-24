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
          '#storybook-root .ui-button, #storybook-root .ui-choice, #storybook-root .ui-radio, #storybook-root .ui-chip',
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

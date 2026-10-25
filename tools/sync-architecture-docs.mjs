import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = resolve(root, 'libs/storybook/docs/architecture');
const examples = resolve(root, 'libs/storybook/examples/architecture');
const check = process.argv.includes('--check');
let stale = false;
for (const name of await readdir(directory)) {
  if (!name.endsWith('.md')) continue;
  const path = resolve(directory, name);
  const original = await readFile(path, 'utf8');
  const pattern = /<!-- example: ([\w.-]+\.ts) -->[\s\S]*?<!-- \/example -->/g;
  let updated = original;
  for (const match of original.matchAll(pattern)) {
    const code = (await readFile(resolve(examples, match[1]), 'utf8')).trimEnd();
    updated = updated.replace(
      match[0],
      `<!-- example: ${match[1]} -->\n\n\`\`\`ts\n${code}\n\`\`\`\n\n<!-- /example -->`,
    );
  }
  if (updated !== original) {
    if (check) {
      console.error(`Outdated example in ${name}; run npm run docs:architecture:sync`);
      stale = true;
    } else await writeFile(path, updated);
  }
}
if (stale) process.exitCode = 1;

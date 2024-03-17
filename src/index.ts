import { program } from 'commander';

import { renameOpenMoji, getPackageVersion } from './utils.js';

try {
  const description =
    'Performs a "sparse" (i.e. partial) clone of a Git repository.';
  const version = await getPackageVersion();

  await program
    .version(version)
    .description(description)
    .argument(
      '<icon-dir>',
      'Path to the directory containing OpenMoji files to rename'
    )
    .argument('<format>', 'One of "svg" or "png"')
    .action(renameOpenMoji)
    .parseAsync();
} catch (error) {
  console.error(error);
  process.exit(1);
}

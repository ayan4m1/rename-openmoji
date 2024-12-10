import { async as fastGlob } from 'fast-glob';
import { existsSync } from 'fs';
import { readFile as readJsonFile } from 'jsonfile';
import ProgressBar from 'progress';
import { fileURLToPath } from 'url';
import { readFile, rename } from 'fs/promises';
import { basename, dirname, join, resolve } from 'path/posix';

enum FileFormats {
  Png = 'PNG',
  Svg = 'SVG'
}

const getInstallDirectory = (): string =>
  dirname(fileURLToPath(import.meta.url));

const getPackageJsonPath = (): string =>
  resolve(getInstallDirectory(), 'package.json');

export const getPackageVersion = async (): Promise<string> =>
  JSON.parse(await readFile(getPackageJsonPath(), 'utf-8'))?.version;

export async function renameOpenMoji(
  iconDir: string,
  format: FileFormats
): Promise<void> {
  try {
    if (!iconDir || !existsSync(iconDir)) {
      throw new Error('Invalid path supplied!');
    }

    const data = await readJsonFile(
      join(getInstallDirectory(), 'data', 'openmoji.json')
    );

    if (!Array.isArray(data) || !data.length) {
      throw new Error('Static OpenMoji JSON could not be loaded!');
    }

    console.log(`Loaded ${data.length} symbols from OpenMoji JSON...`);

    const files = await fastGlob(join(iconDir, `*.${format.toLowerCase()}`));

    console.log(`Found ${files.length} OpenMoji images to rename...`);

    const bar = new ProgressBar(':bar', {
      total: files.length,
      complete: '*',
      incomplete: '_'
    });

    for (const file of files) {
      try {
        const codePoint = basename(file, `.${format}`);
        const emoji = data.find((moji) => moji.hexcode === codePoint);

        if (!emoji) {
          throw new Error(`Did not find emoji with code point ${codePoint}!`);
        }

        const { annotation } = emoji;

        const slug = annotation
          .toLowerCase()
          .replace(/</g, 'lt')
          .replace(/>/g, 'gt')
          .replace(/"/g, 'quote')
          .replace(/\//g, 'slash')
          .replace(/\\/g, 'backslash')
          .replace(/\|/g, 'pipe')
          .replace(/\?/g, 'question-mark')
          .replace(/#/g, 'pound')
          .replace(/\$/g, 'dollar-sign')
          .replace(/\^/g, 'caret')
          .replace(/\*/g, 'asterisk')
          .replace(/:/g, '')
          .replace(/[^\w\d\s]+/g, '')
          .replace(/\s+/g, '_');
        const newPath = join(iconDir, `${slug}.${format}`);

        if (existsSync(newPath)) {
          throw new Error(`Asked to overwrite ${annotation}!`);
        }

        rename(file, newPath);
      } finally {
        bar.tick();
      }
    }

    console.log('Complete!');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

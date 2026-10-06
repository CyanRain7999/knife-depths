import { mkdir, writeFile } from 'node:fs/promises';
import { CHARACTER_STYLES, characterSVG } from '../src/chibi.ts';
await mkdir(new URL('../public/characters/',import.meta.url),{recursive:true});
for(const id of Object.keys(CHARACTER_STYLES))await writeFile(new URL(`../public/characters/${id}.svg`,import.meta.url),characterSVG(id));
console.log('Exported 12 original chibi characters.');

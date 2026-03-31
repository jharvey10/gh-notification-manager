import { build } from 'esbuild'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

await build({
  entryPoints: ['src/main/index.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/main/main.mjs',
  external: ['electron'],
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
  }
})

await build({
  entryPoints: ['src/preload/index.cjs'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/preload/index.cjs',
  external: ['electron']
})

mkdirSync('dist/main/assets', { recursive: true })
cpSync('assets/app-icon.png', 'dist/main/assets/app-icon.png')

writeFileSync('dist/version.json', JSON.stringify({ version: pkg.version }))

console.log(`Bundled main + preload for v${pkg.version}`)

import AdmZip from 'adm-zip'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
const outDir = 'release'
const outPath = join(outDir, `payload-${pkg.version}.zip`)

mkdirSync(outDir, { recursive: true })

const zip = new AdmZip()
zip.addLocalFolder('dist')
zip.writeZip(outPath)

console.log(`Created ${outPath}`)

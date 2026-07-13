import { execSync } from 'child_process'
import { copyFileSync, rmSync, mkdirSync, readdirSync, statSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))
const dist = resolve(root, 'app/dist')

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const s = join(src, entry), d = join(dest, entry)
    statSync(s).isDirectory() ? copyDir(s, d) : copyFileSync(s, d)
  }
}

console.log('Building...')
execSync('npm run build', { cwd: resolve(root, 'app'), stdio: 'inherit' })

console.log('Copying assets...')
rmSync(resolve(root, 'assets'), { recursive: true, force: true })
copyDir(resolve(dist, 'assets'), resolve(root, 'assets'))

console.log('Copying index.html...')
copyFileSync(resolve(dist, 'index.html'), resolve(root, 'index.html'))

console.log('Done.')

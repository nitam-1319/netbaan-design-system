#!/usr/bin/env node
/**
 * Screen-reader copy must be SUPPLIABLE, never a hardcoded literal.
 *
 * Text inside `sr-only` / `VisuallyHidden` is announced and never painted, so a
 * hardcoded English string in it is invisible to anyone reviewing the screen —
 * including a translator, including a designer signing the page off. It reaches
 * a Persian user as English and nothing on the page reveals why.
 *
 * The consuming product's page audit found this in Stepper, PasswordStrengthMeter,
 * FieldLabel and Lightbox: four components whose visible copy was fully
 * translatable and whose announced copy could not be reached at all.
 *
 * The rule is the one `Pagination` and `DataTable` already follow: the library
 * ships English DEFAULTS and accepts supplied strings, so it stays translatable
 * without taking a locale dependency. A default reached through `??` or a
 * parameter default is fine; a literal with no way past it is not.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'src/components/ui'
const files = readdirSync(DIR).filter(
  (f) => f.endsWith('.tsx') && !f.includes('.stories.') && !f.includes('.test.')
)

/** A literal that is plainly prose rather than a class name or a token. */
const PROSE = /^[A-Za-z][A-Za-z'’,.()\- ]{3,60}$/
/** kebab-case with no spaces is a class name, not a sentence. */
const CLASSNAME = /^[a-z0-9]+(?:-[a-z0-9]+)+$/
const NOT_PROSE = new Set([
  'span', 'div', 'button', 'true', 'false', 'polite', 'assertive', 'none',
  'className', 'data-slot', 'style', 'img', 'presentation', 'status',
])

const offenders = []

for (const file of files) {
  const src = readFileSync(join(DIR, file), 'utf8')
  // Each sr-only / VisuallyHidden region, up to the element that closes it.
  const regions = src.matchAll(
    /(?:className="[^"]*\bsr-only\b[^"]*"|<VisuallyHidden\b)([\s\S]{0,400}?)(?:<\/span>|<\/VisuallyHidden>)/g
  )
  for (const region of regions) {
    const body = region[1]
    // NO newline inside the literal. Allowing one makes the regex pair the
    // CLOSING quote of one string with the OPENING quote of the next, so the
    // real strings are never seen — the first version of this check passed
    // happily with the bug it was written to catch still in the file.
    for (const m of body.matchAll(/"([^"\\\n]{3,60})"/g)) {
      const lit = m[1].trim().replace(/^\(|\)$/g, '')
      if (!PROSE.test(lit) || CLASSNAME.test(lit) || NOT_PROSE.has(lit)) continue
      const before = body.slice(Math.max(0, m.index - 24), m.index)
      // A comparison operand is a code value, not announced copy.
      if (/[=!]==\s*$/.test(before)) continue
      // Reachable default: `foo ?? "text"` or `foo = "text"`. Anything else is
      // a literal the caller cannot replace.
      if (/\?\?\s*$|[^=!]=\s*$/.test(before)) continue
      offenders.push({ file, text: lit })
    }

    // The other spelling: bare JSX TEXT rather than a string literal, e.g.
    // `<span className="sr-only"> (required)</span>`. Strip the expressions and
    // whatever prose is left is copy nobody can replace.
    let text = body.replace(/^>/, '')
    let prev
    do {
      prev = text
      text = text.replace(/\{[^{}]*\}/g, ' ')
    } while (text !== prev)
    text = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const bare = text.replace(/^\(|\)$/g, '').trim()
    if (bare && PROSE.test(bare) && !CLASSNAME.test(bare) && !NOT_PROSE.has(bare)) {
      offenders.push({ file, text: bare })
    }
  }
}

console.log('Screen-reader copy check (announced text must be suppliable):\n')
if (offenders.length === 0) {
  console.log(`  Scanned ${files.length} component(s); no hardcoded announced copy.`)
} else {
  for (const o of offenders) console.log(`  ${o.file}: "${o.text}"`)
  console.log(
    `\n  ${offenders.length} hardcoded string(s) in screen-reader-only text.` +
      '\n  Add a prop with an English default, as Pagination and DataTable do.'
  )
  process.exitCode = 1
}

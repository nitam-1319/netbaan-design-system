// story-resolve.mjs — shared component-name → Storybook-story resolver.
//
// WHY: story ids are derived from the story `title`, which is authored freely.
// Single-token PascalCase titles ("Components/ChartContainer") flatten to
// `components-chartcontainer--*`, while the component's file is `chart-container`.
// A naive `id.startsWith("components-<name>--")` therefore MISSES every such
// component (measured: 117 / 207 unreachable). Resolving by the *kebab-cased last
// segment of the title* matches "ChartContainer", "Chart Container", and
// "File Card" all back to their kebab filenames — lifting coverage to ~97%.

/** Kebab-case a Storybook title segment: "ChartContainer"/"Chart Container"/"CVEChip" → "chart-container"/"cve-chip". */
export function kebab(s) {
  return String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camelCase boundary: fooBar → foo-Bar
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2") // acronym boundary: CVEChip → CVE-Chip
    .replace(/[\s_]+/g, "-") // spaces / underscores → hyphen
    .replace(/-+/g, "-")
    .toLowerCase()
}

/** The kebab component key for a story entry, derived from the last title segment. */
export function componentKeyOf(entry) {
  const last = String(entry.title || "").split("/").pop() || ""
  return kebab(last)
}

/**
 * Stories belonging to component `name` (kebab). Matches on EITHER the legacy id
 * prefix OR the kebab-cased title segment, so both naming conventions resolve.
 */
export function resolveStories(entries, name) {
  if (name === "*") return entries
  const key = kebab(name)
  return entries.filter(
    (e) =>
      e.id.startsWith(`components-${name}--`) || componentKeyOf(e) === key
  )
}

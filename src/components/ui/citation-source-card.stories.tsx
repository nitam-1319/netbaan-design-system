import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { CitationSourceCard } from "@/components/ui/citation-source-card"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/CitationSourceCard",
  component: CitationSourceCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    index: { control: { type: "number" } },
    href: { control: "text" },
  },
  args: {
    index: 1,
    title: "Supply-chain backdoor discovered in xz-utils (CVE-2024-3094)",
    source: "nvd.nist.gov",
    href: "https://nvd.nist.gov/vuln/detail/CVE-2024-3094",
    snippet:
      "Malicious code was inserted into the upstream tarballs of xz starting with version 5.6.0, enabling remote code execution under specific conditions.",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CitationSourceCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole("link", { name: /xz-utils/i })
    await expect(link).toHaveAttribute(
      "href",
      "https://nvd.nist.gov/vuln/detail/CVE-2024-3094"
    )
    const root = link.closest("[data-slot=citation-source-card]")
    await expect(root).toHaveAttribute("data-interactive", "true")
  },
}

export const NonInteractive: Story = {
  args: { href: undefined },
}

export const WithoutSnippet: Story = {
  args: { snippet: undefined },
}

export const WithGlyph: Story = {
  args: { index: undefined },
}

export const List: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <CitationSourceCard
        index={1}
        title="OWASP Top 10 — Broken Access Control"
        source="owasp.org"
        href="https://owasp.org"
        snippet="Access control enforces policy such that users cannot act outside of their intended permissions."
      />
      <CitationSourceCard
        index={2}
        title="MITRE ATT&CK — Valid Accounts (T1078)"
        source="attack.mitre.org"
        href="https://attack.mitre.org"
        snippet="Adversaries may obtain and abuse credentials of existing accounts as a means of gaining access."
      />
    </div>
  ),
}

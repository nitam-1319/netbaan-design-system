import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { CodeBlock } from "@/components/ui/code-block"

/**
 * Theme (Light/Dark) and direction (English-LTR / Persian-RTL) come from the
 * global Storybook toolbar — stories never hard-code a `.dark` wrapper.
 */
const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    showLineNumbers: { control: "boolean" },
    wrap: { control: "boolean" },
    showCopy: { control: "boolean" },
    language: { control: "text" },
    filename: { control: "text" },
  },
  args: {
    code: `import { Button } from "@/components/ui/button"

export function Demo() {
  return <Button variant="default">Run scan</Button>
}`,
    language: "tsx",
    showCopy: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Run scan/)).toBeInTheDocument()
    // The copy affordance is present and labelled for assistive tech.
    await expect(canvas.getByRole("button", { name: "Copy code" })).toBeInTheDocument()
  },
}

export const WithFilename: Story = {
  args: {
    filename: "demo.tsx",
    language: "tsx",
  },
}

export const LineNumbers: Story = {
  args: {
    filename: "scan.ts",
    language: "ts",
    showLineNumbers: true,
    code: `async function scan(target: string) {
  const res = await fetch(\`/api/scan?t=\${target}\`)
  if (!res.ok) throw new Error("scan failed")
  return res.json()
}`,
  },
}

export const Shell: Story = {
  args: {
    language: "bash",
    filename: undefined,
    code: `npm ci
npm run build
npx tsc --noEmit`,
  },
}

export const SoftWrap: Story = {
  args: {
    filename: "note.txt",
    wrap: true,
    code: "This is a single very long line of prose that would otherwise scroll horizontally forever, but with wrap enabled it folds onto multiple visual lines within the block width.",
  },
}

export const NoHeaderNoCopy: Story = {
  args: {
    filename: undefined,
    language: undefined,
    showCopy: false,
    code: `const answer = 42`,
  },
}

export const Small: Story = {
  args: {
    size: "sm",
    filename: "config.json",
    language: "json",
    showLineNumbers: true,
    code: `{
  "strict": true,
  "target": "ES2022"
}`,
  },
}

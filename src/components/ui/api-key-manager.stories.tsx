import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"

import { ApiKeyManager } from "@/components/ui/api-key-manager"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/ApiKeyManager",
  component: ApiKeyManager,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    revealable: { control: "boolean" },
    onRevoke: { action: "revoke" },
  },
  args: {
    onRevoke: fn(),
    revealable: true,
    keys: [
      {
        id: "k1",
        name: "Production",
        value: "sk_live_a1b2c3d4e5f6g7h8i9j0",
        prefix: "sk_live_a1b2",
        scopes: ["read", "write"],
        created: "Created Apr 2",
        lastUsed: "Last used 2h ago",
      },
      {
        id: "k2",
        name: "CI pipeline",
        value: "sk_ci_z9y8x7w6v5u4t3s2r1q0",
        prefix: "sk_ci_z9y8",
        scopes: ["read"],
        created: "Created Mar 18",
        lastUsed: "Last used 5m ago",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 620 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ApiKeyManager>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // Masked by default.
    await expect(canvas.getByText(/sk_live_a1b2•+/)).toBeInTheDocument()
    // Reveal shows the full secret.
    await userEvent.click(canvas.getByRole("button", { name: /reveal production/i }))
    await expect(
      canvas.getByText("sk_live_a1b2c3d4e5f6g7h8i9j0")
    ).toBeInTheDocument()
    // Revoke fires with the key id.
    await userEvent.click(canvas.getByRole("button", { name: /revoke ci pipeline/i }))
    await expect(args.onRevoke).toHaveBeenCalledWith("k2")
  },
}

export const NotRevealable: Story = {
  args: { revealable: false },
}

export const Empty: Story = {
  args: { keys: [] },
}

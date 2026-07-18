import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Activity, ShieldAlert, Globe } from "lucide-react"

import {
  Tabs,
  TabsList,
  TabsTab,
  TabsIndicator,
  TabsPanel,
} from "@/components/ui/tabs"

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="dark bg-background w-[28rem] p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsIndicator />
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="findings">Findings</TabsTab>
        <TabsTab value="assets">Assets</TabsTab>
      </TabsList>
      <TabsPanel value="overview" className="pt-4 text-sm text-muted-foreground">
        Posture summary and headline metrics.
      </TabsPanel>
      <TabsPanel value="findings" className="pt-4 text-sm text-muted-foreground">
        Ranked vulnerabilities by exploitability.
      </TabsPanel>
      <TabsPanel value="assets" className="pt-4 text-sm text-muted-foreground">
        Discovered hosts and services.
      </TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Posture summary/)).toBeVisible()
    await userEvent.click(canvas.getByRole("tab", { name: "Findings" }))
    await expect(canvas.getByText(/Ranked vulnerabilities/)).toBeVisible()
  },
}

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="activity">
      <TabsList>
        <TabsIndicator />
        <TabsTab value="activity">
          <Activity /> Activity
        </TabsTab>
        <TabsTab value="risks">
          <ShieldAlert /> Risks
        </TabsTab>
        <TabsTab value="surface">
          <Globe /> Surface
        </TabsTab>
      </TabsList>
      <TabsPanel value="activity" className="pt-4 text-sm text-muted-foreground">
        Recent scans and changes.
      </TabsPanel>
      <TabsPanel value="risks" className="pt-4 text-sm text-muted-foreground">
        Open risks needing action.
      </TabsPanel>
      <TabsPanel value="surface" className="pt-4 text-sm text-muted-foreground">
        Exposed attack surface.
      </TabsPanel>
    </Tabs>
  ),
}

export const KeyboardNav: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsIndicator />
        <TabsTab value="a">First</TabsTab>
        <TabsTab value="b">Second</TabsTab>
        <TabsTab value="c">Third</TabsTab>
      </TabsList>
      <TabsPanel value="a" className="pt-4 text-sm text-muted-foreground">
        First panel.
      </TabsPanel>
      <TabsPanel value="b" className="pt-4 text-sm text-muted-foreground">
        Second panel.
      </TabsPanel>
      <TabsPanel value="c" className="pt-4 text-sm text-muted-foreground">
        Third panel.
      </TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole("tab", { name: "First" })
    first.focus()
    await expect(first).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("tab", { name: "Second" })).toHaveFocus()
  },
}

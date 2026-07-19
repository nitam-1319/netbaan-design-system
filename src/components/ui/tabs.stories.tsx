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
      <div className="w-[28rem] p-8 text-foreground">
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
      <div className="pt-4 text-sm text-muted-foreground">
        <TabsPanel value="overview">
          Posture summary and headline metrics.
        </TabsPanel>
        <TabsPanel value="findings">
          Ranked vulnerabilities by exploitability.
        </TabsPanel>
        <TabsPanel value="assets">Discovered hosts and services.</TabsPanel>
      </div>
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
      <div className="pt-4 text-sm text-muted-foreground">
        <TabsPanel value="activity">Recent scans and changes.</TabsPanel>
        <TabsPanel value="risks">Open risks needing action.</TabsPanel>
        <TabsPanel value="surface">Exposed attack surface.</TabsPanel>
      </div>
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
      <div className="pt-4 text-sm text-muted-foreground">
        <TabsPanel value="a">First panel.</TabsPanel>
        <TabsPanel value="b">Second panel.</TabsPanel>
        <TabsPanel value="c">Third panel.</TabsPanel>
      </div>
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

import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { Home, Search, Bell, User, Layers } from "lucide-react"

import {
  BottomNavigation,
  type BottomNavigationItem,
} from "@/components/ui/bottom-navigation"

const items: BottomNavigationItem[] = [
  { value: "home", label: "Home", icon: <Home /> },
  { value: "assets", label: "Assets", icon: <Layers /> },
  { value: "search", label: "Search", icon: <Search /> },
  { value: "alerts", label: "Alerts", icon: <Bell />, badge: 3 },
  { value: "profile", label: "Profile", icon: <User /> },
]

const meta = {
  title: "Components/Bottom Navigation",
  component: BottomNavigation,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    showLabels: { control: "inline-radio", options: ["always", "active", "never"] },
    placement: { control: "inline-radio", options: ["fixed", "inline"] },
  },
  args: { items, showLabels: "always", placement: "inline" },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[24rem] max-w-full overflow-hidden rounded-xl border border-border">
        <div className="h-40 bg-surface-2" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("home")
    return <BottomNavigation {...args} value={value} onValueChange={setValue} />
  },
}

export const LabelsOnActive: Story = {
  args: { showLabels: "active" },
  render: (args) => {
    const [value, setValue] = React.useState("assets")
    return <BottomNavigation {...args} value={value} onValueChange={setValue} />
  },
}

export const IconsOnly: Story = {
  args: { showLabels: "never" },
  render: (args) => {
    const [value, setValue] = React.useState("home")
    return <BottomNavigation {...args} value={value} onValueChange={setValue} />
  },
}

export const WithDotBadge: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("home")
    const withDot = items.map((i) =>
      i.value === "profile" ? { ...i, badge: true as const } : i
    )
    return (
      <BottomNavigation
        {...args}
        items={withDot}
        value={value}
        onValueChange={setValue}
      />
    )
  },
}

export const ThreeItems: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("home")
    return (
      <BottomNavigation
        {...args}
        items={items.slice(0, 3)}
        value={value}
        onValueChange={setValue}
      />
    )
  },
}

/**
 * Persian / RTL — items lay out right-to-left and the badge moves to the logical
 * corner.
 */
export const RTLPersian: Story = {
  name: "RTL (Persian)",
  render: (args) => {
    const [value, setValue] = React.useState("home")
    const fa: BottomNavigationItem[] = [
      { value: "home", label: "خانه", icon: <Home /> },
      { value: "assets", label: "دارایی‌ها", icon: <Layers /> },
      { value: "alerts", label: "هشدارها", icon: <Bell />, badge: 3 },
      { value: "profile", label: "پروفایل", icon: <User /> },
    ]
    return (
      <div dir="rtl">
        <BottomNavigation
          {...args}
          items={fa}
          value={value}
          onValueChange={setValue}
          aria-label="اصلی"
        />
      </div>
    )
  },
}

/** Selecting an item marks it current and reports the value. */
export const SelectInteraction: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("home")
    return <BottomNavigation {...args} value={value} onValueChange={setValue} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alerts = canvas.getByRole("button", { name: /Alerts/ })
    await userEvent.click(alerts)
    await expect(alerts).toHaveAttribute("aria-current", "page")
    // the badge count is announced
    await expect(canvas.getByText("3")).toBeVisible()
  },
}

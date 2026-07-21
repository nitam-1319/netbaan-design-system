import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "storybook/test"
import { ShieldAlert, Globe, KeyRound } from "lucide-react"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion"

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "separated", "bordered"],
      description: "Visual treatment of the item stack.",
    },
    multiple: {
      control: "boolean",
      description: "Allow more than one panel open at once.",
    },
    disabled: {
      control: "boolean",
      description: "Disable the whole accordion.",
    },
  },
  args: {
    variant: "default",
    multiple: false,
    disabled: false,
  },
  // Render on the real dark surface so contrast matches production.
  decorators: [
    (Story) => (
      <div className="dark w-[34rem] max-w-full bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  {
    value: "surface",
    icon: <Globe />,
    title: "Attack surface",
    body: "Every internet-exposed host, service, and certificate AEGIS has discovered for this organization, refreshed on each scan.",
  },
  {
    value: "findings",
    icon: <ShieldAlert />,
    title: "Findings & severity",
    body: "Vulnerabilities ranked by exploitability and business impact, from Critical down to Informational.",
  },
  {
    value: "access",
    icon: <KeyRound />,
    title: "Access & credentials",
    body: "Exposed secrets, weak TLS configuration, and authentication gaps that could let an attacker in.",
  },
]

function DemoItems() {
  return (
    <>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              {item.icon}
              {item.title}
            </span>
          </AccordionTrigger>
          <AccordionPanel>{item.body}</AccordionPanel>
        </AccordionItem>
      ))}
    </>
  )
}

export const Default: Story = {
  args: { variant: "default" },
  render: (args) => (
    <Accordion {...args} defaultValue={["surface"]}>
      <DemoItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const findings = canvas.getByRole("button", { name: /Findings & severity/ })
    // Collapsed panel content is not visible until its trigger is pressed.
    await expect(findings).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(findings)
    await expect(findings).toHaveAttribute("aria-expanded", "true")
    await expect(canvas.getByText(/ranked by exploitability/i)).toBeVisible()
  },
}

export const Separated: Story = {
  args: { variant: "separated" },
  render: (args) => (
    <Accordion {...args} defaultValue={["surface"]}>
      <DemoItems />
    </Accordion>
  ),
}

export const Bordered: Story = {
  args: { variant: "bordered" },
  render: (args) => (
    <Accordion {...args}>
      <DemoItems />
    </Accordion>
  ),
}

export const Multiple: Story = {
  args: { variant: "separated", multiple: true },
  render: (args) => (
    <Accordion {...args} defaultValue={["surface", "findings"]}>
      <DemoItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const surface = canvas.getByRole("button", { name: /Attack surface/ })
    const access = canvas.getByRole("button", { name: /Access & credentials/ })
    await expect(surface).toHaveAttribute("aria-expanded", "true")
    // Opening a third panel leaves the others open in multiple mode.
    await userEvent.click(access)
    await expect(access).toHaveAttribute("aria-expanded", "true")
    await expect(surface).toHaveAttribute("aria-expanded", "true")
  },
}

export const KeyboardNav: Story = {
  render: (args) => (
    <Accordion {...args}>
      <DemoItems />
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const surface = canvas.getByRole("button", { name: /Attack surface/ })
    surface.focus()
    await expect(surface).toHaveFocus()
    // Enter toggles the focused trigger.
    await userEvent.keyboard("{Enter}")
    await expect(surface).toHaveAttribute("aria-expanded", "true")
  },
}

export const Disabled: Story = {
  args: { disabled: true, variant: "bordered" },
  render: (args) => (
    <Accordion {...args}>
      <DemoItems />
    </Accordion>
  ),
}

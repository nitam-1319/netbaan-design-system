import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, waitFor, within } from "storybook/test"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

const meta = {
  title: "Components/NavigationMenu",
  component: NavigationMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="text-foreground flex min-h-64 items-start justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

/** A demo panel of stacked links used inside a content dropdown. */
function LinkColumn({
  items,
}: {
  items: { title: string; href: string; description: string }[]
}) {
  return (
    <ul className="grid w-72 gap-1">
      {items.map((item) => (
        <li key={item.title}>
          <NavigationMenuLink
            href={item.href}
            render={
              <a>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-xs leading-snug">
                    {item.description}
                  </span>
                </span>
              </a>
            }
          />
        </li>
      ))}
    </ul>
  )
}

const productItems = [
  {
    title: "Attack Surface",
    href: "#asm",
    description: "Continuous discovery of your internet-facing assets.",
  },
  {
    title: "Posture Score",
    href: "#posture",
    description: "A single graded measure of exposure over time.",
  },
  {
    title: "Findings",
    href: "#findings",
    description: "Prioritised vulnerabilities with remediation guidance.",
  },
]

const resourceItems = [
  {
    title: "Documentation",
    href: "#docs",
    description: "Guides, API references, and integration recipes.",
  },
  {
    title: "Changelog",
    href: "#changelog",
    description: "What shipped, release by release.",
  },
]

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkColumn items={productItems} />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkColumn items={resourceItems} />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuViewport />
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Product" })

    // Opening the trigger teleports the panel into the portalled viewport.
    await userEvent.click(trigger)
    const panel = await screen.findByText("Attack Surface")
    await waitFor(() => expect(panel).toBeVisible())

    // A plain top-level link renders inline (no dropdown panel).
    await expect(
      canvas.getByRole("link", { name: "Pricing" })
    ).toBeInTheDocument()
  },
}

export const WithArrow: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <LinkColumn items={productItems} />
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuViewport showArrow />
    </NavigationMenu>
  ),
}

export const LinksOnly: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#overview" active>
            Overview
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing">Pricing</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuViewport />
    </NavigationMenu>
  ),
}

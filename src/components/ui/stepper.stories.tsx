import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"
import { CreditCard, Package, Truck } from "lucide-react"

import { Stepper, type StepperStep } from "@/components/ui/stepper"

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="text-foreground w-full max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

const checkout: StepperStep[] = [
  { label: "Cart", description: "Review your items" },
  { label: "Address", description: "Where it ships" },
  { label: "Payment", description: "How you pay" },
  { label: "Confirm", description: "Place the order" },
]

export const Horizontal: Story = {
  args: {
    steps: checkout,
    activeStep: 2,
    "aria-label": "Checkout progress",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The active step is marked for assistive tech.
    const current = canvasElement.querySelector('[aria-current="step"]')
    await expect(current).not.toBeNull()
    await expect(within(current as HTMLElement).getByText("Payment")).toBeVisible()
    // Exactly one step is current at a time.
    await expect(
      canvasElement.querySelectorAll('[aria-current="step"]')
    ).toHaveLength(1)
    // Earlier steps read as completed to screen readers.
    await expect(canvas.getAllByText("(completed)")).toHaveLength(2)
  },
}

export const Vertical: Story = {
  args: {
    steps: checkout,
    activeStep: 1,
    orientation: "vertical",
  },
}

export const FirstStep: Story = {
  args: {
    steps: checkout,
    activeStep: 0,
  },
}

export const AllComplete: Story = {
  args: {
    steps: checkout,
    activeStep: checkout.length,
  },
}

export const Small: Story = {
  args: {
    steps: checkout.map(({ label }) => ({ label })),
    activeStep: 2,
    size: "sm",
  },
}

export const CustomIcons: Story = {
  args: {
    steps: [
      { label: "Order", icon: <Package aria-hidden /> },
      { label: "Payment", icon: <CreditCard aria-hidden /> },
      { label: "Shipping", icon: <Truck aria-hidden /> },
    ] satisfies StepperStep[],
    activeStep: 1,
  },
}

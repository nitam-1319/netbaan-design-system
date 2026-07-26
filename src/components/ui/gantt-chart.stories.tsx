import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import { GanttChart } from "@/components/ui/gantt-chart"

/**
 * Theme (Light/Dark) and direction (LTR/RTL) come from the global Storybook
 * toolbar. Demo layout uses plain HTML wrappers so no `className` / `style` is
 * ever passed to an AEGIS component.
 */
const meta = {
  title: "Components/GanttChart",
  component: GanttChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    tickCount: { control: { type: "number" } },
    showGrid: { control: "boolean" },
    rowHeight: { control: { type: "number" } },
  },
} satisfies Meta<typeof GanttChart>

export default meta
type Story = StoryObj<typeof meta>

const days = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]

const tasks = [
  { id: "t1", name: "Discovery", start: 0, end: 2, progress: 1 },
  { id: "t2", name: "Design", start: 1, end: 4, progress: 0.8 },
  { id: "t3", name: "Build", start: 3, end: 7, progress: 0.45 },
  { id: "t4", name: "QA & hardening", start: 6, end: 8, progress: 0.1 },
  { id: "t5", name: "Launch", start: 7, end: 8 },
]

export const Default: Story = {
  args: {
    label: "Project timeline",
    tasks,
    domain: [0, 8],
    tickCount: 5,
    formatTick: (v) => days[Math.round(v)] ?? String(v),
    showGrid: true,
    rowHeight: 36,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const fig = canvas.getByRole("img", { name: "Project timeline" })
    expect(fig).toBeInTheDocument()
    // One base bar per task.
    const bars = canvasElement.querySelectorAll('[data-slot="gantt-bar"]')
    expect(bars.length).toBe(tasks.length)
    // Progress overlays only on tasks with a progress value.
    const progress = canvasElement.querySelectorAll('[data-slot="gantt-bar-progress"]')
    expect(progress.length).toBe(tasks.filter((t) => t.progress !== undefined).length)
    // Row labels render as text.
    expect(canvas.getByText("Build")).toBeInTheDocument()
  },
}

export const NoGrid: Story = {
  args: {
    label: "Sprint plan",
    tasks: tasks.slice(0, 3),
    domain: [0, 8],
    tickCount: 4,
    formatTick: (v) => days[Math.round(v)] ?? String(v),
    showGrid: false,
  },
}

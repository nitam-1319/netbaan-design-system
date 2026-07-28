import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, screen, within } from "storybook/test"

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxGroup,
  ComboboxGroupLabel,
} from "@/components/ui/combobox"

/**
 * Combobox filters a list as you type and selects one value. The list portals to
 * `document.body`; the global Theme/Locale toolbar drives Light/Dark and
 * English-LTR / Persian-RTL.
 */
const meta = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72 p-16 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const FRUITS = [
  "Apple",
  "Apricot",
  "Banana",
  "Blackberry",
  "Cherry",
  "Grapefruit",
  "Mango",
  "Peach",
  "Pear",
  "Pineapple",
]

export const Default: Story = {
  render: () => (
    <Combobox items={FRUITS}>
      <ComboboxInput aria-label="Search fruit" placeholder="Search fruit…" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("combobox", { name: "Search fruit" })
    await userEvent.click(input)
    await userEvent.type(input, "pea")
    // Filtered options are portalled to document.body.
    const peach = await screen.findByRole("option", { name: "Peach" })
    await expect(peach).toBeVisible()
    // "Apple" is filtered out.
    await expect(screen.queryByRole("option", { name: "Apple" })).toBeNull()
    await userEvent.click(peach)
    await expect(input).toHaveValue("Peach")
  },
}

export const Grouped: Story = {
  render: () => {
    const items = [
      { value: "Chrome", group: "Desktop" },
      { value: "Firefox", group: "Desktop" },
      { value: "Safari", group: "Desktop" },
      { value: "Chrome Mobile", group: "Mobile" },
      { value: "Safari iOS", group: "Mobile" },
    ]
    return (
      <Combobox items={items.map((i) => i.value)}>
        <ComboboxInput aria-label="Search browser" placeholder="Search browser…" />
        <ComboboxContent>
          <ComboboxEmpty>No match.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
  },
}

export const WithStaticGroups: Story = {
  render: () => (
    <Combobox items={["Read", "Write", "Admin", "Owner"]}>
      <ComboboxInput aria-label="Assign role" placeholder="Assign role…" />
      <ComboboxContent>
        <ComboboxEmpty>No role.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxGroupLabel>Roles</ComboboxGroupLabel>
            <ComboboxItem value="Read">Read</ComboboxItem>
            <ComboboxItem value="Write">Write</ComboboxItem>
            <ComboboxItem value="Admin">Admin</ComboboxItem>
            <ComboboxItem value="Owner">Owner</ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Combobox key={size} items={FRUITS}>
          <ComboboxInput size={size} aria-label={`Size ${size}`} placeholder={`Size ${size}…`} />
          <ComboboxContent>
            <ComboboxEmpty>No fruit found.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ))}
    </div>
  ),
}

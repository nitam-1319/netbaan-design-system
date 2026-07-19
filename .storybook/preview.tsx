import type { Preview, Decorator } from "@storybook/react-vite"

import "../src/index.css"

/**
 * Global decorator: applies the AEGIS theme (light/dark) and locale/direction
 * (English LTR / Persian RTL, with Vazirmatn) from the toolbar, on a wrapper
 * that sets `bg-background text-foreground` so every story renders on the real
 * surface with the correct inherited text color. Switch via the toolbar.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? "dark"
  const locale = (context.globals.locale as string) ?? "en"
  const isDark = theme === "dark"
  const dir = locale === "fa" ? "rtl" : "ltr"
  const fontClass = locale === "fa" ? "font-fa" : "font-sans"

  return (
    <div
      className={[isDark ? "dark" : "", "bg-background text-foreground", fontClass]
        .filter(Boolean)
        .join(" ")}
      dir={dir}
      lang={locale}
      style={{ minHeight: "100vh" }}
    >
      <Story />
    </div>
  )
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' — report violations in the test UI; 'error' — fail CI on them.
      test: "todo",
    },
  },

  initialGlobals: {
    theme: "dark",
    locale: "en",
  },

  globalTypes: {
    theme: {
      description: "AEGIS theme",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "dark", title: "Dark", icon: "circle" },
          { value: "light", title: "Light", icon: "circlehollow" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Language & direction",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: [
          { value: "en", title: "English (LTR)", right: "EN" },
          { value: "fa", title: "فارسی (RTL)", right: "FA" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [withTheme],
}

export default preview

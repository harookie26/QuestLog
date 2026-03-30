type PackageDoc = {
  name: string;
  purpose: string;
  usedFor: string;
  note?: string;
};

type PackageSection = {
  id: string;
  title: string;
  subtitle: string;
  packages: PackageDoc[];
};

const packageSections: PackageSection[] = [
  {
    id: "core-runtime",
    title: "Core Runtime And Routing",
    subtitle: "Foundation packages that run the React app and page navigation.",
    packages: [
      {
        name: "react",
        purpose: "Component model and rendering lifecycle.",
        usedFor: "All frontend page and component logic in src.",
      },
      {
        name: "react-dom",
        purpose: "Browser renderer for React.",
        usedFor: "Mounting the app from src/main.tsx into the DOM.",
      },
      {
        name: "react-router",
        purpose: "Core routing engine primitives.",
        usedFor:
          "Underlying route matching used by react-router-dom in this app.",
      },
      {
        name: "react-router-dom",
        purpose: "Browser routing, links, and route components.",
        usedFor:
          "App routes and navigation flows in src/App.tsx and page components.",
      },
    ],
  },
  {
    id: "styling-and-theme",
    title: "Styling And Theme Stack",
    subtitle:
      "Packages behind the violet theme, utility classes, and UI composition.",
    packages: [
      {
        name: "tailwindcss",
        purpose: "Utility-first CSS framework.",
        usedFor:
          "Layout, spacing, color, and responsive classes across frontend pages.",
      },
      {
        name: "@tailwindcss/vite",
        purpose: "Tailwind integration plugin for Vite.",
        usedFor: "Build-time Tailwind processing through the Vite toolchain.",
      },
      {
        name: "postcss",
        purpose: "CSS transform engine.",
        usedFor:
          "Tailwind and CSS plugin processing configured in postcss.config.cjs.",
      },
      {
        name: "autoprefixer",
        purpose: "Automatic vendor prefix generation.",
        usedFor: "Cross-browser CSS compatibility during frontend builds.",
      },
      {
        name: "lucide-react",
        purpose: "SVG icon component library.",
        usedFor: "Navigation and footer icons in shared UI components.",
      },
      {
        name: "clsx",
        purpose: "Conditional className construction helper.",
        usedFor:
          "Installed for ergonomic conditional class patterns in reusable UI code.",
        note: "Not heavily used in current pages, but part of the styling toolkit.",
      },
      {
        name: "class-variance-authority",
        purpose: "Variant-based class composition utility.",
        usedFor:
          "Installed to define reusable component style variants as UI grows.",
        note: "Prepared for scalable component styling patterns.",
      },
      {
        name: "tailwind-merge",
        purpose: "Merge and deduplicate Tailwind class strings.",
        usedFor:
          "Installed for safer class overrides in composable components.",
        note: "Useful when combining dynamic utility sets.",
      },
      {
        name: "tw-animate-css",
        purpose: "Animation utilities tailored for utility CSS workflows.",
        usedFor:
          "Available for UI animation effects aligned with the Tailwind stack.",
      },
      {
        name: "motion",
        purpose: "Animation primitives for React interfaces.",
        usedFor:
          "Installed for advanced transitions and interaction choreography.",
        note: "Current pages use mostly CSS animations; this enables richer motion later.",
      },
      {
        name: "next-themes",
        purpose: "Theme mode management helper.",
        usedFor: "Installed to support future theme switching strategies.",
        note: "The current project uses a fixed custom violet theme.",
      },
    ],
  },
  {
    id: "data-auth-and-api",
    title: "Data, Auth, And API Layer",
    subtitle:
      "Packages that support database access, authentication, and environment config.",
    packages: [
      {
        name: "mongoose",
        purpose: "MongoDB object modeling and schema layer.",
        usedFor: "Models and database reads/writes in api and lib model files.",
      },
      {
        name: "mongodb",
        purpose: "Official MongoDB Node.js driver.",
        usedFor:
          "Underlying database connectivity utilities in project data access paths.",
      },
      {
        name: "bcryptjs",
        purpose: "Password hashing and verification.",
        usedFor:
          "User credential handling in account and password reset flows.",
      },
      {
        name: "dotenv",
        purpose: "Environment variable loading from .env files.",
        usedFor:
          "Runtime configuration for API/database credentials in local and deployment setup.",
      },
    ],
  },
  {
    id: "monitoring-build-and-deploy",
    title: "Monitoring, Build, And Deploy",
    subtitle:
      "Tooling for local development, production builds, and Vercel observability.",
    packages: [
      {
        name: "vite",
        purpose: "Frontend dev server and bundler.",
        usedFor: "Fast local development and production asset builds.",
      },
      {
        name: "@vitejs/plugin-react",
        purpose: "React support plugin for Vite.",
        usedFor: "JSX/TSX transform and React fast-refresh integration.",
      },
      {
        name: "@vercel/analytics",
        purpose: "Page analytics collection on Vercel.",
        usedFor: "Usage telemetry through the Analytics component in App.",
      },
      {
        name: "@vercel/speed-insights",
        purpose: "Performance and web vitals instrumentation.",
        usedFor:
          "Runtime performance insights through the SpeedInsights component.",
      },
    ],
  },
  {
    id: "forms-input-and-interactions",
    title: "Forms, Inputs, And Interaction UX",
    subtitle:
      "Packages available for richer form behavior and advanced user interactions.",
    packages: [
      {
        name: "react-hook-form",
        purpose: "Performant form state and validation handling.",
        usedFor:
          "Installed to streamline complex form flows and validation rules.",
      },
      {
        name: "input-otp",
        purpose: "One-time-password input components.",
        usedFor:
          "Available for secure code entry UX in verification-style forms.",
      },
      {
        name: "cmdk",
        purpose: "Command menu component primitives.",
        usedFor: "Installed for searchable command palette interactions.",
      },
      {
        name: "@popperjs/core",
        purpose: "Positioning engine for floating UI elements.",
        usedFor: "Precise dropdown, popover, and tooltip placement support.",
      },
      {
        name: "react-popper",
        purpose: "React bindings for Popper positioning.",
        usedFor: "Integrating positioned overlays with React component state.",
      },
      {
        name: "react-dnd",
        purpose: "Drag-and-drop architecture for React.",
        usedFor:
          "Installed for draggable interaction patterns in future feature sets.",
      },
      {
        name: "react-dnd-html5-backend",
        purpose: "HTML5 backend implementation for react-dnd.",
        usedFor: "Enables browser drag-and-drop behavior for react-dnd.",
      },
      {
        name: "react-resizable-panels",
        purpose: "Resizable split panel components.",
        usedFor: "Installed for adjustable workspace-like layouts.",
      },
      {
        name: "vaul",
        purpose: "Drawer component utilities.",
        usedFor: "Supports mobile-friendly slide-over and sheet UI patterns.",
      },
      {
        name: "sonner",
        purpose: "Toast notification system.",
        usedFor: "Installed for non-blocking success/error feedback messages.",
      },
    ],
  },
  {
    id: "date-chart-and-layout",
    title: "Date, Charts, And Content Layout",
    subtitle:
      "Packages for data visualization, date handling, and richer content presentation.",
    packages: [
      {
        name: "date-fns",
        purpose: "Modern utility functions for date formatting and math.",
        usedFor:
          "Date parsing and display logic in date-sensitive UI features.",
      },
      {
        name: "react-day-picker",
        purpose: "Calendar and date-picker UI components.",
        usedFor: "Installed for date selection interfaces in forms.",
      },
      {
        name: "recharts",
        purpose: "Composable charting library for React.",
        usedFor:
          "Installed for visualizing gameplay or community metrics when needed.",
      },
      {
        name: "embla-carousel-react",
        purpose: "Carousel mechanics with React integration.",
        usedFor: "Installed for swipeable media/content sliders.",
      },
      {
        name: "react-slick",
        purpose: "Responsive carousel/slider component.",
        usedFor:
          "Alternative slider implementation for rotating content sections.",
      },
      {
        name: "react-responsive-masonry",
        purpose: "Masonry-style responsive grid layouts.",
        usedFor:
          "Installed for Pinterest-like card walls and mixed-height content grids.",
      },
    ],
  },
  {
    id: "radix-primitives",
    title: "Radix UI Primitive Library",
    subtitle:
      "Accessible unstyled building blocks installed for flexible custom component development, with many available for future feature expansion.",
    packages: [
      {
        name: "@radix-ui/react-accordion",
        purpose: "Accessible accordion primitives.",
        usedFor: "Expandable section components with keyboard support.",
      },
      {
        name: "@radix-ui/react-alert-dialog",
        purpose: "Accessible confirm/cancel modal primitives.",
        usedFor: "Destructive action confirmation and critical alerts.",
      },
      {
        name: "@radix-ui/react-aspect-ratio",
        purpose: "Aspect-ratio container primitive.",
        usedFor: "Consistent media sizing in responsive cards and galleries.",
      },
      {
        name: "@radix-ui/react-avatar",
        purpose: "Avatar/image fallback primitive.",
        usedFor: "Profile visuals with fallback initials behavior.",
      },
      {
        name: "@radix-ui/react-checkbox",
        purpose: "Accessible checkbox primitive.",
        usedFor: "Custom checkbox inputs in forms and filters.",
      },
      {
        name: "@radix-ui/react-collapsible",
        purpose: "Show/hide region primitive.",
        usedFor: "Collapsible content blocks and compact disclosure sections.",
      },
      {
        name: "@radix-ui/react-context-menu",
        purpose: "Context menu primitives.",
        usedFor: "Right-click action menus and contextual item controls.",
      },
      {
        name: "@radix-ui/react-dialog",
        purpose: "Modal dialog primitives.",
        usedFor: "Custom modal windows with focus trapping and accessibility.",
      },
      {
        name: "@radix-ui/react-dropdown-menu",
        purpose: "Dropdown menu primitives.",
        usedFor: "Menu buttons and nested command actions.",
      },
      {
        name: "@radix-ui/react-hover-card",
        purpose: "Preview card on hover/focus.",
        usedFor: "Context previews for users, games, or threads.",
      },
      {
        name: "@radix-ui/react-label",
        purpose: "Accessible form label primitive.",
        usedFor: "Semantic label behavior in custom form fields.",
      },
      {
        name: "@radix-ui/react-menubar",
        purpose: "Desktop-style menu bar primitives.",
        usedFor: "Advanced command-oriented top navigation patterns.",
      },
      {
        name: "@radix-ui/react-navigation-menu",
        purpose: "Navigation menu primitives.",
        usedFor: "Composed mega-menu and advanced nav structures.",
      },
      {
        name: "@radix-ui/react-popover",
        purpose: "Popover overlay primitives.",
        usedFor: "Inline floating panels anchored to triggers.",
      },
      {
        name: "@radix-ui/react-progress",
        purpose: "Progress indicator primitives.",
        usedFor: "Task, upload, or completion progress visuals.",
      },
      {
        name: "@radix-ui/react-radio-group",
        purpose: "Accessible radio-group primitives.",
        usedFor: "Single-selection controls in settings/forms.",
      },
      {
        name: "@radix-ui/react-scroll-area",
        purpose: "Custom scroll area primitives.",
        usedFor: "Styled overflow containers with accessible scrolling.",
      },
      {
        name: "@radix-ui/react-select",
        purpose: "Accessible select/dropdown primitives.",
        usedFor:
          "Custom select fields with keyboard and screen-reader support.",
      },
      {
        name: "@radix-ui/react-separator",
        purpose: "Semantic divider primitives.",
        usedFor: "Visual and structural separation in panels and menus.",
      },
      {
        name: "@radix-ui/react-slider",
        purpose: "Range slider primitives.",
        usedFor: "Numeric range controls such as filters and preferences.",
      },
      {
        name: "@radix-ui/react-slot",
        purpose: "Slotting utility for component composition.",
        usedFor: "Polymorphic component APIs and content injection patterns.",
      },
      {
        name: "@radix-ui/react-switch",
        purpose: "Toggle switch primitives.",
        usedFor: "On/off controls for settings and feature toggles.",
      },
      {
        name: "@radix-ui/react-tabs",
        purpose: "Tab interface primitives.",
        usedFor: "Sectioned content panels with keyboard navigation.",
      },
      {
        name: "@radix-ui/react-toggle",
        purpose: "Single toggle button primitives.",
        usedFor: "Pressed/unpressed state controls in toolbars and forms.",
      },
      {
        name: "@radix-ui/react-toggle-group",
        purpose: "Grouped toggle control primitives.",
        usedFor: "Multi-option mode selectors and segmented controls.",
      },
      {
        name: "@radix-ui/react-tooltip",
        purpose: "Tooltip primitives.",
        usedFor: "Context hints for icons and compact UI actions.",
      },
    ],
  },
  {
    id: "material-ui-stack",
    title: "Material UI And Emotion Stack",
    subtitle:
      "Optional alternate component system available alongside Tailwind styling.",
    packages: [
      {
        name: "@mui/material",
        purpose: "Material Design React component library.",
        usedFor:
          "Installed as an optional prebuilt component system for rapid UI assembly.",
      },
      {
        name: "@mui/icons-material",
        purpose: "Material icon components.",
        usedFor:
          "Icon set for MUI-based views where Material semantics are preferred.",
      },
      {
        name: "@emotion/react",
        purpose: "Emotion runtime for style composition.",
        usedFor: "Styling engine required by MUI for CSS-in-JS behavior.",
      },
      {
        name: "@emotion/styled",
        purpose: "Styled component API for Emotion.",
        usedFor:
          "Custom styled components when using the MUI/Emotion approach.",
      },
    ],
  },
  {
    id: "typescript-dev-tooling",
    title: "TypeScript Developer Tooling",
    subtitle:
      "Compile-time packages that support safer authoring and editor intelligence.",
    packages: [
      {
        name: "typescript",
        purpose: "Static typing compiler and language services.",
        usedFor: "Type-checked TS/TSX development across frontend files.",
      },
      {
        name: "@types/react",
        purpose: "Type definitions for React APIs.",
        usedFor: "Compile-time typing and IntelliSense for React components.",
      },
      {
        name: "@types/react-dom",
        purpose: "Type definitions for React DOM APIs.",
        usedFor: "Typing support for DOM render and hydration interfaces.",
      },
    ],
  },
];

const totalPackages = packageSections.reduce(
  (count, section) => count + section.packages.length,
  0,
);

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-violet-100/60">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(109,40,217,0.16),_transparent_48%)]" />
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="rounded-3xl border border-violet-200/80 bg-white/85 p-6 shadow-xl shadow-violet-900/5 backdrop-blur md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-700">
            QuestLog Documentation
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-violet-900 sm:text-4xl">
            About This Project Stack
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-violet-800 sm:text-base">
            This page documents the npm packages installed in the project and
            explains their practical role in the current build. It is organized
            as an alternating timeline so that viewers can scan the stack
            category by category.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-violet-300 bg-violet-100/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-violet-900">
              Total Documented: {totalPackages}
            </div>
            <div className="rounded-full border border-violet-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-violet-900">
              Source: root package.json
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-20 -mx-2 mb-8 border-b border-violet-200/80 bg-violet-50/80 px-2 py-3 backdrop-blur">
          <nav className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold uppercase tracking-wide text-violet-800">
            {packageSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap rounded-full border border-violet-300 bg-white px-3 py-1.5 transition-colors hover:bg-violet-100"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-violet-300 via-violet-200 to-transparent md:left-1/2 md:block" />
          <div className="space-y-10">
            {packageSections.map((section, index) => {
              const isRight = index % 2 !== 0;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="relative scroll-mt-20"
                >
                  <div
                    className={`md:grid md:grid-cols-2 md:gap-8 ${isRight ? "" : ""}`}
                  >
                    <div
                      className={`${isRight ? "md:order-2" : "md:order-1"} relative`}
                    >
                      <div className="hidden md:block absolute top-6 -right-4 h-3 w-3 rounded-full border-2 border-violet-500 bg-white md:right-auto md:left-[calc(100%+1.1rem)]" />
                      <article className="rounded-2xl border border-violet-200 bg-white/95 p-5 shadow-lg shadow-violet-900/5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
                          Section {index + 1}
                        </p>
                        <h2 className="mt-2 text-xl font-extrabold text-violet-900">
                          {section.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-violet-800">
                          {section.subtitle}
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-violet-700">
                          {section.packages.length} packages
                        </p>
                      </article>
                    </div>
                    <div
                      className={`${isRight ? "md:order-1" : "md:order-2"} mt-4 md:mt-0`}
                    >
                      <div className="grid gap-3">
                        {section.packages.map((pkg) => (
                          <article
                            key={pkg.name}
                            className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm transition-colors hover:bg-white"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-extrabold text-violet-900">
                                {pkg.name}
                              </h3>
                            </div>
                            <p className="mt-2 text-sm text-violet-900">
                              <span className="font-semibold text-violet-800">
                                Purpose:
                              </span>{" "}
                              {pkg.purpose}
                            </p>
                            <p className="mt-1 text-sm text-violet-900">
                              <span className="font-semibold text-violet-800">
                                Used for:
                              </span>{" "}
                              {pkg.usedFor}
                            </p>
                            {pkg.note ? (
                              <p className="mt-1 text-xs text-violet-700">
                                <span className="font-semibold">Note:</span>{" "}
                                {pkg.note}
                              </p>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

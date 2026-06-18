---
name: Tactical Performance System
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#303031'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#acd600'
  primary: '#ffffff'
  on-primary: '#293500'
  primary-container: '#c5f400'
  on-primary-container: '#566c00'
  inverse-primary: '#516600'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c5f400'
  primary-fixed-dim: '#acd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.01em
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  bento-gap: 12px
---

## Brand & Style

This design system is engineered for a high-performance fitness environment where precision meets raw energy. The brand personality is authoritative, elite, and uncompromisingly tactical, designed to appeal to users who view fitness as a discipline rather than a hobby.

The visual style is a hybrid of **Bento-style modularity** and **futuristic glassmorphism**, set against an "Absolute Black" foundation. It utilizes high-contrast accents to draw immediate attention to performance metrics and calls to action. The emotional response should be one of intense focus, empowerment, and the feeling of using professional-grade military or racing equipment. 

Key stylistic pillars include:
- **High-Contrast Impact:** Neon accents against pure black for maximum legibility in low-light gym environments.
- **Data Density:** Using monospace fonts and grid-based layouts to organize complex biological and performance data.
- **Premium Tactility:** Deep shadows and blurred glass layers provide a sense of physical depth and sophisticated "hardware-like" UI.

## Colors

The palette is anchored in an **Absolute Black (#000000)** base to create an infinite depth effect and allow the OLED screens to truly shine.

- **Volt (#CEFF00):** Used for primary actions, success states, and critical performance peaks. It is the "go" color.
- **Tactical Cyan (#00F0FF):** Used for secondary data visualizations, active status indicators, and "cool" metrics like recovery or heart rate variability.
- **Grays:** A scale of deep grays (`#0A0A0A`, `#1A1A1A`, `#2E2E2E`) is used to define container boundaries and bento-grid surfaces without breaking the dark aesthetic.
- **Data Visualization:** Beyond the primary accents, use these colors sparingly to ensure the interface remains focused and doesn't become "rainbow-like."

## Typography

The typography strategy leverages **Inter** for its aggressive, neutral clarity in headlines and **JetBrains Mono** for all numerical and macro data to reinforce the "tactical" aesthetic.

- **Headlines:** Should be set with tight tracking (letter spacing) and heavy weights (ExtraBold/Black). This creates a sense of urgency and power.
- **Macros & Data:** All numerical values, timestamps, and technical labels must use the monospaced font. This ensures that numbers don't jump horizontally when values change rapidly (e.g., a live stopwatch or heart rate monitor).
- **Hierarchy:** Use all-caps sparingly for labels and secondary headers to maintain the professional, military-spec appearance.

## Layout & Spacing

The layout is governed by a **Bento Grid** philosophy, where content is organized into distinct, rounded modules of varying sizes.

- **Grid Model:** Use a 4-column grid for mobile and a 12-column grid for desktop.
- **Module Sizing:** Modules should follow aspect ratios (1:1, 2:1, or 2:2) to maintain a cohesive look.
- **Rhythm:** A strict 4px baseline shift is used. All margins and paddings must be multiples of 4.
- **Responsive Behavior:** On mobile, Bento tiles stack vertically, but maintain horizontal pairs for small metric cards (e.g., Calories and Step count side-by-side).

## Elevation & Depth

Depth in this design system is achieved through "Tactical Glass" and heavy shadowing rather than traditional light-source logic.

- **Glassmorphism:** Floating capsules (like sticky navigation or music players) use a 20% opacity white fill with a 32px backdrop blur. This allows high-contrast photography to bleed through the UI without sacrificing legibility.
- **The "Vault" Shadow:** Primary Bento cards should feature a heavy, 20% opacity black shadow with a large spread (40px+) to "lift" them off the absolute black background, paired with a 1px inner border (stroke) at 10% white to define the edges.
- **Overlays:** Dark overlays (60-80% black) are applied to all background photography to ensure that Volt and Cyan text remains accessible and vibrant.

## Shapes

The shape language is defined by oversized, "super-ellipse" rounded corners that contrast with the aggressive typography.

- **Bento Cards:** Use a standard `2xl` (24px) radius. This creates a friendly but premium "object" feel.
- **Interactive Elements:** Buttons and input fields use a slightly smaller radius (12px) to differentiate them from the structural containers.
- **Micro-elements:** Chips and tags should be fully pill-shaped (rounded-full) to provide a soft contrast to the rigid grid.

## Components

### Buttons
- **Primary:** Background in Volt (#CEFF00), text in Absolute Black (#000000), Bold Inter. No border.
- **Secondary:** Transparent background, 2px solid Tactical Cyan (#00F0FF) border, Cyan text.
- **Tertiary/Ghost:** Blurred glass background (20% white, 16px blur) with white text.

### Cards (Bento Tiles)
- Background: `#0A0A0A` or `#1A1A1A`. 
- Border: 1px solid `#2E2E2E` (Top-down lighting effect).
- Padding: 20px for mobile, 32px for desktop.

### Data Chips
- Small, pill-shaped containers using JetBrains Mono at 12px.
- Use low-opacity versions of Volt or Cyan (15% fill) with 100% opacity text of the same hue for "active" states.

### Progress Bars
- Thick (8px+) tracks with a 100% black background and a secondary gray inner track. 
- The "fill" should use a linear gradient from Tactical Cyan to Volt to represent progress intensity.

### Input Fields
- Underlined style or fully enclosed with a dark gray fill (#1A1A1A).
- The active state must trigger a 1px Volt border and a subtle Volt outer glow (neon effect).
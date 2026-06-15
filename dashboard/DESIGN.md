---
name: Prestige Academic
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dadf'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f9'
  surface-container: '#ebeef3'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#e0e3e8'
  on-surface: '#181c20'
  on-surface-variant: '#4f434f'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f6'
  outline: '#817381'
  outline-variant: '#d3c1d1'
  surface-tint: '#9036a3'
  primary: '#68047d'
  on-primary: '#ffffff'
  primary-container: '#832996'
  on-primary-container: '#f6adff'
  inverse-primary: '#f6adff'
  secondary: '#8b3d9f'
  on-secondary: '#ffffff'
  secondary-container: '#ec96ff'
  on-secondary-container: '#702285'
  tertiary: '#5f2f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#814200'
  on-tertiary-container: '#ffb780'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fed6ff'
  primary-fixed-dim: '#f6adff'
  on-primary-fixed: '#350041'
  on-primary-fixed-variant: '#751988'
  secondary-fixed: '#fcd7ff'
  secondary-fixed-dim: '#f3aeff'
  on-secondary-fixed: '#340042'
  on-secondary-fixed-variant: '#702285'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#e0e3e8'
  surface-lavender: '#F7F1FA'
  text-muted: '#484848'
  glass-fill: rgba(255, 255, 255, 0.7)
  accent-orange: '#DC7603'
typography:
  display-lg:
    fontFamily: DM Serif Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Serif Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: DM Serif Text
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  card-padding: 24px
  section-gap: 40px
---

## Brand & Style
The design system reflects a premium, educational ecosystem that balances the authority of a long-standing institution with the sophisticated utility of a modern fintech application. The target audience is discerning parents who value clarity, security, and a "white-glove" digital experience for their child's educational journey.

The visual style is **Corporate / Modern** with a strong emphasis on **Minimalism** and **Glassmorphism**. It utilizes expansive white space to reduce cognitive load, punctuated by high-fidelity card layouts and frosted-glass navigation elements that create a sense of depth and hierarchy without clutter.

## Colors
This design system uses a palette rooted in a deep, authoritative "Primary Purple" to signify institutional trust. The "Secondary Purple" provides tonal depth for interactive states, while the "Light Lavender" serves as a soft, premium alternative to standard greys for background surfacing.

"Tertiary Orange," derived from the parent brand, is used sparingly as an accent color for high-priority notifications or call-to-action highlights. The "Text Primary" ensures maximum legibility against the predominantly white and lavender backgrounds, maintaining a high-contrast ratio for accessibility.

## Typography
The typographic strategy uses a dual-font approach to create an "Editorial-meets-Fintech" aesthetic. **DM Serif Text** is reserved for top-level headings and display titles, providing a classic, academic feel that distinguishes the brand. 

For all functional text, data displays, and body copy, **Inter** provides a clean, systematic, and highly legible experience. Large display headings should use tighter letter spacing to maintain a premium look, while labels utilize increased tracking for clarity at smaller scales.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop (12 columns) and a **Fluid Grid** on mobile (4 columns). To maintain the premium "Fintech" feel, the system prioritizes generous white space and avoids high-density information clusters.

- **Mobile:** 24px side margins with 16px gutters.
- **Desktop:** Max-width container of 1280px, centered, with 32px side margins.
- **Rhythm:** All spacing must be multiples of the 8px base unit. Section-to-section transitions should favor larger gaps (40px+) to ensure the UI feels unhurried and high-end.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Glassmorphism**. 

- **Primary Cards:** Use a soft, expansive shadow (`0 10px 30px rgba(0,0,0,0.05)`) against a white background to create a lifted, "hovering" effect.
- **Navigation:** Floating bottom bars or header overlays utilize a `backdrop-filter: blur(20px)` with a semi-transparent white fill (`glass-fill`) and a thin 1px white border to simulate high-end frosted glass.
- **Tonal Layers:** The background layer uses `surface-lavender`, while interactive cards use pure `#FFFFFF` to naturally separate content from the canvas.

## Shapes
The shape language is defined by oversized, welcoming curves. Standard UI components like input fields and small buttons use a 16px radius (Rounded-LG), while primary containers and dashboard cards utilize a "Pill-style" 24px radius (Rounded-XL). This extreme roundedness removes visual tension and reinforces the friendly, approachable nature of a parent-centric app.

## Components
- **Buttons:** Primary buttons use a solid `primary-color-hex` with white text and a 32px height for chips or 56px height for main actions. Secondary buttons use a `secondary-purple` tint with 10% opacity and purple text.
- **Cards:** All cards must feature the signature 24px corner radius and the defined ambient shadow. Content within cards should have a minimum of 24px internal padding.
- **Input Fields:** Fields are styled with a `surface-lavender` background and no border in their default state, transitioning to a 1.5px `primary-purple` border on focus. 
- **Glass Navigation:** Floating menus should appear as a single "pill" shape with a glassmorphic background, centered at the bottom of the viewport with a subtle internal glow.
- **Progress Indicators:** Use subtle gradients transitioning from `primary-color-hex` to `secondary-color-hex` for a modern, fluid feel in "academic progress" or "fee payment" trackers.
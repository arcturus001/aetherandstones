# Spectrum 2 text sizes and styles

This document collects the Spectrum 2 typography tokens that are available through the `style()` macro and suggests how to combine them for consistent hierarchy and color.

## How to apply these styles

```tsx
import { Text } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

const heroStyle = style({
  font: "heading-3xl",
  color: "accent",
  letterSpacing: 1,
});

<Text styles={heroStyle}>We don’t sell luxury — we sell energy.</Text>
```

Use the `styles` prop on Spectrum 2 components and the `className` prop only on native elements. The macro exports atomic CSS, so you do not need to write separate CSS files for each combination.

## Font size tokens

| Token | Role | Notes |
| --- | --- | --- |
| `heading-3xl` / `heading-2xl` / `heading-xl` / `heading-l` | Section headings | Highest attention. Use on display and hero titles. |
| `title-3xl` … `title-xs` | Wayfinding and section labels | Balanced emphasis for tabs, cards, and modal titles. |
| `body-3xl` … `body-2xs` | Body text | Default for large paragraphs down to fine supporting copy; use `body` or `body-l` for standard flow. |
| `detail-xl` … `detail-sm` | Metadata | Short, supportive text such as labels, timestamps, captions. |
| `code-xl` … `code-sm` | Code/monospaced blocks | Use when showing snippets, tokens or technical data. |
| `ui-3xl` … `ui-xs` | UI controls | Buttons, badges, chips, and other interactive labels; `ui-sm` is common for compact buttons. |

## Style variations

- **Font weight**: Combine `fontWeight: "bold"`, `"medium"`, or `"semibold"` to emphasize. Most Spectrum controls already apply their default weight.  
- **Color**: Use semantic tokens such as `"heading"`, `"body"`, `"accent"`, `"neutral-subdued"`, or `"disabled"` to match the current layer or color scheme.  
- **Line height**: Set explicitly with `"lineHeight"` when you need tighter or looser spacing (body text defaults to 1.5x, detail text to 1.3x).  
- **Letter spacing**: Provide small positive values like `1` for captions and feature titles to add polish.

## Responsive and stateful modifiers

The macro supports responsive style objects and boolean variants:

```tsx
const responsiveHeading = style({
  font: {
    default: "heading-xl",
    lg: "heading-2xl",
  },
  isEmphasized: {
    color: "accent",
  },
});
```

Use the generated `styles` function as a callback when a component exposes variant props (e.g., `styles={responsiveHeading({ isEmphasized: true })}`).

## Tips for a consistent scale

1. Start with `heading-*` for the most important message, then drop down to `title-*` for section labels and `body-*` for paragraphs.  
2. Reserve `detail-*` for footnotes, legends, and values.  
3. Keep interactive text inside `ui-*` tokens.  
4. Layer color tokens to maintain contrast with the background layer (`base`, `layer-1`, `neutral`, etc.).  
5. Prefer the macro’s built-in spacing over custom margins whenever possible; it keeps your stylesheet small and consistent.

Refer to the Spectrum 2 documentation for the complete token list and any future additions to the macro.



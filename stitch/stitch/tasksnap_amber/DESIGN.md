# Design System Strategy: The Radiant Tactile Interface

## 1. Overview & Creative North Star: "The Living Canvas"
This design system moves away from the rigid, boxed-in layouts of traditional marketplaces. Our North Star is **The Living Canvas**—an editorial-inspired digital environment that feels organic, airy, and hyper-premium. 

To achieve a "Hyperlocal" feel that doesn't feel "Cheap," we reject the standard grid. Instead, we utilize **intentional asymmetry** (e.g., staggering card heights in a masonry-style feed) and **overlapping elements** (e.g., profile avatars breaking the boundary of a card). This creates a sense of human energy and movement, shifting the app from a utility tool to a lifestyle concierge.

---

## 2. Colors: Tonal Depth & Soul
We treat color not as a filler, but as light. The palette is anchored in a warm, cream-based "Off-White" to avoid the clinical coldness of pure white.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. All containment must be achieved through background shifts.
*   **Surface-to-Surface:** A `surface-container-low` section sitting on a `surface` background is the only way to define a global area.
*   **The Transition:** Use the `outline-variant` token only at 10-20% opacity as a "Ghost Border" if absolutely necessary for high-contrast accessibility.

### The Glass & Gradient Rule
To move beyond "standard UI," our primary CTAs and floating navigation must utilize the **Signature Texture**:
*   **Gradient:** A linear 135° flow from `primary_container` (#FF8A00) to `secondary_container` (#FFB347).
*   **Glassmorphism:** Floating elements (like the Bottom Navigation Bar) must use a semi-transparent `surface` with a 20px-32px Backdrop Blur. This allows the hyperlocal content to bleed through the UI, making the app feel integrated with the user's surroundings.

---

## 3. Typography: Editorial Authority
We pair **Plus Jakarta Sans** (Display) with **Manrope** (Body) to strike a balance between high-end fashion and functional tech.

*   **Display & Headline (Plus Jakarta Sans):** Used for "Task Titles" and "Hero Greetings." Use tight letter-spacing (-0.02em) to create an authoritative, premium look.
*   **Body & Labels (Manrope):** Optimized for readability. Use `body-lg` for task descriptions to ensure the app feels accessible and friendly.
*   **Tonal Hierarchy:** Primary information uses `on_surface`. Secondary metadata (time, distance) must use `on_surface_variant` to create a clear visual "quietness" around secondary details.

---

## 4. Elevation & Depth: The Layering Principle
Depth is not created by darkness, but by the physical stacking of light-colored surfaces.

*   **Tonal Stacking:** Place a `surface_container_lowest` (Pure White) card on a `surface_container_low` background. This creates a soft, natural lift that mimics fine paper on a desk.
*   **Ambient Shadows:** For floating elements, use a "Cloud Shadow":
    *   *X: 0, Y: 12, Blur: 30, Spread: 0.*
    *   *Color:* A 6% opacity version of `on_surface` (warm dark gray) rather than black.
*   **Glassmorphism Depth:** When using glass components, apply a 1px inner stroke using `surface_container_highest` at 40% opacity to mimic the "beveled edge" of real glass.

---

## 5. Components: Soft & Intentional

### Floating Navigation (The "Signature" Component)
*   **Style:** A pill-shaped bar floating 24px from the bottom.
*   **Surface:** Glassmorphic `surface` with 24px blur and a subtle `surface_container_highest` inner glow.
*   **Radius:** `full` (9999px).

### Interactive Cards
*   **Rule:** Forbid divider lines. Use `md` (1.5rem) spacing between elements to create separation.
*   **State:** On tap/hover, a card should scale down slightly (0.98) and increase shadow spread to mimic "pressing" into a soft surface.
*   **Radius:** `lg` (2rem) for main task cards; `md` (1.5rem) for nested elements.

### Buttons (The "Sunlight" Variant)
*   **Primary:** Uses the Primary-to-Secondary gradient. No border. Text is `on_primary` (White).
*   **Secondary:** `surface_container_high` background with `primary` text. This feels integrated but distinct.
*   **Radius:** `md` (1.5rem) to maintain the "Soft UI" language.

### Money & Status Chips
*   **Earnings:** Use `tertiary_container` (#6BBB68) with `on_tertiary_container` (#00490E).
*   **Status:** Use high-contrast "ghost" chips (semi-transparent backgrounds) to keep the focus on the task title.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., 24px left, 16px right) on certain header elements to create an editorial feel.
*   **Do** lean into white space. If you think there’s enough space, add 8px more.
*   **Do** use `tertiary` (Green) exclusively for financial rewards and completion states to build positive reinforcement.

### Don’t:
*   **Don't** use 100% black text. Always use `on_surface` to keep the palette warm and premium.
*   **Don't** use sharp corners. Even the smallest thumbnail must have at least a `sm` (0.5rem) radius.
*   **Don't** use standard "Material Design" shadows. They are too aggressive for this "Soft UI" system.
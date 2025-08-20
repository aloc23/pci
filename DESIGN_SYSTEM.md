# Padel Club Dashboard - Design System Documentation

## Overview
This document outlines the design system, tokens, and UI patterns used throughout the Padel Club Dashboard application.

## Color Palette

### Primary Colors (Customer Interface)
- **Primary Green**: `#00ff88` - Main brand color for customer interface
- **Primary Green Hover**: `#00cc6a` - Hover state for primary elements
- **Primary Green Light**: `#33ff99` - Light variant for special effects
- **Primary Green Dark**: `#00b359` - Dark variant for contrast
- **Accent Green**: `#10b981` - Secondary brand color
- **Accent Green Light**: `#34d399` - Light accent variant

### Admin Colors (Admin Interface)
- **Admin Primary**: `#f59e0b` - Main admin interface color (amber/orange)
- **Admin Primary Hover**: `#d97706` - Hover state for admin elements
- **Admin Primary Light**: `rgba(245, 158, 11, 0.2)` - Light admin variant
- **Admin Accent**: `#fbbf24` - Secondary admin color

### Neutral Colors
- **Matt Black**: `#1a1a1a` - Primary dark color
- **Matt Black Light**: `#2d2d2d` - Light variant of dark color
- **Matt Black Ultra Light**: `#374151` - Ultra light dark variant
- **Granite Grey**: `#6b7280` - Primary grey color
- **Granite Grey Light**: `#9ca3af` - Light grey variant
- **Granite Grey Dark**: `#4b5563` - Dark grey variant
- **Granite Grey Ultra Light**: `#e5e7eb` - Ultra light grey
- **White**: `#ffffff` - Pure white
- **Off White**: `#f9fafb` - Slightly tinted white
- **Surface Dark**: `#111827` - Dark surface color

### Semantic Colors
- **Success**: `#10b981` - Success state color
- **Warning**: `#f59e0b` - Warning state color
- **Error**: `#ef4444` - Error state color
- **Info**: `#3b82f6` - Information state color

## Spacing Scale

- **XS**: `0.25rem` (4px) - Minimal spacing
- **SM**: `0.5rem` (8px) - Small spacing
- **MD**: `1rem` (16px) - Medium spacing (base)
- **LG**: `1.5rem` (24px) - Large spacing
- **XL**: `2rem` (32px) - Extra large spacing
- **2XL**: `3rem` (48px) - Double extra large spacing
- **3XL**: `4rem` (64px) - Triple extra large spacing

## Typography Scale

### Font Sizes
- **XS**: `0.75rem` (12px)
- **SM**: `0.875rem` (14px)
- **MD**: `1rem` (16px) - Base size
- **LG**: `1.125rem` (18px)
- **XL**: `1.25rem` (20px)
- **2XL**: `1.5rem` (24px)
- **3XL**: `1.875rem` (30px)
- **4XL**: `2.25rem` (36px)
- **5XL**: `3rem` (48px)

### Line Heights
- **Tight**: `1.25` - For headings
- **Normal**: `1.5` - For body text
- **Relaxed**: `1.625` - For comfortable reading

### Font Family
Primary font: `Inter` with fallbacks to system fonts

## Shadows & Effects

### Standard Shadows
- **SM**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` - Subtle shadow
- **MD**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` - Medium shadow
- **LG**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` - Large shadow
- **XL**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` - Extra large shadow

### Neon Effects
- **Neon**: `0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)` - Full neon glow
- **Neon Subtle**: `0 0 10px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)` - Subtle neon glow
- **Neon Admin**: `0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)` - Admin neon effect

## Border Radius

- **None**: `0` - No rounding
- **SM**: `0.375rem` (6px) - Small rounding
- **Default**: `0.75rem` (12px) - Standard rounding
- **LG**: `1rem` (16px) - Large rounding
- **XL**: `1.5rem` (24px) - Extra large rounding
- **Full**: `9999px` - Pill shape

## Transitions

- **Fast**: `all 0.15s cubic-bezier(0.4, 0, 0.2, 1)` - Quick animations
- **Default**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` - Standard animations
- **Slow**: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1)` - Slow animations

## Component Patterns

### Cards
- **Background**: Semi-transparent white with backdrop blur
- **Border**: Subtle border with neon accent on hover
- **Shadow**: Standard shadow that intensifies on hover
- **Padding**: `var(--space-xl)` (32px)
- **Border Radius**: `var(--border-radius-lg)` (16px)

### Buttons
- **Primary**: Green gradient background with dark text
- **Secondary**: Transparent with border
- **Admin**: Orange gradient for admin interface
- **Hover**: Lift effect with enhanced shadow
- **Focus**: Visible outline for accessibility

### Navigation
- **Active State**: Green background with dark text
- **Hover State**: Semi-transparent background with neon glow
- **Focus**: Neon outline for keyboard navigation

### Forms
- **Input**: White background with border that glows on focus
- **Focus State**: Neon border and shadow
- **Validation**: Color-coded borders and messages

### Modals
- **Background**: Semi-transparent with backdrop blur
- **Border**: Neon accent border
- **Animation**: Fade in with scale effect
- **Backdrop**: Blurred dark overlay

## Animations

### Keyframes Available
- **fadeInScale**: Scale and fade in effect
- **slideInUp**: Slide in from bottom
- **slideInLeft**: Slide in from left
- **slideInRight**: Slide in from right
- **neonGlow**: Pulsing neon effect
- **neonPulse**: Subtle scale and glow
- **neonRipple**: Ripple effect on click

### Usage Guidelines
- Use subtle animations for professional feel
- Limit animation duration to maintain responsiveness
- Respect user preferences for reduced motion
- Apply neon effects sparingly for impact

## Responsive Breakpoints

- **Mobile**: `max-width: 480px` - Small mobile devices
- **Tablet**: `max-width: 768px` - Tablets and large mobile
- **Desktop**: `max-width: 1024px` - Small desktop screens
- **Large Desktop**: `1024px+` - Large desktop screens

## Accessibility

### Focus Management
- Visible focus rings using neon colors
- Logical tab order throughout interface
- Skip links for keyboard navigation

### Color Contrast
- Ensure WCAG AA compliance for text contrast
- Use semantic colors consistently
- Provide alternative indicators beyond color

### Screen Readers
- Proper heading hierarchy
- Descriptive labels and alt text
- ARIA labels where appropriate

## Usage Examples

### CSS Variable Usage
```css
/* Using design tokens */
.my-component {
  padding: var(--space-lg);
  background: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
}

.my-component:hover {
  box-shadow: var(--shadow-lg), var(--shadow-neon-subtle);
  transform: translateY(-2px);
}
```

### Neon Effect Application
```css
/* Applying neon effects */
.interactive-element:hover {
  box-shadow: var(--shadow-neon-subtle);
  border-color: var(--primary-green);
}

.admin-element:hover {
  box-shadow: var(--shadow-neon-admin);
  border-color: var(--admin-primary);
}
```

## Best Practices

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Hierarchy**: Follow the spacing and typography scales
3. **Performance**: Use CSS transforms for animations instead of layout properties
4. **Accessibility**: Ensure all interactive elements have proper focus states
5. **Mobile-First**: Design for mobile devices first, then enhance for larger screens
6. **Subtlety**: Use neon effects sparingly to maintain professionalism

## Maintenance

- Update design tokens in `:root` CSS variables only
- Test changes across all components
- Validate accessibility after modifications
- Update documentation when adding new patterns
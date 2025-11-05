# Portfolio Website

## Project Overview
A personal portfolio website built with modern web technologies to showcase projects and skills. Features an interactive WebGL background using custom pixel-based shader effects.

## Tech Stack
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Library**: React 19
- **Graphics**: Three.js with postprocessing effects
- **Animation**: GSAP, Motion (Framer Motion)
- **Linting**: ESLint with Next.js config

## Project Structure
```
/
├── app/
│   ├── components/
│   │   ├── PixelBlast.tsx      # Interactive WebGL background component
│   │   ├── FuzzyText.tsx       # Canvas-based fuzzy/glitchy text effect with dynamic text support
│   │   ├── FuzzyTypewriter.tsx # Combined typewriter + fuzzy effect component
│   │   ├── ScrambledText.tsx   # GSAP-based text scramble effect on hover
│   │   ├── PixelTransition.tsx # Pixel-based image transition effect
│   │   ├── ProfileSection.tsx  # Profile section with headshot and bio
│   │   ├── TextType.tsx        # Typewriter text component (legacy, not used)
│   │   ├── DecryptedText.tsx   # Decryption text effect (legacy, not used)
│   │   └── ASCIIText.tsx       # 3D ASCII art text with WebGL (optional)
│   ├── hooks/
│   │   └── useTypewriter.ts    # Reusable typewriter logic hook
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page with layered components
│   └── globals.css             # Global styles with Tailwind directives
├── public/
│   └── assets/
│       └── headshot.jpeg       # Profile headshot image
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.mjs          # PostCSS configuration
├── next.config.ts              # Next.js configuration
└── eslint.config.mjs           # ESLint configuration
```

## Development Commands
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

### PixelBlast Background
- **Location**: `app/components/PixelBlast.tsx`
- **Purpose**: Interactive WebGL background with procedural pixel-based animation
- **Features**:
  - Diamond-shaped pixel pattern (default)
  - Interactive ripple effects on click
  - Procedural noise-based animation using FBM
  - Bayer dithering for retro aesthetic
  - Customizable colors, patterns, and effects
  - Optional liquid distortion effects
  - Edge fade for seamless integration
- **Default Settings**:
  - Variant: Diamond
  - Color: #B19EEF (purple)
  - Ripples: Enabled
  - Transparent: false (solid background)
  - Pixel Size: 3

### FuzzyText Component
- **Location**: `app/components/FuzzyText.tsx`
- **Purpose**: Canvas-based text with fuzzy/glitchy visual effect
- **Features**:
  - Per-scanline horizontal displacement for fuzzy effect
  - Interactive hover that increases fuzz intensity
  - **Dynamic text support**: Responds to text changes in real-time
  - Dual-effect architecture: separate text rendering and animation loops
  - Responsive font sizing with CSS clamp
  - Precise text bounding box calculations
  - Touch and mouse support
  - Font style support (normal, italic, etc.)
- **Default Settings**:
  - fontSize: `clamp(3rem, 10vw, 6rem)`
  - fontWeight: 700
  - fontStyle: 'normal'
  - color: #ffffff
  - baseIntensity: 0.18 (subtle fuzz at rest)
  - hoverIntensity: 0.5 (more pronounced on hover)
- **Usage**: Main name "ben little." centered on screen with hover interaction
- **Technical Implementation**:
  - Effect 1: Renders text to offscreen canvas (re-runs when children change)
  - Effect 2: Continuous fuzzy animation loop using offscreen canvas
  - Uses state-based revision counter to trigger animation updates

### useTypewriter Hook
- **Location**: `app/hooks/useTypewriter.ts`
- **Purpose**: Reusable typewriter animation logic
- **Features**:
  - Progressive character reveal with configurable speed
  - Support for multiple sentences with looping
  - Deleting/backspace animation
  - Variable speed typing (randomized)
  - Reverse mode (types backwards)
  - Intersection observer for visibility-based triggering
  - Sentence completion callbacks
- **Returns**: `{ displayedText, currentTextIndex, isDeleting, isVisible }`
- **Usage**: Used by FuzzyTypewriter to provide typed text

### FuzzyTypewriter Component
- **Location**: `app/components/FuzzyTypewriter.tsx`
- **Purpose**: Combined typewriter + fuzzy visual effect
- **Features**:
  - Merges useTypewriter hook with FuzzyText rendering
  - Text types out character by character with fuzzy/glitchy effect
  - Each character appears with scanline displacement
  - Static fuzzy intensity (no hover interaction)
  - Optional blinking cursor
  - Font style support (normal, italic, etc.)
- **Default Settings**:
  - typingSpeed: 50ms
  - loop: false
  - fuzzyIntensity: 0.18
  - showCursor: true
  - cursorCharacter: '|'
- **Usage**: Subtitle "but you can call me BL..." appears on hover with white, italicized text and subtle fuzzy effect
- **Technical Achievement**: Successfully combines state-driven animation (typewriter) with continuous canvas rendering (fuzzy effect)

### ASCIIText Component (Optional)
- **Location**: `app/components/ASCIIText.tsx`
- **Purpose**: 3D ASCII art text with WebGL rendering
- **Features**:
  - 3D text plane with wave animations
  - Mouse-tracking rotation effects
  - Dynamic hue rotation based on mouse position
  - Gradient color effect using mix-blend-mode
  - IBM Plex Mono font for retro aesthetic
- **Note**: Currently commented out in favor of FuzzyText

### ScrambledText Component
- **Location**: `app/components/ScrambledText.tsx`
- **Purpose**: GSAP-based text animation with scramble effect on hover
- **Features**:
  - Uses GSAP SplitText plugin to split text into words and characters
  - Scrambles text characters on mouse hover proximity
  - Configurable scramble characters, duration, speed, and radius
  - Words wrapped as non-breaking inline-block units to prevent mid-word wrapping
  - Characters set to inline display for proper text flow
  - Monospace font with responsive sizing
- **Default Settings**:
  - radius: 100px (hover detection radius)
  - duration: 1.2s
  - speed: 0.5
  - scrambleChars: '.:'
  - fontSize: `clamp(14px, 4vw, 32px)`
- **Usage**: Bio text in ProfileSection with hover scramble effect
- **Technical Implementation**:
  - Splits by both words and chars: `type: 'words,chars'`
  - Words: `display: inline-block`, `whiteSpace: nowrap`, `wordBreak: keep-all`
  - Characters: `display: inline` to stay together within word containers
  - Prevents words from breaking across lines while maintaining text flow

### PixelTransition Component
- **Location**: `app/components/PixelTransition.tsx`
- **Purpose**: Animated pixel-based transition between two content states
- **Features**:
  - Grid-based pixel reveal/hide animation
  - Intersection observer triggers animation on scroll
  - Customizable grid size and pixel color
  - Support for any React content as first/second content
  - Configurable aspect ratio
  - Optional single-run or repeating animation
- **Default Settings**:
  - gridSize: 20 (20x20 grid)
  - pixelColor: '#000000' (black)
  - animationStepDuration: 0.4s
  - once: false (repeats on each view)
  - aspectRatio: '100%' (square)
- **Usage**: Headshot image transition in ProfileSection (toggles between headshot and "That's Me!" text)

### ProfileSection Component
- **Location**: `app/components/ProfileSection.tsx`
- **Purpose**: Portfolio profile section with headshot and bio
- **Layout**:
  - Horizontal flex layout with centered container (max-w-[1800px])
  - Headshot on left using PixelTransition effect (400-500px width)
  - Bio text on right using multiple ScrambledText components
- **Content**:
  - Personal introduction and background (Queen's University, Toronto)
  - Interests and passions (business, finance, AI, software, data science, UI/UX)
  - Personal hobbies (rock-climbing, outdoors, traveling, cooking)
- **Features**:
  - Three separate ScrambledText paragraphs for proper spacing (gap-8)
  - Each paragraph independently scrambles on hover
  - PixelTransition toggles between headshot and "That's Me!" card with black background
  - Responsive sizing and layout
  - pointer-events-auto for interactivity
- **Settings**:
  - Container: max-w-[1800px], gap-12, centered with mx-auto
  - Bio text: max-w-[1200px], text-lg, gap-8 between paragraphs
  - ScrambledText: radius 120, duration 1.5s, speed 0.6
  - PixelTransition: gridSize 20, black pixels

### Layout Structure & Pointer Events
The page uses a sophisticated layered approach with selective pointer-events:

```
Layer Stack (bottom to top):
┌─────────────────────────────────────────┐
│ PixelBlast Background (z-0)             │
│ - Fixed fullscreen                      │
│ - Receives click events for ripples     │
└─────────────────────────────────────────┘
            ↑ (clicks pass through)
┌─────────────────────────────────────────┐
│ Text Overlay Container (z-20)           │
│ - pointer-events-none on container      │
│ - pointer-events-auto on canvas only    │
│ - Allows interaction with both layers   │
└─────────────────────────────────────────┘
            ↑ (content layer)
┌─────────────────────────────────────────┐
│ Content Layer (z-10)                    │
│ - pointer-events-none by default        │
│ - Add pointer-events-auto to children   │
└─────────────────────────────────────────┘
```

**Key Pattern**:
- Container divs use `pointer-events-none` to allow clicks to pass through
- Individual interactive elements use `pointer-events-auto` to capture their own events
- This enables both background ripples AND text hover effects simultaneously

## Current State

### Section 1: Hero
- Interactive WebGL pixel background implemented (PixelBlast)
- Main heading "ben little." with fuzzy effect and hover interaction (FuzzyText)
- Hover-triggered subtitle "but you can call me BL..." with combined typewriter + fuzzy effect (FuzzyTypewriter)
- Diamond-shaped pixel pattern with click-based ripple effects
- Triple-layer interaction:
  - Background ripples on click
  - Main text hover increases fuzz intensity
  - Subtitle appears and types out on main text hover
- Responsive fullscreen layout with proper z-index layering
- Event handling optimized for touch and mouse interaction
- Pointer-events architecture allows layered interactivity
- Absolute positioning keeps main text anchored while subtitle appears below

### Section 2: Profile
- ProfileSection component with headshot and bio
- Headshot with PixelTransition effect (black pixels, 20x20 grid)
- Transition toggles between headshot and "That's Me!" text on black background
- Three-paragraph bio with ScrambledText hover effects
- Personal introduction covering education, interests, and hobbies
- Horizontal layout with centered container (1800px max)
- Text wrapping optimized to prevent mid-word breaks
- Responsive design with proper spacing (gap-8 between paragraphs)

## Technical Achievements
- **Layered Interactivity**: Successfully implemented overlapping interactive components without blocking each other's events
- **Combined Effects**: Merged state-driven typewriter animation with continuous canvas rendering for FuzzyTypewriter
  - Solved dynamic text rendering challenge with dual-effect architecture
  - Uses revision counter to sync React state changes with canvas updates
  - Each typed character appears with real-time fuzzy/glitchy effect
- **WebGL Optimization**: PixelBlast uses custom GLSL shaders for efficient rendering
- **Canvas Effects**: FuzzyText uses per-scanline displacement for retro glitch aesthetic
- **GSAP SplitText Integration**: ScrambledText component with proper word wrapping
  - Splits text by both words and characters for character-level animation
  - Words wrapped as `inline-block` with `whiteSpace: nowrap` to prevent mid-word breaks
  - Characters set to `display: inline` for proper text flow within words
  - Dynamically applies styles via JavaScript for precise control
  - Maintains text readability while enabling interactive scramble effects
- **Modular Composition**: Created reusable useTypewriter hook that can be combined with any visual component
- **Responsive Design**: Text sizing adapts to viewport width using CSS clamp
- **Performance**: Efficient re-rendering strategy prevents unnecessary canvas updates while maintaining smooth animations
- **Multi-Section Layout**: Two distinct sections (Hero and Profile) with consistent background and smooth scrolling

## Next Steps
- Add more portfolio sections (projects, experience, skills)
- Implement navigation between sections
- Add project showcases with interactive demos
- Add contact form or social links section
- Optimize performance for production
- Consider animation transitions between sections
- Add accessibility features (keyboard navigation, screen reader support)
- Consider mobile responsiveness for ProfileSection layout
- Add navigation dock or menu for easy section access

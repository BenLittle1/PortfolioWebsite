# Portfolio Website

Terminal-first portfolio built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Three.js, and `postprocessing`. The live homepage is no longer the old scrolling multi-section layout; it is an interactive terminal experience over a full-screen WebGL background.

## Commands
- `npm run dev` - Start the dev server
- `npm run build` - Create a production build
- `npm run start` - Run the production server
- `npm run lint` - Run linting

## Active Routes
- `/` - Main landing page with fixed `PixelBlast` background and `TerminalPortfolioExperience`
- `/terminal` - Terminal-only route with its own metadata

## Current Structure
```text
app/
├── layout.tsx                         # Metadata + Syne / Space Mono font setup
├── page.tsx                           # Active homepage wrapper
├── terminal/page.tsx                  # Alternate terminal route
├── globals.css                        # Global full-screen styles and theme utilities
├── components/
│   ├── TerminalPortfolioExperience.tsx # Portfolio-specific command resolver + quick actions
│   ├── PixelBlast.tsx                 # Three.js background effect
│   ├── ASCIIText.tsx                  # Visual utility component
│   ├── ContactSection.tsx             # Legacy section component
│   ├── CurrentSection.tsx             # Legacy section component
│   ├── DecryptedText.tsx              # Visual utility component
│   ├── FuzzyText.tsx                  # Visual utility component
│   ├── FuzzyTypewriter.tsx            # Visual utility component
│   ├── Navigation.tsx                 # Legacy navigation
│   ├── PixelTransition.tsx            # Visual utility component
│   ├── ProfileSection.tsx             # Legacy profile section
│   ├── ProjectsSection.tsx            # Legacy projects section
│   ├── RasterSplit.tsx                # Legacy image reveal interaction
│   ├── ScrambledText.tsx              # Legacy GSAP text effect
│   └── archive/                       # Preserved old pixelated-profile variants
├── hooks/
│   └── useTypewriter.ts               # Typewriter hook used by visual experiments
└── lib/
    └── portfolio-terminal-data.ts     # Source of truth for portfolio content
components/
└── ui/
    └── terminal.tsx                   # Reusable terminal renderer
lib/
└── utils.ts                           # `cn()` helper
public/assets/
├── headshot.jpeg
├── dog.jpeg
└── Resume - Benjamin Little.pdf
```

## Canonical Content Sources
- `app/lib/portfolio-terminal-data.ts` is the live source of truth for bio, projects, focus, skills, interests, contact info, links, and quick actions.
- `app/page.tsx` and `app/terminal/page.tsx` define the active route composition.
- `components/ui/terminal.tsx` owns terminal rendering behavior, inline links/images, command playback, and interactive input handling.
- `personal-content.md` is stale reference content, not the live UI source.

## Current Experience
- The homepage fills the viewport and keeps scrolling disabled at the document level.
- `PixelBlast` renders as a fixed background with a green accent (`#5efc8d`) and transparent compositing.
- `TerminalPortfolioExperience` boots with scripted commands: `whoami`, `cat about.md`, and `ls`.
- The terminal accepts both exact commands and simplified natural-language prompts such as "show me your projects".

## Supported Terminal Commands
- `help`
- `whoami`
- `ls`
- `cat about.md`
- `cat focus.md`
- `cat projects.md`
- `project stensyl`
- `project spotifygraphs`
- `project googlewordcloud`
- `project hapticmaps`
- `cat skills.md`
- `cat interests.md`
- `cat contact.md`
- `cat headshot.jpg`
- `dog`
- `open resume`
- `open github`
- `open linkedin`
- `clear`

## Design Notes
- Fonts: `Syne` for display, `Space Mono` for body/terminal text
- Active visual direction: black background with emerald/lime terminal tones
- Secondary accent: lavender (`#B19EEF`) remains in Tailwind theme tokens and text-selection styling
- The live experience is terminal-first, not section-first

## Current Personal Data
- Name: Benjamin Little (`BL`)
- Headline: Commerce & Computer Science Student
- School: Queen's University
- Location: Kingston, Ontario
- Primary email: `ben.little@queensu.ca`
- Other emails: `benlittle.dev@gmail.com`, `benjamin.little@axl.vc`
- GitHub: `https://github.com/BenLittle1`
- LinkedIn: `https://www.linkedin.com/in/benjamin-little1`

## Current Focus
- Queen's University
- Labs & Venture Teams @ AXL
- Building `stensyl`

## Current Project Index
- `stensyl`
- `SpotifyGraphs`
- `GoogleWordCloud`
- `HapticMaps`

## Legacy / Experimental Files
- `Navigation.tsx`, `ProfileSection.tsx`, `ProjectsSection.tsx`, `CurrentSection.tsx`, `ContactSection.tsx`, `RasterSplit.tsx`, `ScrambledText.tsx`, and related visual components reflect the older scroll-based portfolio direction.
- `app/page 2.tsx`, `app/page 3.tsx`, `app/components/ProfileSection 2.tsx`, and `app/components/RasterSplit 2.tsx` are duplicate or experimental files and are not part of the active import graph.
- `app/components/archive/` intentionally stores preserved older implementations.

## Editing Guidance
- For copy or portfolio data changes, edit `app/lib/portfolio-terminal-data.ts` first.
- For route-level presentation changes, start with `app/page.tsx` and `app/terminal/page.tsx`.
- For terminal interaction changes, edit `components/ui/terminal.tsx` and `app/components/TerminalPortfolioExperience.tsx`.
- Do not assume the old section-based homepage is still live unless it is explicitly reconnected.

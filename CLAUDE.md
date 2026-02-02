# Portfolio Website

Next.js 15 portfolio with TypeScript, Tailwind CSS, Three.js, and GSAP.

## Commands
- `npm run dev` - Dev server
- `npm run build` - Production build

## Structure
```
app/
├── components/
│   ├── PixelBlast.tsx      # WebGL background with ripples
│   ├── FuzzyText.tsx       # Glitchy scanline text effect
│   ├── FuzzyTypewriter.tsx # Typewriter + fuzzy effect
│   ├── ScrambledText.tsx   # GSAP text scramble on hover
│   ├── RasterSplit.tsx     # Interactive image mosaic reveal
│   ├── ProfileSection.tsx  # About section with headshot
│   └── Navigation.tsx      # Sticky nav with mobile menu
├── page.tsx                # All sections
└── globals.css
public/assets/
├── headshot.jpeg
└── Resume - Benjamin Little.pdf
```

## Design
- **Fonts:** Syne (display), Space Mono (body)
- **Colors:** Black bg, white text, lavender accent (#B19EEF)

## Sections
1. **Hero** - FuzzyText name, subtitle, social links
2. **About** - RasterSplit headshot with "Hover to Reveal" overlay, ScrambledText bio
3. **What I'm Up To** - 3 activity cards (Queen's, AXL, stensyl)
4. **Projects** - 2x2 grid (stensyl, SpotifyGraphs, GoogleWordCloud, HapticMaps)
5. **Contact** - Email CTA, social links, footer

## Key Patterns
- `pointer-events-none` on containers, `pointer-events-auto` on interactive children
- IntersectionObserver for scroll-triggered animations
- requestAnimationFrame for smooth RasterSplit rendering

## Personal Info
- **Name:** Benjamin Little (BL)
- **School:** Queen's University - Commerce & Computer Science
- **Location:** Kingston, Ontario
- **Email:** ben.little@queensu.ca
- **GitHub:** github.com/BenLittle1
- **LinkedIn:** linkedin.com/in/benjamin-little1

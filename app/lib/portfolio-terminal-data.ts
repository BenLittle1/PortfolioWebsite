export type PortfolioActivity = {
  title: string;
  highlight: string;
  description: string;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  technologies: string[];
  status: string;
  github?: string;
  live?: string;
};

export type TerminalQuickStart = {
  label: string;
  command: string;
  description: string;
};

export const portfolioProfile = {
  name: "Benjamin Little",
  shortName: "BL",
  headline: "Commerce & Computer Science Student",
  school: "Queen's University",
  location: "Kingston, Ontario",
  email: "ben.little@queensu.ca",
  github: "https://github.com/BenLittle1",
  linkedin: "https://www.linkedin.com/in/benjamin-little1",
  resume: "/assets/Resume - Benjamin Little.pdf",
  headshot: "/assets/headshot.jpeg",
  dogPhoto: "/assets/dog.jpeg",
  summary:
    "I build at the intersection of AI, product, finance, and venture creation. I like turning messy ideas into clear products that people can actually use.",
  longerBio: [
    "I'm a Commerce & Computer Science student at Queen's University who likes pairing technical depth with business intuition.",
    "A lot of my work lives where software, venture building, and AI overlap: products with real users, clear feedback loops, and room to iterate fast.",
    "Outside of building, I'm usually climbing, travelling, cooking, or chasing new ideas with friends.",
  ],
};

export const currentFocus: PortfolioActivity[] = [
  {
    title: "Queen's University",
    highlight: "Student",
    description:
      "Studying Commerce & Computer Science while blending business strategy with hands-on technical work.",
  },
  {
    title: "Labs & Venture Teams @ AXL",
    highlight: "AI Venture Studio",
    description:
      "Working at the intersection of AI and entrepreneurship, helping explore and launch new venture ideas.",
  },
  {
    title: "Building stensyl",
    highlight: "Founder",
    description:
      "Designing a social platform for students to track study habits, stay accountable, and share progress with friends.",
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "stensyl",
    title: "stensyl",
    tagline: "Where studying meets social media",
    description:
      "A social study-tracking product for students. It combines accountability, habit data, and progress sharing in one mobile experience.",
    technologies: [
      "React Native",
      "Expo",
      "TypeScript",
      "Node.js",
      "Express",
      "SQL",
      "Supabase",
    ],
    status: "Building",
  },
  {
    slug: "spotifygraphs",
    title: "SpotifyGraphs",
    tagline: "Visualize your listening habits",
    description:
      "An interactive data visualization tool that turns Spotify listening history into graphs and trend insights.",
    technologies: ["TypeScript", "Spotify API", "Data Visualization"],
    status: "Shipped",
    github: "https://github.com/BenLittle1/SpotifyGraphs",
  },
  {
    slug: "googlewordcloud",
    title: "GoogleWordCloud",
    tagline: "Transform your data into art",
    description:
      "A web app that generates dynamic word clouds from Google data sources to reveal patterns in language and usage.",
    technologies: ["JavaScript", "Google APIs", "Canvas"],
    status: "Shipped",
    github: "https://github.com/BenLittle1/GoogleWordCloud",
  },
  {
    slug: "hapticmaps",
    title: "HapticMaps",
    tagline: "Navigate through touch",
    description:
      "An iOS app that uses haptic feedback to make navigation more intuitive and accessible through tactile cues.",
    technologies: ["Swift", "iOS", "MapKit", "Core Haptics"],
    status: "Prototype",
    github: "https://github.com/BenLittle1/HapticMaps",
  },
];

export const coreSkills = [
  "AI product exploration",
  "Software development",
  "TypeScript",
  "React Native",
  "Data visualization",
  "UI/UX design",
  "Finance and business development",
];

export const interests = [
  "AI",
  "venture creation",
  "product strategy",
  "software development",
  "data science",
  "UI/UX",
  "rock climbing",
  "travelling",
  "cooking",
];

export const terminalQuickStarts: TerminalQuickStart[] = [
  {
    label: "Who is Ben?",
    command: "whoami",
    description: "Quick intro, current context, and what he likes building.",
  },
  {
    label: "Show the headshot",
    command: "cat headshot.jpg",
    description: "Render Ben's headshot inline inside the terminal.",
  },
  {
    label: "Show the dog",
    command: "dog",
    description: "Render Ben's dog photo inline inside the terminal.",
  },
  {
    label: "What is he up to?",
    command: "cat focus.md",
    description: "School, AXL, and the current build cycle around stensyl.",
  },
  {
    label: "Show the project index",
    command: "cat projects.md",
    description: "A concise project directory with deeper commands to try next.",
  },
  {
    label: "What does he work on?",
    command: "cat skills.md",
    description: "A fast read on technical interests, product instincts, and range.",
  },
  {
    label: "How do I reach him?",
    command: "cat contact.md",
    description: "Email, LinkedIn, GitHub, and the resume link in one place.",
  },
  {
    label: "Open the resume",
    command: "open resume",
    description: "Surface the PDF path and make the next click obvious.",
  },
  {
    label: "Clear the terminal",
    command: "clear",
    description: "Reset the terminal output and start fresh.",
  },
];

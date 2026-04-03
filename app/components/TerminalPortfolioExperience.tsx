"use client";

import {
  Terminal,
  type TerminalCommandResult,
  type TerminalOutputLike,
} from "@/components/ui/terminal";
import {
  coreSkills,
  currentFocus,
  interests,
  portfolioContactEmails,
  portfolioProfile,
  portfolioProjects,
  terminalQuickStarts,
} from "@/app/lib/portfolio-terminal-data";

function linkOutput(
  content: string,
  href: string,
  external = false,
): TerminalOutputLike {
  return {
    content,
    href,
    external,
    tone: "accent",
  };
}

function imageOutput(
  src: string,
  alt: string,
  content?: string,
): TerminalOutputLike {
  return {
    imageSrc: src,
    imageAlt: alt,
    content,
  };
}

function normalizeCommand(rawCommand: string) {
  return rawCommand.trim().toLowerCase();
}

function simplifyNaturalLanguage(rawCommand: string) {
  return normalizeCommand(rawCommand)
    .replace(/[^\w\s./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferPortfolioCommand(rawCommand: string) {
  const simplified = simplifyNaturalLanguage(rawCommand);

  if (!simplified) {
    return null;
  }

  if (
    simplified.includes("dog") ||
    simplified.includes("puppy")
  ) {
    return "dog";
  }

  if (
    simplified.includes("headshot") ||
    simplified.includes("photo") ||
    simplified.includes("picture") ||
    simplified.includes("image") ||
    simplified.includes("what do you look like")
  ) {
    return "cat headshot.jpg";
  }

  if (
    simplified.includes("who are you") ||
    simplified.includes("whoami") ||
    simplified.includes("intro") ||
    simplified.includes("quick intro")
  ) {
    return "whoami";
  }

  if (
    simplified.includes("about you") ||
    simplified.includes("about yourself") ||
    simplified.includes("tell me about you") ||
    simplified.includes("tell me about yourself")
  ) {
    return "cat about.md";
  }

  if (
    simplified.includes("what are you up to") ||
    simplified.includes("what are you working on") ||
    simplified.includes("current focus") ||
    simplified.includes("what are you doing now")
  ) {
    return "cat focus.md";
  }

  if (
    simplified.includes("projects") ||
    simplified.includes("project index") ||
    simplified.includes("show project")
  ) {
    return "cat projects.md";
  }

  if (simplified.includes("stensyl")) {
    return "project stensyl";
  }

  if (simplified.includes("spotifygraphs") || simplified.includes("spotify graphs")) {
    return "project spotifygraphs";
  }

  if (simplified.includes("hapticmaps") || simplified.includes("haptic maps")) {
    return "project hapticmaps";
  }

  if (
    simplified.includes("googlewordcloud") ||
    simplified.includes("google word cloud") ||
    simplified.includes("word cloud")
  ) {
    return "project googlewordcloud";
  }

  if (
    simplified.includes("skills") ||
    simplified.includes("what are you good at") ||
    simplified.includes("what do you work on")
  ) {
    return "cat skills.md";
  }

  if (
    simplified.includes("interests") ||
    simplified.includes("what do you like") ||
    simplified.includes("outside of work")
  ) {
    return "cat interests.md";
  }

  if (
    simplified.includes("contact") ||
    simplified.includes("reach you") ||
    simplified.includes("get in touch") ||
    simplified.includes("email you")
  ) {
    return "cat contact.md";
  }

  if (simplified.includes("resume") || simplified.includes("cv")) {
    return "open resume";
  }

  if (simplified.includes("github")) {
    return "open github";
  }

  if (simplified.includes("linkedin")) {
    return "open linkedin";
  }

  return null;
}

function getPortfolioCommandResult(command: string): TerminalCommandResult | null {
  const normalized = normalizeCommand(command);

  if (!normalized) {
    return { outputs: [] };
  }

  if (normalized === "clear" || normalized === "reset") {
    return {
      clear: true,
      outputs: [],
    };
  }

  if (normalized === "help" || normalized === "?") {
    return {
      outputs: [
        { content: "Available commands", tone: "accent" },
        { content: "whoami / ls / cat about.md / cat focus.md / cat projects.md" },
        { content: "project stensyl / project spotifygraphs / project hapticmaps" },
        { content: "cat skills.md / cat interests.md / cat contact.md / cat headshot.jpg / dog" },
        { content: "open resume / open github / open linkedin / clear" },
        {
          content: "Use the quick actions below or type your own command.",
          tone: "muted",
        },
        {
          content: "Plain English works too: `show me your projects` or `what do you look like`.",
          tone: "muted",
        },
      ],
    };
  }

  if (normalized === "ls" || normalized === "dir") {
    return {
      outputs: [
        { content: "about.md      focus.md      skills.md", tone: "accent" },
        { content: "contact.md    interests.md  projects.md", tone: "accent" },
        { content: "headshot.jpg", tone: "accent" },
        { content: "dog.jpeg", tone: "accent" },
        { content: "resume.pdf", tone: "accent" },
      ],
    };
  }

  if (normalized === "whoami") {
    return {
      outputs: [
        { content: `${portfolioProfile.name} (${portfolioProfile.shortName})`, tone: "accent" },
        {
          content: `${portfolioProfile.headline} @ ${portfolioProfile.school}`,
          tone: "success",
        },
        portfolioProfile.summary,
        { content: `location    ${portfolioProfile.location}`, tone: "muted" },
      ],
    };
  }

  if (normalized === "about" || normalized === "cat about.md") {
    return {
      outputs: portfolioProfile.longerBio.map((line, index) => ({
        content: line,
        tone: index === 0 ? "accent" : "default",
      })),
    };
  }

  if (normalized === "focus" || normalized === "now" || normalized === "cat focus.md") {
    return {
      outputs: currentFocus.flatMap((item, index) => [
        {
          content: `${item.title} :: ${item.highlight}`,
          tone: index === 0 ? "accent" : "success",
        },
        item.description,
      ]),
    };
  }

  if (normalized === "projects" || normalized === "cat projects.md") {
    return {
      outputs: [
        { content: "project index", tone: "accent" },
        ...portfolioProjects.map(
          (project): TerminalOutputLike => ({
            content: `${project.slug.padEnd(17, " ")} ${project.tagline}`,
            tone: project.slug === "stensyl" ? "success" : "default",
          }),
        ),
        {
          content: "Run `project <name>` for the detail view.",
          tone: "muted",
        },
      ],
    };
  }

  if (normalized.startsWith("project ")) {
    const slug = normalized.replace("project ", "").trim();
    const project = portfolioProjects.find((item) => item.slug === slug);

    if (!project) {
      return {
        outputs: [
          { content: `Project not found: ${slug}`, tone: "warning" },
          {
            content: "Try `project stensyl`, `project spotifygraphs`, or `cat projects.md`.",
            tone: "muted",
          },
        ],
      };
    }

    const outputs: TerminalOutputLike[] = [
      { content: `${project.title} :: ${project.tagline}`, tone: "accent" },
      { content: `status      ${project.status}`, tone: "success" },
      { content: `summary     ${project.description}` },
      { content: `stack       ${project.technologies.join(" / ")}`, tone: "muted" },
    ];

    if (project.github) {
      outputs.push(linkOutput(`github      ${project.github}`, project.github, true));
    }

    if (project.live) {
      outputs.push(linkOutput(`live        ${project.live}`, project.live, true));
    }

    return { outputs };
  }

  if (normalized === "skills" || normalized === "cat skills.md") {
    return {
      outputs: [
        { content: "core strengths", tone: "accent" },
        coreSkills.join(" / "),
        {
          content:
            "I like work that mixes product clarity, technical depth, and strong interface decisions.",
          tone: "muted",
        },
      ],
    };
  }

  if (normalized === "interests" || normalized === "cat interests.md") {
    return {
      outputs: [
        { content: "interests", tone: "accent" },
        interests.join(" / "),
      ],
    };
  }

  if (normalized === "contact" || normalized === "cat contact.md") {
    return {
      outputs: [
        ...portfolioContactEmails.map(({ label, address }) =>
          linkOutput(`${label.padEnd(10, " ")} ${address}`, `mailto:${address}`),
        ),
        linkOutput(`github     ${portfolioProfile.github}`, portfolioProfile.github, true),
        linkOutput(`linkedin   ${portfolioProfile.linkedin}`, portfolioProfile.linkedin, true),
        linkOutput(`resume     ${portfolioProfile.resume}`, portfolioProfile.resume, true),
      ],
    };
  }

  if (
    normalized === "headshot" ||
    normalized === "show headshot" ||
    normalized === "cat headshot.jpg"
  ) {
    return {
      outputs: [
        { content: "headshot preview", tone: "accent" },
        imageOutput(
          portfolioProfile.headshot,
          `${portfolioProfile.name} headshot`,
          "headshot.jpeg",
        ),
      ],
    };
  }

  if (
    normalized === "dog" ||
    normalized === "show dog" ||
    normalized === "cat dog.jpeg" ||
    normalized === "cat dog.jpg" ||
    normalized === "puppy"
  ) {
    return {
      outputs: [
        { content: "dog preview", tone: "accent" },
        imageOutput(
          portfolioProfile.dogPhoto,
          `${portfolioProfile.name} dog`,
          "dog.jpeg",
        ),
      ],
    };
  }

  if (normalized === "open resume" || normalized === "resume" || normalized === "cat resume.pdf") {
    return {
      outputs: [
        { content: "resume.pdf ready", tone: "success" },
        linkOutput(`open       ${portfolioProfile.resume}`, portfolioProfile.resume, true),
      ],
    };
  }

  if (normalized === "open github" || normalized === "github") {
    return {
      outputs: [
        { content: "github profile", tone: "success" },
        linkOutput(`open       ${portfolioProfile.github}`, portfolioProfile.github, true),
      ],
    };
  }

  if (normalized === "open linkedin" || normalized === "linkedin") {
    return {
      outputs: [
        { content: "linkedin profile", tone: "success" },
        linkOutput(`open       ${portfolioProfile.linkedin}`, portfolioProfile.linkedin, true),
      ],
    };
  }

  return null;
}

function resolvePortfolioCommand(rawCommand: string): TerminalCommandResult {
  const normalized = normalizeCommand(rawCommand);

  if (!normalized) {
    return { outputs: [] };
  }

  const directResult = getPortfolioCommandResult(normalized);
  if (directResult) {
    return directResult;
  }

  const inferredCommand = inferPortfolioCommand(normalized);
  if (inferredCommand) {
    const inferredResult = getPortfolioCommandResult(inferredCommand);

    if (inferredResult) {
      return {
        ...inferredResult,
        outputs: inferredResult.clear
          ? inferredResult.outputs
          : [
              {
                content: `Interpreting input as \`${inferredCommand}\``,
                tone: "muted",
              },
              ...(inferredResult.outputs ?? []),
            ],
      };
    }
  }

  return {
    outputs: [
      { content: `Command not found: ${rawCommand}`, tone: "warning" },
      {
        content: "Try `help`, `whoami`, `cat projects.md`, or plain English like `show me your projects`.",
        tone: "muted",
      },
    ],
  };
}

const introCommands = ["whoami", "cat about.md", "ls"];

const introOutputs = Object.fromEntries(
  introCommands.map((command, index) => [
    index,
    resolvePortfolioCommand(command).outputs ?? [],
  ]),
) satisfies Record<number, TerminalOutputLike[]>;

const quickActions = terminalQuickStarts.map((item) => ({
  label:
    item.command === "dog"
      ? "dog"
      : item.command === "cat headshot.jpg"
      ? "photo"
      : item.command === "clear"
        ? "clear"
      : item.command === "cat focus.md"
      ? "focus"
      : item.command === "cat projects.md"
        ? "projects"
        : item.command === "cat skills.md"
          ? "skills"
          : item.command === "cat contact.md"
            ? "contact"
            : item.command === "open resume"
              ? "resume"
              : "whoami",
  command: item.command,
}));

interface TerminalPortfolioExperienceProps {
  embedded?: boolean;
  solidBackground?: boolean;
}

export default function TerminalPortfolioExperience({
  embedded = false,
  solidBackground = true,
}: TerminalPortfolioExperienceProps) {
  if (embedded) {
    return (
      <div className="w-full">
        <Terminal
          commands={introCommands}
          outputs={introOutputs}
          username="bl@portfolio"
          typingSpeed={58}
          interactiveTypingSpeed={42}
          delayBetweenCommands={1200}
          initialDelay={650}
          scriptedOutputLineDelay={200}
          enableSound={false}
          interactive
          onCommand={resolvePortfolioCommand}
          quickActions={quickActions}
          className="max-w-5xl px-0 text-sm md:text-[14px]"
          contentClassName="h-[18rem] md:h-[26rem]"
        />
      </div>
    );
  }

  return (
    <section
      className={`flex h-screen overflow-hidden items-center justify-center px-3 py-4 md:px-6 md:py-6 ${
        solidBackground ? "bg-black" : "bg-transparent"
      }`}
    >
      <Terminal
        commands={introCommands}
        outputs={introOutputs}
        username="bl@portfolio"
        typingSpeed={58}
        interactiveTypingSpeed={42}
        delayBetweenCommands={1200}
        initialDelay={650}
        scriptedOutputLineDelay={200}
        enableSound={false}
        interactive
        onCommand={resolvePortfolioCommand}
        quickActions={quickActions}
        className="max-w-[min(92vw,60rem)] px-0 text-sm"
        contentClassName="h-[min(30rem,58vh)] md:h-[min(38rem,64vh)]"
      />
    </section>
  );
}

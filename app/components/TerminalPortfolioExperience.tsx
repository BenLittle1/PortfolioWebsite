"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Terminal,
  type TerminalInteractiveSelection,
  type TerminalCommandResult,
  type TerminalOutputLike,
  type TerminalQuickAction,
} from "@/components/ui/terminal";
import {
  coreSkills,
  currentFocus,
  interests,
  portfolioContactEmails,
  portfolioProfile,
  portfolioProjects,
} from "@/app/lib/portfolio-terminal-data";
import {
  portfolioTerminalThemes,
  resolvePortfolioTerminalTheme,
  type PortfolioTerminalTheme,
  type PortfolioTerminalThemeId,
} from "@/app/lib/portfolio-terminal-themes";

const SESSION_DELETED_FILES_KEY = "portfolio-terminal-deleted-files";
const SESSION_DELETE_NOTICE_KEY = "portfolio-terminal-delete-notice-seen";
const LS_COLUMN_WIDTH = 16;

const virtualFiles = [
  "about.md",
  "focus.md",
  "skills.md",
  "contact.md",
  "interests.md",
  "projects.md",
  "headshot.jpg",
  "dog.jpeg",
  "resume.pdf",
] as const;

type VirtualFileName = (typeof virtualFiles)[number];

const virtualFileAliases: Record<string, VirtualFileName> = {
  "about.md": "about.md",
  "focus.md": "focus.md",
  "skills.md": "skills.md",
  "contact.md": "contact.md",
  "interests.md": "interests.md",
  "projects.md": "projects.md",
  "headshot.jpg": "headshot.jpg",
  "headshot.jpeg": "headshot.jpg",
  "dog.jpeg": "dog.jpeg",
  "dog.jpg": "dog.jpeg",
  "resume.pdf": "resume.pdf",
};

type RemovalPlan = {
  hadTargets: boolean;
  removed: VirtualFileName[];
  missing: string[];
};

const themeCommandOptionsLabel = portfolioTerminalThemes
  .map((theme) => theme.label.toLowerCase())
  .join("|");

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
  imageEffect?: "zoomies",
): TerminalOutputLike {
  return {
    imageSrc: src,
    imageAlt: alt,
    content,
    imageEffect,
  };
}

function normalizeCommand(rawCommand: string) {
  return rawCommand.trim().toLowerCase();
}

function isVirtualFileName(value: string): value is VirtualFileName {
  return (virtualFiles as readonly string[]).includes(value);
}

function readDeletedFilesFromSession(): VirtualFileName[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_DELETED_FILES_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return Array.from(
      new Set(
        parsed.filter(
          (item): item is VirtualFileName =>
            typeof item === "string" && isVirtualFileName(item),
        ),
      ),
    );
  } catch {
    return [];
  }
}

function readDeleteNoticeSeenFromSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(SESSION_DELETE_NOTICE_KEY) === "1";
}

function simplifyNaturalLanguage(rawCommand: string) {
  return normalizeCommand(rawCommand)
    .replace(/[^\w\s./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getVisibleVirtualFiles(deletedFiles: Set<VirtualFileName>) {
  return virtualFiles.filter((file) => !deletedFiles.has(file));
}

function getDirectoryListingOutputs(
  deletedFiles: Set<VirtualFileName>,
): TerminalOutputLike[] {
  const visibleFiles = getVisibleVirtualFiles(deletedFiles);

  if (visibleFiles.length === 0) {
    return [
      { content: "directory empty", tone: "warning" },
      {
        content: "You deleted every visible file. The shell finds this deeply suspicious.",
        tone: "muted",
      },
    ];
  }

  const outputs: TerminalOutputLike[] = [];

  for (let index = 0; index < visibleFiles.length; index += 3) {
    const row = visibleFiles.slice(index, index + 3);
    outputs.push({
      content: row
        .map((file, rowIndex) =>
          rowIndex === row.length - 1 ? file : file.padEnd(LS_COLUMN_WIDTH, " "),
        )
        .join(""),
      tone: "accent",
    });
  }

  return outputs;
}

function getDeletedFileResult(file: VirtualFileName): TerminalCommandResult {
  return {
    outputs: [
      {
        content: `cat: ${file}: No such file in this session`,
        tone: "warning",
      },
      {
        content:
          "That file was fake-deleted from this shell. Refresh the page or run `restore all` if you regret your choices.",
        tone: "muted",
      },
    ],
  };
}

function getReferencedVirtualFile(normalizedCommand: string): VirtualFileName | null {
  if (normalizedCommand === "about" || normalizedCommand === "cat about.md") {
    return "about.md";
  }

  if (
    normalizedCommand === "focus" ||
    normalizedCommand === "now" ||
    normalizedCommand === "cat focus.md"
  ) {
    return "focus.md";
  }

  if (normalizedCommand === "projects" || normalizedCommand === "cat projects.md") {
    return "projects.md";
  }

  if (normalizedCommand === "skills" || normalizedCommand === "cat skills.md") {
    return "skills.md";
  }

  if (normalizedCommand === "interests" || normalizedCommand === "cat interests.md") {
    return "interests.md";
  }

  if (normalizedCommand === "contact" || normalizedCommand === "cat contact.md") {
    return "contact.md";
  }

  if (
    normalizedCommand === "headshot" ||
    normalizedCommand === "show headshot" ||
    normalizedCommand === "cat headshot.jpg"
  ) {
    return "headshot.jpg";
  }

  if (
    normalizedCommand === "dog" ||
    normalizedCommand === "dog --zoomies" ||
    normalizedCommand === "dog -zoomies" ||
    normalizedCommand === "dog zoomies" ||
    normalizedCommand === "dog -z" ||
    normalizedCommand === "zoomies" ||
    normalizedCommand === "show dog" ||
    normalizedCommand === "cat dog.jpeg" ||
    normalizedCommand === "cat dog.jpg" ||
    normalizedCommand === "puppy"
  ) {
    return "dog.jpeg";
  }

  if (
    normalizedCommand === "open resume" ||
    normalizedCommand === "resume" ||
    normalizedCommand === "cat resume.pdf"
  ) {
    return "resume.pdf";
  }

  return null;
}

function parseRemovalCommand(
  rawCommand: string,
  deletedFiles: Set<VirtualFileName>,
): RemovalPlan | null {
  const normalized = normalizeCommand(rawCommand);

  if (!/^rm(?:\s|$)/.test(normalized)) {
    return null;
  }

  const args = normalized.split(/\s+/).slice(1);
  const removed = new Set<VirtualFileName>();
  const missing = new Set<string>();
  let hadTargets = false;
  let removeAll = false;

  for (const arg of args) {
    if (!arg) {
      continue;
    }

    if (arg.startsWith("-")) {
      continue;
    }

    hadTargets = true;

    if (arg === "*") {
      removeAll = true;
      continue;
    }

    const resolvedFile = virtualFileAliases[arg];

    if (!resolvedFile || deletedFiles.has(resolvedFile)) {
      missing.add(arg);
      continue;
    }

    removed.add(resolvedFile);
  }

  if (removeAll) {
    for (const file of getVisibleVirtualFiles(deletedFiles)) {
      removed.add(file);
    }
  }

  return {
    hadTargets,
    removed: Array.from(removed),
    missing: Array.from(missing),
  };
}

function getRemovalCommandResult(removalPlan: RemovalPlan): TerminalCommandResult {
  if (!removalPlan.hadTargets) {
    return {
      outputs: [
        { content: "usage: rm <file>", tone: "warning" },
        {
          content: "Try `rm about.md` or go full gremlin with `rm *`.",
          tone: "muted",
        },
      ],
    };
  }

  const outputs: TerminalOutputLike[] = [];

  for (const file of removalPlan.removed) {
    outputs.push({
      content: `removed    ${file}`,
      tone: "warning",
    });
  }

  for (const target of removalPlan.missing) {
    outputs.push({
      content: `rm: cannot remove '${target}': No such file`,
      tone: "warning",
    });
  }

  if (removalPlan.removed.length === 0 && removalPlan.missing.length === 0) {
    outputs.push({
      content: "Nothing left to remove. You have already done enough damage.",
      tone: "muted",
    });
  }

  return { outputs };
}

function getDeleteNoticeOutput(file: VirtualFileName): TerminalOutputLike {
  return {
    tone: "muted",
    content: `hey, deleting ${file} is not very nice.`,
  };
}

function getThemeListingOutputs(
  activeThemeId: PortfolioTerminalThemeId,
): TerminalOutputLike[] {
  return [
    { content: "available grades", tone: "accent" },
    ...portfolioTerminalThemes.map(
      (theme): TerminalOutputLike => ({
        content: `${theme.label.toLowerCase().padEnd(11, " ")} ${theme.summary}`,
        tone: theme.id === activeThemeId ? "success" : "default",
        textEffect: theme.id === "rainbow" ? "rainbow" : undefined,
      }),
    ),
    {
      content: `Run \`theme\` to browse or \`theme <${themeCommandOptionsLabel}>\` to switch directly.`,
      tone: "muted",
    },
  ];
}

function getThemeSelection(
  activeThemeId: PortfolioTerminalThemeId,
): TerminalInteractiveSelection {
  return {
    title: "",
    initialId: activeThemeId,
    options: portfolioTerminalThemes.map((themeOption) => ({
      id: themeOption.id,
      label: themeOption.label.toLowerCase(),
      command: `theme ${themeOption.id}`,
      color: themeOption.accent,
      textEffect: themeOption.id === "rainbow" ? "rainbow" : undefined,
    })),
  };
}

function inferPortfolioCommand(rawCommand: string) {
  const simplified = simplifyNaturalLanguage(rawCommand);

  if (!simplified) {
    return null;
  }

  if (
    simplified.includes("how to use") ||
    simplified.includes("how do i use") ||
    simplified.includes("how this works") ||
    simplified.includes("how does this work") ||
    simplified.includes("how do i use this terminal") ||
    simplified.includes("how to use this terminal")
  ) {
    return "howto";
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

  if (
    simplified.includes("theme") ||
    simplified.includes("colour") ||
    simplified.includes("color") ||
    simplified.includes("grade")
  ) {
    for (const token of simplified.split(" ")) {
      const resolvedTheme = resolvePortfolioTerminalTheme(token);

      if (resolvedTheme) {
        return `theme ${resolvedTheme.id}`;
      }
    }

    return "theme";
  }

  return null;
}

function getPortfolioCommandResult(
  command: string,
  deletedFiles: Set<VirtualFileName>,
): TerminalCommandResult | null {
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
        { content: "howto / whoami / ls / cat about.md / cat focus.md / cat projects.md" },
        { content: "project stensyl / project spotifygraphs / project hapticmaps" },
        { content: "cat skills.md / cat interests.md / cat contact.md / cat headshot.jpg / dog / dog --zoomies" },
        {
          content: `theme / theme <${themeCommandOptionsLabel}> / open resume / open github / open linkedin`,
        },
        { content: "rm <file> / restore all / clear" },
        {
          content: "Use the quick actions below or type your own command.",
          tone: "muted",
        },
        {
          content: "Plain English works too: `show me your projects` or `what do you look like`.",
          tone: "muted",
        },
        {
          content: "Yes, you can fake-delete files. No, I don't approve of it.",
          tone: "muted",
        },
      ],
    };
  }

  if (
    normalized === "howto" ||
    normalized === "how to" ||
    normalized === "tutorial" ||
    normalized === "terminal help"
  ) {
    return {
      outputs: [
        { content: "terminal crash course", tone: "accent" },
        {
          content: "Prompt format :: `bl@portfolio:~$` means user @ machine, current folder, then the command cursor.",
          tone: "default",
        },
        {
          content: "`ls` lists files, `cat <file>` reads a file, `project <name>` opens a project card, and `open <target>` launches a link.",
          tone: "default",
        },
        {
          content: "Best first moves :: `whoami`, `cat about.md`, `cat projects.md`, `cat contact.md`, `dog`.",
          tone: "success",
        },
        {
          content: "Shortcuts work too :: plain English like `show me your projects` gets interpreted for you.",
          tone: "default",
        },
        {
          content: "Navigation :: use ↑ and ↓ for command history. Inside `theme`, arrows move the selector and Enter applies it.",
          tone: "default",
        },
        {
          content: "Utility commands :: `theme`, `help`, `clear`, `rm <file>`, and `restore all`.",
          tone: "default",
        },
        {
          content: "Rule of thumb :: commands are usually verb + target. Example: `cat focus.md` or `project stensyl`.",
          tone: "muted",
        },
      ],
    };
  }

  if (normalized === "ls" || normalized === "dir") {
    return {
      outputs: getDirectoryListingOutputs(deletedFiles),
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

  const referencedFile = getReferencedVirtualFile(normalized);

  if (referencedFile && deletedFiles.has(referencedFile)) {
    return getDeletedFileResult(referencedFile);
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
    normalized === "dog --zoomies" ||
    normalized === "dog -zoomies" ||
    normalized === "dog zoomies" ||
    normalized === "dog -z" ||
    normalized === "zoomies" ||
    normalized === "show dog" ||
    normalized === "cat dog.jpeg" ||
    normalized === "cat dog.jpg" ||
    normalized === "puppy"
  ) {
    const isZoomies =
      normalized === "dog --zoomies" ||
      normalized === "dog -zoomies" ||
      normalized === "dog zoomies" ||
      normalized === "dog -z" ||
      normalized === "zoomies";

    return {
      outputs: [
        {
          content: isZoomies ? "dog zoomies engaged" : "dog preview",
          tone: "accent",
        },
        imageOutput(
          portfolioProfile.dogPhoto,
          `${portfolioProfile.name} dog`,
          isZoomies ? "dog.jpeg // zoomies mode" : "dog.jpeg",
          isZoomies ? "zoomies" : undefined,
        ),
        ...(!isZoomies
          ? ([
              {
                content: "try `dog --zoomies`",
                tone: "muted",
              },
            ] satisfies TerminalOutputLike[])
          : []),
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

const introCommands = ["whoami", "cat about.md", "ls"];

const quickActions = [
  {
    label: "HOWTO",
    command: "howto",
    labelEffect: "shiny" as const,
  },
  { label: "whoami", command: "whoami" },
  { label: "photo", command: "cat headshot.jpg" },
  { label: "dog", command: "cat dog.jpeg" },
  { label: "focus", command: "cat focus.md" },
  { label: "projects", command: "cat projects.md" },
  { label: "skills", command: "cat skills.md" },
  { label: "contact", command: "cat contact.md" },
  { label: "resume", command: "open resume" },
  { label: "vim", command: "vim" },
  { label: "matrix", command: "cmatrix" },
  { label: "clear", command: "clear" },
  { label: "theme", command: "theme" },
];

const MATRIX_CHARS =
  "abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*:,.ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";

function randomChar() {
  return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
}

interface CmatrixStream {
  y: number;
  length: number;
  speed: number;
  delay: number;
  chars: string[];
}

function createStream(rows: number): CmatrixStream {
  const length = 3 + Math.floor(Math.random() * (rows - 3));
  return {
    y: -Math.floor(Math.random() * rows),
    length,
    speed: 1 + Math.floor(Math.random() * 2),
    delay: Math.floor(Math.random() * rows),
    chars: Array.from({ length: length + 1 }, randomChar),
  };
}

const RAINBOW_COLORS = ["#ff6188", "#fc9867", "#ffd866", "#a9dc76", "#78dce8", "#ab9df2"];

function MatrixRain({
  color,
  rainbow,
  onExit,
  className,
  contentClassName,
  quickActions,
}: {
  color: string;
  rainbow?: boolean;
  onExit: () => void;
  className?: string;
  contentClassName?: string;
  quickActions: TerminalQuickAction[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const streamsRef = useRef<CmatrixStream[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const handleKey = () => onExit();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const fontSize = 14;
    const lineHeight = fontSize * 1.4;
    const colStep = 2;
    const font = `${fontSize}px 'Space Mono', monospace`;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = content.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);

      ctx.font = font;
      const charWidth = ctx.measureText("M").width;

      const cols = Math.floor(rect.width / charWidth);
      const rows = Math.floor(rect.height / lineHeight);

      const activeColumns = Math.ceil(cols / colStep);
      if (streamsRef.current.length !== activeColumns) {
        streamsRef.current = Array.from({ length: activeColumns }, () =>
          createStream(rows),
        );
      }

      return { charWidth, cols, rows, width: rect.width, height: rect.height };
    };

    let grid = setup();

    const draw = () => {
      frameRef.current += 1;
      const { charWidth, rows, width, height } = grid;
      const streams = streamsRef.current;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
      ctx.font = font;
      ctx.textBaseline = "top";

      for (let si = 0; si < streams.length; si++) {
        const stream = streams[si];
        const col = si * colStep;
        const x = col * charWidth;

        if (stream.delay > 0) {
          stream.delay -= 1;
          continue;
        }

        if (frameRef.current % stream.speed === 0) {
          stream.y += 1;
        }

        for (let ci = 0; ci < stream.chars.length; ci++) {
          if (Math.random() < 0.125) {
            stream.chars[ci] = randomChar();
          }
        }

        for (let ci = 0; ci <= stream.length; ci++) {
          const row = stream.y - ci;
          if (row < 0 || row >= rows) continue;

          const y = row * lineHeight;
          const char = stream.chars[ci % stream.chars.length];
          const isHead = ci === 0;
          const tailFade = ci / stream.length;

          if (isHead) {
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = rainbow
              ? RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)]
              : color;
            ctx.globalAlpha = Math.max(0.15, 1 - tailFade * 0.85);
          }

          ctx.fillText(char, x, y);
        }

        ctx.globalAlpha = 1;

        if (stream.y - stream.length > rows) {
          streams[si] = createStream(rows);
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      grid = setup();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [color, rainbow]);

  return (
    <div
      className={cn("mx-auto w-full max-w-xl px-4 font-mono text-xs", className)}
    >
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-black shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center">
            <span className={cn("truncate text-xs", rainbow && "terminal-rainbow-text")} style={{ color: rainbow ? undefined : "rgba(255, 255, 255, 0.5)" }}>
              cmatrix
            </span>
          </div>
          <div className="w-[52px]" />
        </div>
        {/* Canvas content area */}
        <div
          ref={contentRef}
          className={cn("relative cursor-pointer overflow-hidden bg-black", contentClassName)}
          onClick={onExit}
        >
          <canvas ref={canvasRef} className="block" />
          <div
            className="absolute bottom-3 left-0 right-0 text-center font-mono text-xs"
            style={{ color: "#ffffff", opacity: 0.5 }}
          >
            press any key to exit
          </div>
        </div>
        {/* Quick actions bar matching Terminal layout */}
        <div className="border-t border-neutral-800 bg-neutral-900/95 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2" style={{ color: "rgba(255, 255, 255, 0.45)" }}>
              quick:
            </span>
            {quickActions.map((action) => (
              <button
                key={action.command}
                type="button"
                disabled
                className="rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] opacity-40 cursor-not-allowed"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.72)",
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TerminalPortfolioExperienceProps {
  embedded?: boolean;
  solidBackground?: boolean;
  theme: PortfolioTerminalTheme;
  onThemeChange: (themeId: PortfolioTerminalThemeId) => void;
}

export default function TerminalPortfolioExperience({
  embedded = false,
  solidBackground = true,
  theme,
  onThemeChange,
}: TerminalPortfolioExperienceProps) {
  const [deletedFiles, setDeletedFiles] = useState<VirtualFileName[]>([]);
  const [deleteNoticeSeen, setDeleteNoticeSeen] = useState(false);
  const [sessionStateReady, setSessionStateReady] = useState(false);
  const [vimMode, setVimMode] = useState(false);
  const [cmatrixActive, setCmatrixActive] = useState(false);
  const mountTime = useRef(Date.now());

  const deletedFileSet = useMemo(() => new Set(deletedFiles), [deletedFiles]);

  useEffect(() => {
    setDeletedFiles(readDeletedFilesFromSession());
    setDeleteNoticeSeen(readDeleteNoticeSeenFromSession());
    setSessionStateReady(true);
  }, []);

  useEffect(() => {
    if (!sessionStateReady || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      SESSION_DELETED_FILES_KEY,
      JSON.stringify(deletedFiles),
    );
  }, [deletedFiles, sessionStateReady]);

  useEffect(() => {
    if (!sessionStateReady || typeof window === "undefined") {
      return;
    }

    if (deleteNoticeSeen) {
      window.sessionStorage.setItem(SESSION_DELETE_NOTICE_KEY, "1");
      return;
    }

    window.sessionStorage.removeItem(SESSION_DELETE_NOTICE_KEY);
  }, [deleteNoticeSeen, sessionStateReady]);

  const introOutputs = useMemo(
    () =>
      Object.fromEntries(
        introCommands.map((command, index) => [
          index,
          getPortfolioCommandResult(command, deletedFileSet)?.outputs ?? [],
        ]),
      ) satisfies Record<number, TerminalOutputLike[]>,
    [deletedFileSet],
  );

  const resolvePortfolioCommand = useCallback(
    (rawCommand: string): TerminalCommandResult => {
      const normalized = normalizeCommand(rawCommand);

      if (!normalized) {
        return { outputs: [] };
      }

      if (vimMode) {
        if (
          normalized === ":q" ||
          normalized === ":q!" ||
          normalized === ":wq" ||
          normalized === ":wq!" ||
          normalized === ":x" ||
          normalized === ":qa" ||
          normalized === ":qa!"
        ) {
          setVimMode(false);

          return {
            outputs: [
              {
                content: normalized === ":wq" || normalized === ":wq!" || normalized === ":x"
                  ? "E32: No file name — but you escaped, so that's something."
                  : "You escaped vim. Most people aren't so lucky.",
                tone: "success",
              },
            ],
          };
        }

        if (normalized === ":w") {
          return {
            outputs: [
              { content: "E32: No file name", tone: "warning" },
            ],
          };
        }

        if (normalized.startsWith(":w ")) {
          return {
            outputs: [
              { content: `E212: Can't open file for writing: Permission denied`, tone: "warning" },
            ],
          };
        }

        if (normalized === ":help" || normalized === ":h") {
          return {
            outputs: [
              { content: "help.txt    For Vim version 9.1.  Last change: right now", tone: "muted" },
              { content: "" },
              { content: "                  VIM - main help file", tone: "accent" },
              { content: "" },
              { content: "  Move around:  You can't. This is a fake terminal." },
              { content: "  Close help:   :q<Enter>" },
              { content: "  Exit Vim:     :q<Enter>  or  :qa!<Enter>  (careful!)" },
              { content: "" },
              { content: "  Honestly you just need :q and you're free.", tone: "muted" },
            ],
          };
        }

        if (
          normalized === "i" ||
          normalized === "a" ||
          normalized === "o" ||
          normalized === "c" ||
          normalized === "s" ||
          normalized === "r"
        ) {
          return {
            outputs: [
              { content: "-- INSERT --", tone: "success" },
              { content: "Just kidding. You can't insert text into a fake terminal.", tone: "muted" },
              { content: "Type :q to quit.", tone: "muted" },
            ],
          };
        }

        if (normalized === "dd") {
          return {
            outputs: [
              { content: "1 line yanked into the void. Nothing was actually deleted.", tone: "muted" },
            ],
          };
        }

        if (normalized === "u") {
          return {
            outputs: [
              { content: "Already at oldest change", tone: "warning" },
            ],
          };
        }

        if (normalized === ":set number" || normalized === ":set nu") {
          return {
            outputs: [
              { content: "There are no lines to number. The buffer is a lie.", tone: "muted" },
            ],
          };
        }

        if (normalized.startsWith(":!")) {
          return {
            outputs: [
              { content: "E145: Shell commands and strstrings not yet supported", tone: "warning" },
              { content: "You're running a shell command from inside vim from inside a fake terminal. Inception denied.", tone: "muted" },
            ],
          };
        }

        if (normalized.startsWith(":")) {
          const vimCmd = normalized.slice(1);
          return {
            outputs: [
              { content: `E492: Not an editor command: ${vimCmd}`, tone: "warning" },
            ],
          };
        }

        return {
          outputs: [
            { content: `E354: Invalid register name: '${normalized.charAt(0)}'`, tone: "warning" },
            { content: "Type :q to quit. You know you want to.", tone: "muted" },
          ],
        };
      }

      if (normalized === "vim" || normalized.startsWith("vim ") || normalized === "vi" || normalized.startsWith("vi ")) {
        setVimMode(true);

        const filename = normalized.replace(/^vi(?:m)?\s*/, "").trim() || "[No Name]";
        const tilde = (content = "~"): TerminalOutputLike => ({ content, tone: "muted" });

        return {
          clear: true,
          outputs: [
            tilde(),
            tilde(),
            tilde(),
            tilde(),
            tilde(),
            tilde(),
            { content: "~                VIM - Vi IMproved", tone: "accent" },
            tilde(),
            { content: "~                 version 9.1" },
            { content: "~             by Bram Moolenaar et al." },
            tilde(),
            { content: "~    Vim is open source and freely distributable" },
            tilde(),
            { content: "~           type  :q<Enter>          to exit" },
            { content: "~           type  :help<Enter>       for help" },
            tilde(),
            tilde(),
            tilde(),
            tilde(),
            tilde(),
            { content: `"${filename}"                                    0,0-1         All`, tone: "muted" },
          ],
        };
      }

      if (normalized === "sudo" || normalized.startsWith("sudo ")) {
        return {
          outputs: [
            { content: "bl is not in the sudoers file. This incident will be reported.", tone: "warning" },
          ],
        };
      }

      if (normalized === "uptime") {
        const elapsed = Date.now() - mountTime.current;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes % 60 > 0 || hours > 0) parts.push(`${minutes % 60}m`);
        parts.push(`${seconds % 60}s`);

        return {
          outputs: [
            { content: `session uptime: ${parts.join(" ")}`, tone: "accent" },
            {
              content: hours >= 1
                ? "You've been here a while. Everything okay?"
                : minutes >= 5
                  ? "Taking your time. I respect that."
                  : "Just got here. Look around.",
              tone: "muted",
            },
          ],
        };
      }

      if (normalized === "cmatrix" || normalized === "matrix") {
        setCmatrixActive(true);

        return {
          clear: true,
          outputs: [],
        };
      }

      const removalPlan = parseRemovalCommand(rawCommand, deletedFileSet);

      if (removalPlan) {
        if (removalPlan.removed.length > 0) {
          setDeletedFiles((currentFiles) =>
            Array.from(new Set([...currentFiles, ...removalPlan.removed])),
          );
        }

        const removalResult = getRemovalCommandResult(removalPlan);

        if (!deleteNoticeSeen && removalPlan.removed.length > 0) {
          setDeleteNoticeSeen(true);

          return {
            ...removalResult,
            outputs: [
              ...(removalResult.outputs ?? []),
              getDeleteNoticeOutput(removalPlan.removed[0]),
            ],
          };
        }

        return removalResult;
      }

      if (
        normalized === "restore" ||
        normalized === "restore all" ||
        normalized === "undo rm"
      ) {
        if (deletedFiles.length === 0) {
          return {
            outputs: [
              { content: "Nothing to restore.", tone: "muted" },
              {
                content: "The fake filesystem is currently intact. Miraculously.",
                tone: "muted",
              },
            ],
          };
        }

        const restoredFiles = deletedFiles;
        setDeletedFiles([]);

        return {
          outputs: [
            {
              content: `restored   ${restoredFiles.join(" / ")}`,
              tone: "success",
            },
            {
              content: "The terminal has reluctantly reassembled the evidence.",
              tone: "muted",
            },
          ],
        };
      }

      if (
        normalized === "theme list" ||
        normalized === "theme ls" ||
        normalized === "palette list" ||
        normalized === "palette ls"
      ) {
        return {
          outputs: [
            {
              content: `active grade :: ${theme.label.toLowerCase()}`,
              tone: "accent",
              textEffect: theme.id === "rainbow" ? "rainbow" : undefined,
            },
            ...getThemeListingOutputs(theme.id),
          ],
        };
      }

      if (normalized === "theme" || normalized === "palette") {
        return {
          outputs: [],
          selection: getThemeSelection(theme.id),
        };
      }

      if (
        normalized.startsWith("theme ") ||
        normalized.startsWith("palette ")
      ) {
        const requestedTheme = normalizeCommand(
          rawCommand.replace(/^(theme|palette)\s+/i, ""),
        );
        const nextTheme = resolvePortfolioTerminalTheme(requestedTheme);

        if (!nextTheme) {
          return {
            outputs: [
              {
                content: `Unknown grade: ${requestedTheme}`,
                tone: "warning",
              },
            ],
            selection: getThemeSelection(theme.id),
          };
        }

        if (nextTheme.id === theme.id) {
          return {
            outputs: [
              {
                content: `${nextTheme.label.toLowerCase()} already active`,
                tone: "success",
                textEffect: nextTheme.id === "rainbow" ? "rainbow" : undefined,
              },
            ],
          };
        }

        onThemeChange(nextTheme.id);

        return {
          outputs: [
            {
              content: `grade switched :: ${nextTheme.label.toLowerCase()}`,
              tone: "accent",
              textEffect: nextTheme.id === "rainbow" ? "rainbow" : undefined,
            },
          ],
        };
      }

      const directResult = getPortfolioCommandResult(rawCommand, deletedFileSet);

      if (directResult) {
        return directResult;
      }

      const inferredCommand = inferPortfolioCommand(rawCommand);

      if (inferredCommand) {
        const inferredResult = getPortfolioCommandResult(
          inferredCommand,
          deletedFileSet,
        );

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
            content:
              "Try `help`, `whoami`, `cat projects.md`, or plain English like `show me your projects`.",
            tone: "muted",
          },
        ],
      };
    },
    [deletedFileSet, deleteNoticeSeen, deletedFiles, onThemeChange, theme.id, theme.label, vimMode],
  );

  const handleCmatrixExit = useCallback(() => {
    setCmatrixActive(false);
    requestAnimationFrame(() => {
      document.getElementById("terminal-command-input")?.focus();
    });
  }, []);

  const terminalClassName = embedded
    ? "max-w-5xl px-0 text-sm md:text-[14px]"
    : "max-w-[min(92vw,60rem)] px-0 text-sm";
  const terminalContentClassName = embedded
    ? "h-[18rem] md:h-[26rem]"
    : "h-[min(30rem,58vh)] md:h-[min(38rem,64vh)]";

  const terminalInterface = (
    <div className="relative w-full" style={theme.terminalVars}>
      {cmatrixActive ? (
        <MatrixRain
          color={theme.accent}
          rainbow={theme.id === "rainbow"}
          onExit={handleCmatrixExit}
          className={terminalClassName}
          contentClassName={terminalContentClassName}
          quickActions={quickActions}
        />
      ) : null}
      <Terminal
        commands={introCommands}
        outputs={introOutputs}
        username="bl@portfolio"
        usernameEffect={theme.id === "rainbow" ? "rainbow" : undefined}
        typingSpeed={58}
        interactiveTypingSpeed={42}
        delayBetweenCommands={1200}
        initialDelay={650}
        scriptedOutputLineDelay={200}
        enableSound={false}
        interactive
        onCommand={resolvePortfolioCommand}
        quickActions={quickActions}
        className={cn(terminalClassName, cmatrixActive && "hidden")}
        contentClassName={terminalContentClassName}
      />
    </div>
  );

  if (embedded) {
    return <div className="w-full">{terminalInterface}</div>;
  }

  return (
    <section
      className={`flex h-screen overflow-hidden items-center justify-center px-3 py-4 md:px-6 md:py-6 ${
        solidBackground ? "bg-black" : "bg-transparent"
      }`}
    >
      {terminalInterface}
    </section>
  );
}

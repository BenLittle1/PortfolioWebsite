"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
        { content: "whoami / ls / cat about.md / cat focus.md / cat projects.md" },
        { content: "project stensyl / project spotifygraphs / project hapticmaps" },
        { content: "cat skills.md / cat interests.md / cat contact.md / cat headshot.jpg / dog / dog --zoomies" },
        { content: "open resume / open github / open linkedin / rm <file> / restore all / clear" },
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
    normalized === "dog -z" ||
    normalized === "zoomies" ||
    normalized === "show dog" ||
    normalized === "cat dog.jpeg" ||
    normalized === "cat dog.jpg" ||
    normalized === "puppy"
  ) {
    const isZoomies =
      normalized === "dog --zoomies" ||
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
  const [deletedFiles, setDeletedFiles] = useState<VirtualFileName[]>(() =>
    readDeletedFilesFromSession(),
  );
  const [deleteNoticeSeen, setDeleteNoticeSeen] = useState(() =>
    readDeleteNoticeSeenFromSession(),
  );

  const deletedFileSet = useMemo(() => new Set(deletedFiles), [deletedFiles]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      SESSION_DELETED_FILES_KEY,
      JSON.stringify(deletedFiles),
    );
  }, [deletedFiles]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (deleteNoticeSeen) {
      window.sessionStorage.setItem(SESSION_DELETE_NOTICE_KEY, "1");
      return;
    }

    window.sessionStorage.removeItem(SESSION_DELETE_NOTICE_KEY);
  }, [deleteNoticeSeen]);

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
    [deletedFileSet, deleteNoticeSeen, deletedFiles],
  );

  const terminalInterface = (
    <div className="relative w-full">
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
        className={embedded ? "max-w-5xl px-0 text-sm md:text-[14px]" : "max-w-[min(92vw,60rem)] px-0 text-sm"}
        contentClassName={embedded ? "h-[18rem] md:h-[26rem]" : "h-[min(30rem,58vh)] md:h-[min(38rem,64vh)]"}
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

"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ShinyText from "@/components/ShinyText";
import { cn } from "@/lib/utils";

const KEY_SOUNDS_DOWN: Record<string, [number, number]> = {
  A: [31542, 85],
  B: [40621, 107],
  C: [39632, 95],
  D: [32492, 85],
  E: [23317, 83],
  F: [32973, 87],
  G: [33453, 94],
  H: [33986, 93],
  I: [25795, 91],
  J: [34425, 88],
  K: [34932, 90],
  L: [35410, 95],
  M: [41610, 93],
  N: [41103, 90],
  O: [26309, 84],
  P: [26804, 83],
  Q: [22245, 95],
  R: [23817, 92],
  S: [32031, 88],
  T: [24297, 92],
  U: [25313, 95],
  V: [40136, 94],
  W: [22790, 89],
  X: [39148, 76],
  Y: [24811, 93],
  Z: [38694, 80],
  " ": [51541, 144],
  "-": [42594, 90],
  "@": [23317, 83],
  "/": [42594, 90],
  ".": [42594, 90],
  ":": [42594, 90],
  "0": [26309, 84],
  "1": [25313, 95],
  "2": [23317, 83],
  "3": [23817, 92],
  "4": [24297, 92],
  "5": [24811, 93],
  "6": [25313, 95],
  "7": [25795, 91],
  "8": [26309, 84],
  "9": [26804, 83],
  Enter: [19065, 110],
};

const KEY_SOUNDS_UP: Record<string, [number, number]> = {
  A: [31632, 80],
  B: [40736, 95],
  C: [39732, 85],
  D: [32577, 80],
  E: [23402, 80],
  F: [33063, 80],
  G: [33553, 85],
  H: [34081, 85],
  I: [25890, 85],
  J: [34515, 85],
  K: [35027, 85],
  L: [35510, 85],
  M: [41710, 85],
  N: [41198, 85],
  O: [26394, 80],
  P: [26889, 80],
  Q: [22345, 85],
  R: [23912, 85],
  S: [32121, 80],
  T: [24392, 85],
  U: [25413, 85],
  V: [40236, 85],
  W: [22880, 85],
  X: [39228, 70],
  Y: [24911, 85],
  Z: [38779, 75],
  " ": [51691, 130],
  "-": [42689, 85],
  "@": [23402, 80],
  "/": [42689, 85],
  ".": [42689, 85],
  ":": [42689, 85],
  "0": [26394, 80],
  "1": [25413, 85],
  "2": [23402, 80],
  "3": [23912, 85],
  "4": [24392, 85],
  "5": [24911, 85],
  "6": [25413, 85],
  "7": [25890, 85],
  "8": [26394, 80],
  "9": [26889, 80],
  Enter: [19180, 100],
};

function useAudio(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const init = async () => {
      try {
        ctxRef.current = new AudioContext();
        const res = await fetch("/sounds/sound.ogg");
        if (!res.ok) return;
        bufferRef.current = await ctxRef.current.decodeAudioData(
          await res.arrayBuffer(),
        );
        readyRef.current = true;
      } catch {}
    };
    init();
    return () => {
      ctxRef.current?.close();
    };
  }, [enabled]);

  const playSound = (sound: [number, number] | undefined) => {
    if (!readyRef.current || !ctxRef.current || !bufferRef.current || !sound)
      return;
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    const src = ctxRef.current.createBufferSource();
    src.buffer = bufferRef.current;
    src.connect(ctxRef.current.destination);
    src.start(0, sound[0] / 1000, sound[1] / 1000);
  };

  const down = (key: string) =>
    playSound(KEY_SOUNDS_DOWN[key.toUpperCase()] || KEY_SOUNDS_DOWN[key]);
  const up = (key: string) =>
    playSound(KEY_SOUNDS_UP[key.toUpperCase()] || KEY_SOUNDS_UP[key]);

  return { down, up };
}

function useInView(ref: React.RefObject<HTMLElement | null>, once = true) {
  const [inView, setInView] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && triggered.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          setInView(true);
          if (once) {
            triggered.current = true;
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once]);

  return inView;
}

type TokenType =
  | "command"
  | "flag"
  | "string"
  | "number"
  | "operator"
  | "path"
  | "variable"
  | "comment"
  | "default";

interface Token {
  type: TokenType;
  value: string;
}

export function tokenizeBash(text: string): Token[] {
  const tokens: Token[] = [];
  const words = text.split(/(\s+)/);

  let isFirstWord = true;

  for (const word of words) {
    if (/^\s+$/.test(word)) {
      tokens.push({ type: "default", value: word });
      continue;
    }

    if (word.startsWith("#")) {
      tokens.push({ type: "comment", value: word });
      continue;
    }

    if (word.startsWith("$")) {
      tokens.push({ type: "variable", value: word });
      isFirstWord = false;
      continue;
    }

    if (word.startsWith("--") || word.startsWith("-")) {
      tokens.push({ type: "flag", value: word });
      isFirstWord = false;
      continue;
    }

    if (/^["'].*["']$/.test(word)) {
      tokens.push({ type: "string", value: word });
      isFirstWord = false;
      continue;
    }

    if (/^\d+$/.test(word)) {
      tokens.push({ type: "number", value: word });
      isFirstWord = false;
      continue;
    }

    if (/^[|>&<]+$/.test(word)) {
      tokens.push({ type: "operator", value: word });
      isFirstWord = true;
      continue;
    }

    if (word.includes("/") || word.startsWith(".") || word.startsWith("~")) {
      tokens.push({ type: "path", value: word });
      isFirstWord = false;
      continue;
    }

    if (isFirstWord) {
      tokens.push({ type: "command", value: word });
      isFirstWord = false;
      continue;
    }

    tokens.push({ type: "default", value: word });
  }

  return tokens;
}

const tokenColorStyles: Record<TokenType, React.CSSProperties> = {
  command: { color: "var(--terminal-token-command, #6ee7b7)" },
  flag: { color: "var(--terminal-token-flag, #bef264)" },
  string: { color: "var(--terminal-token-string, #dcfce7)" },
  number: { color: "var(--terminal-token-number, #a7f3d0)" },
  operator: { color: "var(--terminal-token-operator, #34d399)" },
  path: { color: "var(--terminal-token-path, #86efac)" },
  variable: { color: "var(--terminal-token-variable, #d9f99d)" },
  comment: { color: "var(--terminal-token-comment, rgba(22, 101, 52, 0.72))" },
  default: { color: "var(--terminal-token-default, rgba(236, 253, 245, 0.82))" },
};

function isRainbowTerminalToken(value: string) {
  return /^['"]?multicolou?r['"]?$/i.test(value);
}

export function SyntaxHighlightedText({ text }: { text: string }) {
  const tokens = tokenizeBash(text);

  return (
    <>
      {tokens.map((token, i) => (
        <span
          key={i}
          className={cn(isRainbowTerminalToken(token.value) && "terminal-rainbow-text")}
          style={tokenColorStyles[token.type]}
        >
          {token.value}
        </span>
      ))}
    </>
  );
}

export type TerminalOutputTone =
  | "default"
  | "muted"
  | "accent"
  | "success"
  | "warning";

export interface TerminalOutput {
  content?: string;
  tone?: TerminalOutputTone;
  href?: string;
  external?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageEffect?: "zoomies";
  textEffect?: "rainbow";
}

export type TerminalOutputLike = string | TerminalOutput;

export interface TerminalSelectionOption {
  id: string;
  label: string;
  description?: string;
  command: string;
  color?: string;
  textEffect?: "rainbow";
}

export interface TerminalInteractiveSelection {
  title?: string;
  hint?: string;
  initialId?: string;
  options: TerminalSelectionOption[];
}

export interface TerminalCommandResult {
  outputs?: TerminalOutputLike[];
  clear?: boolean;
  selection?: TerminalInteractiveSelection | null;
}

export interface TerminalQuickAction {
  label: string;
  command: string;
  labelEffect?: "shiny";
}

interface TerminalLine {
  type: "command" | "output" | "image";
  content: string;
  tone?: TerminalOutputTone;
  href?: string;
  external?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageEffect?: "zoomies";
  textEffect?: "rainbow";
}

const outputColorStyles: Record<TerminalOutputTone, React.CSSProperties> = {
  default: { color: "var(--terminal-text-default, rgba(236, 253, 245, 0.78))" },
  muted: { color: "var(--terminal-text-muted, rgba(110, 231, 183, 0.5))" },
  accent: { color: "var(--terminal-text-accent, #bef264)" },
  success: { color: "var(--terminal-text-success, #6ee7b7)" },
  warning: { color: "var(--terminal-text-warning, #d9f99d)" },
};

function renderTerminalText(text: string, textEffect?: "rainbow") {
  const rainbowPattern =
    textEffect === "rainbow"
      ? /(multicolou?r|already active)/gi
      : /(multicolou?r)/gi;

  if (!rainbowPattern.test(text)) {
    if (textEffect === "rainbow") {
      return <span className="terminal-rainbow-text">{text}</span>;
    }

    return text;
  }

  const parts = text.split(rainbowPattern);

  return parts.map((part, index) =>
    part.toLowerCase() === "multicolour" ||
    part.toLowerCase() === "multicolor" ||
    part.toLowerCase() === "already active" ? (
      <span key={`${part}-${index}`} className="terminal-rainbow-text">
        {part}
      </span>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    ),
  );
}

function normalizeOutput(output: TerminalOutputLike): TerminalLine {
  if (typeof output === "string") {
    return { type: "output", content: output };
  }

  if (output.imageSrc) {
    return {
      type: "image",
      content: output.content ?? "",
      tone: output.tone,
      imageSrc: output.imageSrc,
      imageAlt: output.imageAlt,
      imageEffect: output.imageEffect,
      textEffect: output.textEffect,
    };
  }

  return {
    type: "output",
    content: output.content ?? "",
    tone: output.tone,
    href: output.href,
    external: output.external,
    textEffect: output.textEffect,
  };
}

function normalizeOutputs(outputs: TerminalOutputLike[] = []): TerminalLine[] {
  return outputs.map(normalizeOutput);
}

function wait(duration: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export interface TerminalProps {
  commands?: string[];
  outputs?: Record<number, TerminalOutputLike[]>;
  username?: string;
  className?: string;
  contentClassName?: string;
  typingSpeed?: number;
  interactiveTypingSpeed?: number;
  delayBetweenCommands?: number;
  initialDelay?: number;
  scriptedOutputLineDelay?: number;
  interactiveOutputLineDelay?: number;
  enableSound?: boolean;
  interactive?: boolean;
  onCommand?: (
    command: string,
  ) => TerminalCommandResult | Promise<TerminalCommandResult>;
  quickActions?: TerminalQuickAction[];
  usernameEffect?: "rainbow";
}

export function Terminal({
  commands = ["npx shadcn@latest init"],
  outputs = {},
  username = "Manus-Macbook",
  className,
  contentClassName,
  typingSpeed = 50,
  interactiveTypingSpeed = typingSpeed,
  delayBetweenCommands = 800,
  initialDelay = 500,
  scriptedOutputLineDelay = 150,
  interactiveOutputLineDelay = 90,
  enableSound = true,
  interactive = false,
  onCommand,
  quickActions = [],
  usernameEffect,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(containerRef);
  const { down, up } = useAudio(enableSound);

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [commandIdx, setCommandIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [outputIdx, setOutputIdx] = useState(-1);
  const [phase, setPhase] = useState<
    "idle" | "typing" | "executing" | "outputting" | "pausing" | "done"
  >("idle");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const [activeSelection, setActiveSelection] =
    useState<TerminalInteractiveSelection | null>(null);
  const [activeSelectionIndex, setActiveSelectionIndex] = useState(0);
  const historyIndexRef = useRef<number | null>(null);

  const hasScriptedCommands = commands.length > 0;
  const currentCommand = commands[commandIdx] || "";
  const currentOutputs = useMemo(
    () => normalizeOutputs(outputs[commandIdx] || []),
    [outputs, commandIdx],
  );
  const isLastCommand = commandIdx === commands.length - 1;
  const canInteract = interactive && phase === "done" && Boolean(onCommand);
  const interactiveBusy = isSubmitting || isAutoTyping;

  useEffect(() => {
    if (!inView || phase !== "idle") return;
    const t = setTimeout(
      () => setPhase(hasScriptedCommands ? "typing" : "done"),
      initialDelay,
    );
    return () => clearTimeout(t);
  }, [hasScriptedCommands, inView, phase, initialDelay]);

  useEffect(() => {
    if (!hasScriptedCommands) return;
    if (phase !== "typing") return;

    if (charIdx < currentCommand.length) {
      const char = currentCommand[charIdx];
      down(char);
      const t = setTimeout(
        () => {
          up(char);
          setCurrentText(currentCommand.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        },
        typingSpeed + Math.random() * 30,
      );
      return () => clearTimeout(t);
    } else {
      down("Enter");
      const t = setTimeout(() => {
        up("Enter");
        setPhase("executing");
      }, 80);
      return () => clearTimeout(t);
    }
  }, [hasScriptedCommands, phase, charIdx, currentCommand, typingSpeed, down, up]);

  useEffect(() => {
    if (!hasScriptedCommands) return;
    if (phase !== "executing") return;

    setLines((prev) => [...prev, { type: "command", content: currentCommand }]);
    setCurrentText("");

    if (currentOutputs.length > 0) {
      setOutputIdx(0);
      setPhase("outputting");
    } else if (isLastCommand) {
      setPhase("done");
    } else {
      setPhase("pausing");
    }
  }, [hasScriptedCommands, phase, currentCommand, currentOutputs.length, isLastCommand]);

  useEffect(() => {
    if (!hasScriptedCommands) return;
    if (phase !== "outputting") return;

    if (outputIdx >= 0 && outputIdx < currentOutputs.length) {
      const t = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          currentOutputs[outputIdx],
        ]);
        setOutputIdx((i) => i + 1);
      }, scriptedOutputLineDelay);
      return () => clearTimeout(t);
    } else if (outputIdx >= currentOutputs.length) {
      const t = setTimeout(() => {
        if (isLastCommand) {
          setPhase("done");
        } else {
          setPhase("pausing");
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [
    hasScriptedCommands,
    phase,
    outputIdx,
    currentOutputs,
    isLastCommand,
    scriptedOutputLineDelay,
  ]);

  useEffect(() => {
    if (!hasScriptedCommands) return;
    if (phase !== "pausing") return;
    const t = setTimeout(() => {
      setCharIdx(0);
      setOutputIdx(-1);
      setCommandIdx((c) => c + 1);
      setPhase("typing");
    }, delayBetweenCommands);
    return () => clearTimeout(t);
  }, [hasScriptedCommands, phase, delayBetweenCommands]);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [lines, phase, currentText, inputValue, canInteract, interactiveBusy]);

  useEffect(() => {
    if (canInteract && !interactiveBusy) {
      inputRef.current?.focus();
    }
  }, [canInteract, interactiveBusy, activeSelection]);

  const openSelection = (selection: TerminalInteractiveSelection | null) => {
    if (!selection || selection.options.length === 0) {
      setActiveSelection(null);
      setActiveSelectionIndex(0);
      return;
    }

    const initialIndex = selection.initialId
      ? Math.max(
          0,
          selection.options.findIndex((option) => option.id === selection.initialId),
        )
      : 0;

    setActiveSelection(selection);
    setActiveSelectionIndex(initialIndex);
  };

  const executeInteractiveCommand = useMemo(
    () =>
      async (rawCommand: string) => {
        const command = rawCommand.trim();

        if (!command || !onCommand) {
          return;
        }

        setIsSubmitting(true);
        setInputValue("");
        setActiveSelection(null);
        historyIndexRef.current = null;

        setHistory((prev) =>
          prev[prev.length - 1] === command ? prev : [...prev, command],
        );

        try {
          const result = await onCommand(command);
          const nextOutputs = normalizeOutputs(result.outputs ?? []);

          if (result.clear) {
            setLines(nextOutputs);
          } else {
            setLines((prev) => [...prev, { type: "command", content: command }]);

            for (const output of nextOutputs) {
              await wait(interactiveOutputLineDelay);
              setLines((prev) => [...prev, output]);
            }
          }

          openSelection(result.selection ?? null);
        } catch {
          setActiveSelection(null);
          setLines((prev) => [...prev, { type: "command", content: command }]);
          await wait(interactiveOutputLineDelay);
          setLines((prev) => [
            ...prev,
            {
              type: "output",
              content: "Something went wrong while running that command.",
              tone: "warning",
            },
          ]);
        } finally {
          setIsSubmitting(false);
          inputRef.current?.focus();
        }
      },
    [interactiveOutputLineDelay, onCommand],
  );

  const typeAndRunInteractiveCommand = useMemo(
    () =>
      async (rawCommand: string) => {
        const command = rawCommand.trim();

        if (!command) {
          return;
        }

        setIsAutoTyping(true);
        setInputValue("");
        historyIndexRef.current = null;

        for (let index = 0; index < command.length; index += 1) {
          const char = command[index];
          down(char);
          await wait(interactiveTypingSpeed + Math.random() * 20);
          up(char);
          setInputValue(command.slice(0, index + 1));
        }

        down("Enter");
        await wait(80);
        up("Enter");
        setIsAutoTyping(false);

        await executeInteractiveCommand(command);
      },
    [down, executeInteractiveCommand, interactiveTypingSpeed, up],
  );

  const prompt = (
    <span style={{ color: "var(--terminal-prompt-dim, rgba(110, 231, 183, 0.55))" }}>
      <span style={{ color: "var(--terminal-prompt-user, #6ee7b7)" }}>{username}</span>
      <span style={{ color: "var(--terminal-prompt-divider, #10b981)" }}>:</span>
      <span style={{ color: "var(--terminal-prompt-path, #bef264)" }}>~</span>
      <span style={{ color: "var(--terminal-prompt-symbol, rgba(167, 243, 208, 0.72))" }}>$</span>{" "}
    </span>
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canInteract || interactiveBusy) return;
    void executeInteractiveCommand(inputValue);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (activeSelection && activeSelection.options.length > 0) {
      const inputHasValue = inputValue.trim().length > 0;

      if (
        (event.key === "ArrowUp" || event.key === "ArrowLeft") &&
        !inputHasValue
      ) {
        event.preventDefault();
        setActiveSelectionIndex((currentIndex) =>
          currentIndex === 0
            ? activeSelection.options.length - 1
            : currentIndex - 1,
        );
        return;
      }

      if (
        (event.key === "ArrowDown" || event.key === "ArrowRight") &&
        !inputHasValue
      ) {
        event.preventDefault();
        setActiveSelectionIndex((currentIndex) =>
          currentIndex === activeSelection.options.length - 1
            ? 0
            : currentIndex + 1,
        );
        return;
      }

      if (event.key === "Enter" && !inputHasValue) {
        event.preventDefault();
        const selectedOption = activeSelection.options[activeSelectionIndex];

        if (selectedOption) {
          void executeInteractiveCommand(selectedOption.command);
        }

        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setActiveSelection(null);
        return;
      }
    }

    if (event.key === "ArrowUp" && history.length > 0) {
      event.preventDefault();
      const currentIndex = historyIndexRef.current;
      const nextIndex =
        currentIndex === null
          ? history.length - 1
          : Math.max(0, currentIndex - 1);
      historyIndexRef.current = nextIndex;
      setInputValue(history[nextIndex]);
      return;
    }

    if (event.key === "ArrowDown" && history.length > 0) {
      event.preventDefault();
      const currentIndex = historyIndexRef.current;
      if (currentIndex === null) {
        return;
      }

      const nextIndex = currentIndex + 1;

      if (nextIndex >= history.length) {
        historyIndexRef.current = null;
        setInputValue("");
        return;
      }

      historyIndexRef.current = nextIndex;
      setInputValue(history[nextIndex]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "mx-auto w-full max-w-xl px-4 font-mono text-xs",
        className,
      )}
    >
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Title Bar */}
        <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500 transition-colors hover:bg-red-600" />
            <div className="h-3 w-3 rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600" />
            <div className="h-3 w-3 rounded-full bg-green-500 transition-colors hover:bg-green-600" />
          </div>
          <div className="flex-1 text-center">
            <span
              className="truncate text-xs"
              style={{
                color:
                  "var(--terminal-topbar-text, var(--terminal-text-muted, rgba(110, 231, 183, 0.5)))",
              }}
            >
              <span className={cn(usernameEffect === "rainbow" && "terminal-rainbow-text")}>{username} — bash</span>
            </span>
          </div>
          <div className="w-[52px]" />
        </div>

        {/* Terminal Content */}
        <div
          ref={contentRef}
          className={cn(
            "terminal-themed-scrollbar h-80 overflow-y-auto p-4 font-mono",
            contentClassName,
          )}
          onClick={() => {
            if (canInteract) {
              inputRef.current?.focus();
            }
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "leading-relaxed",
                line.type !== "image" && "whitespace-pre-wrap",
              )}
            >
              {line.type === "command" ? (
                <span>
                  {prompt}
                  <SyntaxHighlightedText text={line.content} />
                </span>
              ) : line.type === "image" ? (
                <div
                  className={cn(
                    "mt-2 w-full overflow-hidden",
                    line.imageEffect === "zoomies" && "py-2",
                  )}
                >
                  <div
                    className={cn(
                      "overflow-hidden rounded-md border border-neutral-700 bg-black/40 p-2",
                      line.imageEffect === "zoomies"
                        ? "terminal-zoomies-card terminal-zoomies-motion will-change-[left,transform]"
                        : "w-full max-w-[14rem] md:max-w-[17rem]",
                    )}
                  >
                    <Image
                      src={line.imageSrc!}
                      alt={line.imageAlt ?? "Terminal image output"}
                      width={896}
                      height={1152}
                      className="block h-auto w-full rounded-sm object-cover"
                    />
                    {line.content ? (
                      <span
                        className="mt-2 block text-xs"
                        style={{
                          color:
                            "var(--terminal-text-muted, rgba(110, 231, 183, 0.5))",
                        }}
                      >
                        {line.content}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : line.href ? (
                <a
                  href={line.href}
                  target={line.external ? "_blank" : undefined}
                  rel={line.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 underline underline-offset-4 transition",
                  )}
                  style={{
                    ...outputColorStyles[line.tone ?? "default"],
                    textDecorationColor:
                      "var(--terminal-border, rgba(110, 231, 183, 0.18))",
                  }}
                >
                  <span>{renderTerminalText(line.content, line.textEffect)}</span>
                </a>
              ) : (
                <span style={outputColorStyles[line.tone ?? "default"]}>
                  {renderTerminalText(line.content, line.textEffect)}
                </span>
              )}
            </div>
          ))}

          {phase === "typing" && (
            <div className="leading-relaxed whitespace-pre-wrap">
              {prompt}
              <SyntaxHighlightedText text={currentText} />
              <span
                className="ml-0.5 inline-block h-4 w-2 align-middle"
                style={{ backgroundColor: "var(--terminal-cursor, #bbf7d0)" }}
              />
            </div>
          )}

          {(phase === "done" ||
            phase === "pausing" ||
            phase === "outputting") &&
            !canInteract && (
            <div className="leading-relaxed whitespace-pre-wrap">
              {prompt}
              <span
                className={cn(
                  "inline-block h-4 w-2 align-middle transition-opacity duration-100",
                  !cursorVisible && "opacity-0",
                )}
                style={{ backgroundColor: "var(--terminal-cursor, #bbf7d0)" }}
              />
            </div>
          )}

          {interactive &&
            phase === "done" &&
            activeSelection &&
            activeSelection.options.length > 0 && (
              <div>
                {activeSelection.title ? (
                  <div
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{
                      color:
                        "var(--terminal-text-muted, rgba(110, 231, 183, 0.5))",
                    }}
                  >
                    {activeSelection.title}
                  </div>
                ) : null}

                {activeSelection.hint ? (
                  <div
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{
                      color:
                        "var(--terminal-text-muted, rgba(110, 231, 183, 0.5))",
                    }}
                  >
                    {activeSelection.hint}
                  </div>
                ) : null}

                {activeSelection.options.map((option, index) => {
                  const isActive = index === activeSelectionIndex;
                  const optionColor =
                    option.color ??
                    "var(--terminal-text-default, rgba(236, 253, 245, 0.78))";

                  return (
                    <div
                      key={option.id}
                      className="leading-relaxed whitespace-pre-wrap"
                    >
                      <span
                        className="transition-opacity"
                        style={{
                          color:
                            option.textEffect === "rainbow"
                              ? "var(--terminal-text-strong, #ffffff)"
                              : optionColor,
                          opacity: isActive ? 1 : 0.72,
                        }}
                      >
                        {`${isActive ? ">" : " "} `}
                      </span>
                      <span
                        className={cn(
                          "transition-opacity",
                          option.textEffect === "rainbow" && "terminal-rainbow-text",
                        )}
                        style={{
                          color:
                            option.textEffect === "rainbow" ? undefined : optionColor,
                          opacity: isActive ? 1 : 0.72,
                          filter: isActive ? "brightness(1.12)" : "none",
                        }}
                      >
                        {option.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          {interactive && phase === "done" && !isSubmitting && (
            <form onSubmit={handleSubmit}>
              <label htmlFor="terminal-command-input" className="sr-only">
                Terminal command input
              </label>
              <div
                className="flex items-start gap-1.5 leading-relaxed whitespace-pre-wrap"
                onClick={() => inputRef.current?.focus()}
              >
                <span className="shrink-0">{prompt}</span>
                <div className="relative min-w-0 flex-1">
                  <input
                    id="terminal-command-input"
                    ref={inputRef}
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      historyIndexRef.current = null;
                    }}
                    onKeyDown={handleInputKeyDown}
                    disabled={!canInteract || interactiveBusy}
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    className="absolute inset-0 h-full w-full opacity-0"
                  />
                  <div
                    className="min-h-5 break-all"
                    style={{
                      color:
                        "var(--terminal-input-text, rgba(236, 253, 245, 0.82))",
                    }}
                  >
                    {inputValue ? <SyntaxHighlightedText text={inputValue} /> : null}
                    <span
                      className={cn(
                        "ml-0.5 inline-block h-4 w-2 align-middle transition-opacity duration-100",
                        !cursorVisible && "opacity-0",
                      )}
                      style={{
                        backgroundColor:
                          canInteract && !interactiveBusy
                            ? "var(--terminal-cursor, #bbf7d0)"
                            : "var(--terminal-cursor-disabled, rgba(74, 222, 128, 0.38))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {interactive && quickActions.length > 0 && (
          <div className="border-t border-neutral-800 bg-neutral-900/95 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="mr-2"
                style={{
                  color: "var(--terminal-quick-label, rgba(110, 231, 183, 0.45))",
                }}
              >
                quick:
              </span>
              {quickActions.map((action) => (
                <button
                  key={action.command}
                  type="button"
                  onClick={() => {
                    if (!canInteract || interactiveBusy) return;
                    void typeAndRunInteractiveCommand(action.command);
                  }}
                  disabled={!canInteract || interactiveBusy}
                  className="rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor:
                      "var(--terminal-quick-button-border, rgba(110, 231, 183, 0.2))",
                    color:
                      "var(--terminal-quick-button-text, rgba(209, 250, 229, 0.72))",
                    backgroundColor:
                      "var(--terminal-quick-button-bg, rgba(0, 0, 0, 0.12))",
                  }}
                >
                  {action.labelEffect === "shiny" ? (
                    <ShinyText
                      text={action.label}
                      speed={2.4}
                      color="var(--terminal-quick-button-text, rgba(209, 250, 229, 0.72))"
                      shineColor="var(--terminal-text-strong, #ffffff)"
                      spread={32}
                      className="inline-block"
                    />
                  ) : (
                    action.label
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

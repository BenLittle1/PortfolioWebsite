import type { Metadata } from "next";
import TerminalPortfolioShell from "@/app/components/TerminalPortfolioShell";

export const metadata: Metadata = {
  title: "Terminal Mode | Ben Little",
  description:
    "An experimental terminal-first version of Ben Little's portfolio where the shell becomes the primary navigation and storytelling layer.",
};

export default function TerminalPage() {
  return <TerminalPortfolioShell showPixelBlast={false} />;
}

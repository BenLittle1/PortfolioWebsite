import type { Metadata } from "next";
import TerminalPortfolioExperience from "@/app/components/TerminalPortfolioExperience";

export const metadata: Metadata = {
  title: "Terminal Mode | Ben Little",
  description:
    "An experimental terminal-first version of Ben Little's portfolio where the shell becomes the primary navigation and storytelling layer.",
};

export default function TerminalPage() {
  return <TerminalPortfolioExperience />;
}

import PixelBlast from "@/app/components/PixelBlast";
import TerminalPortfolioExperience from "@/app/components/TerminalPortfolioExperience";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#04150b]">
      <div className="fixed inset-0 z-0">
        <PixelBlast color="#5efc8d" transparent patternDensity={0.94} />
      </div>
      <div className="relative z-10">
        <TerminalPortfolioExperience solidBackground={false} />
      </div>
    </div>
  );
}

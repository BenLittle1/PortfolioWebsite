import PixelBlast from "@/app/components/PixelBlast";
import TerminalPortfolioExperience from "@/app/components/TerminalPortfolioExperience";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="fixed inset-0 z-0">
        <PixelBlast
          color="#5efc8d"
          transparent
          patternDensity={0.7}
          pixelSize={2.8}
          noiseAmount={0}
        />
      </div>
      <div className="relative z-10">
        <TerminalPortfolioExperience solidBackground={false} />
      </div>
    </div>
  );
}

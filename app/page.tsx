import PixelBlast from "@/app/components/PixelBlast";
import TerminalPortfolioExperience from "@/app/components/TerminalPortfolioExperience";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="fixed inset-0 z-0">
        <PixelBlast />
      </div>
      <div className="relative z-10">
        <TerminalPortfolioExperience solidBackground={false} />
      </div>
    </div>
  );
}

import Image from "next/image";

const StartQuizLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-y-4">
        <div className="w-20 h-20 relative animate-spin">
          <Image alt="logo" src="/logo.png" fill objectFit="contain" />
        </div>
        <p className="text-lg text-white">Starting quiz...</p>
      </div>
    </div>
  );
};

export default StartQuizLoader;

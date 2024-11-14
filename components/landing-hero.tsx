"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="text-black font-bond py-40 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-bold">
        <h1>Welcome to FinanceGPT</h1>
        <div className="text-lg font-normal">
          <p className="mx-auto max-w-[700px] mt-7 text-gray-500 md:text-xl lg:text-2xl" >
            Revolutionize your financial habits with AI-powered intelligence. Create, assess, and learn smarter ways to imprive your finances.
          </p> 
        </div>
      </div>
      <div >
        <div className="p-3">
        </div>
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button
            className="bg-purple-600 hover:bg-purple-700 md:text-lg lg:text-xl font-semibold" size="lg"
          >
            Explore Now!
          </Button>
        </Link>
      </div>
      <div className="text-zinc-400 text-xs md:text-sm font-normal">
      Start your journey with FinanceGPT. 
      </div>
    </div>
  );
};

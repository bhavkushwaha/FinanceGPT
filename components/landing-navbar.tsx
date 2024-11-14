"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export const LandingNavbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav className="py-5 px-10 w-full bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center mx-auto md:ml-0">
        <div className="relative h-8 w-8 mr-3">
          <Brain className="h-8 w-9 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold">FinanceGPT</h1>
      </Link>
      <div className="flex items-center gap-x-2">
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          {/* <Button variant="outline" className="rounded- bg-purple-600">
            <h3 className="font-semibold text-white">Get Started</h3>
          </Button> */}
          <Button
            className="hidden md:block bg-purple-600 hover:bg-purple-700 text-md font-semibold"
            size="lg"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
};

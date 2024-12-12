"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Google Form Clone</h1>
      <div className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/create">Create New Form</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/responses">View Responses</Link>
        </Button>
        <Button onClick={handleLogout} variant="secondary" className="w-full">
          Logout
        </Button>
      </div>
    </main>
  );
}

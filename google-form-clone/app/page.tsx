import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
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
      </div>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
      <p className="mb-6">Your response has been recorded.</p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}

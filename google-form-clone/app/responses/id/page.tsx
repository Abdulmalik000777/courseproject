"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ViewResponses({ params }: { params: { id: string } }) {
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

  // In a real application, you'd fetch this data from a database based on the form ID
  const responses = [
    {
      id: 1,
      name: "John Doe",
      experience: "Great product!",
      recommendation: "Very likely",
      features: ["Feature A", "Feature C"],
    },
    {
      id: 2,
      name: "Jane Smith",
      experience: "Could use some improvements",
      recommendation: "Somewhat likely",
      features: ["Feature B"],
    },
    {
      id: 3,
      name: "Bob Johnson",
      experience: "Excellent service!",
      recommendation: "Very likely",
      features: ["Feature A", "Feature B", "Feature D"],
    },
  ];

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Form Responses</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Recommendation</TableHead>
            <TableHead>Features Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>{response.name}</TableCell>
              <TableCell>{response.experience}</TableCell>
              <TableCell>{response.recommendation}</TableCell>
              <TableCell>{response.features.join(", ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

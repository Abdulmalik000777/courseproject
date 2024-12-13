"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Form {
  id: number;
  title: string;
  description: string;
  responseCount: number;
}

interface FormResponse {
  id: number;
  submittedAt: string;
  answers: { questionText: string; answer: string }[];
}

export default function ResponsesPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchForms = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/forms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setForms(data.forms);
        } else {
          setError("Failed to fetch forms. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, [router]);

  const fetchResponses = async (formId: number) => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}/responses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses);
        setSelectedForm(forms.find((form) => form.id === formId) || null);
      } else {
        setError("Failed to fetch responses. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Form Responses</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!selectedForm ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{form.description}</p>
                <p className="text-sm font-medium mt-2">
                  Responses: {form.responseCount}
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => fetchResponses(form.id)}>
                  View Responses
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button onClick={() => setSelectedForm(null)} className="mb-4">
            Back to Forms
          </Button>
          <h2 className="text-xl font-semibold mb-4">
            {selectedForm.title} - Responses
          </h2>
          {responses.length === 0 ? (
            <p>No responses yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission Date</TableHead>
                  {responses[0].answers.map((answer, index) => (
                    <TableHead key={index}>{answer.questionText}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      {new Date(response.submittedAt).toLocaleString()}
                    </TableCell>
                    {response.answers.map((answer, index) => (
                      <TableCell key={index}>{answer.answer}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}

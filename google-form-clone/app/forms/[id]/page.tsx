"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Question {
  id: number;
  question_text: string;
  question_type: "text" | "textarea" | "radio" | "checkbox";
  options?: string[];
}

interface Form {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function ViewForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Record<number, string | string[]>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const fetchForm = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/forms/${resolvedParams.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setForm(data.form);
      } else {
        setError("Failed to fetch form");
      }
    } catch (error) {
      console.error("Error fetching form:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const handleInputChange = (questionId: number, value: string | string[]) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not authenticated. Please log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/forms/${resolvedParams.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responses }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push(`/forms/${resolvedParams.id}/thank-you`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!form) {
    return <div className="text-center text-red-500">Form not found</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-800 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">{form.title}</h1>
      <p className="mb-6 text-gray-300">{form.description}</p>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {submitSuccess && (
        <Alert className="mb-4">
          <AlertDescription>
            Form submitted successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-md"
      >
        {form.questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={`question-${question.id}`}>
              {question.question_text}
            </Label>
            {question.question_type === "text" && (
              <Input
                id={`question-${question.id}`}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required
              />
            )}
            {question.question_type === "textarea" && (
              <Textarea
                id={`question-${question.id}`}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required
              />
            )}
            {question.question_type === "radio" && (
              <RadioGroup
                onValueChange={(value) => handleInputChange(question.id, value)}
                required
              >
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option}
                      id={`question-${question.id}-option-${index}`}
                    />
                    <Label htmlFor={`question-${question.id}-option-${index}`}>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {question.question_type === "checkbox" && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`question-${question.id}-option-${index}`}
                      onCheckedChange={(checked) => {
                        const currentResponses =
                          (responses[question.id] as string[]) || [];
                        if (checked) {
                          handleInputChange(question.id, [
                            ...currentResponses,
                            option,
                          ]);
                        } else {
                          handleInputChange(
                            question.id,
                            currentResponses.filter((r) => r !== option)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`question-${question.id}-option-${index}`}>
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
}

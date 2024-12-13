"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  id?: number;
  type: "text" | "textarea" | "radio" | "checkbox";
  question: string;
  options?: string[];
  order?: number;
}

interface Form {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function EditForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<Form>({
    id: 0,
    title: "",
    description: "",
    questions: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchForm = async () => {
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
          if (data.form) {
            setForm(data.form);
          }
        } else {
          setError("Failed to fetch form");
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [resolvedParams.id, router]);

  const addQuestion = () => {
    if (form) {
      setForm({
        ...form,
        questions: [
          ...form.questions,
          { type: "text", question: "", order: form.questions.length },
        ],
      });
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    if (form) {
      const updatedQuestions = [...form.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      setForm({ ...form, questions: updatedQuestions });
    }
  };

  const addOption = (questionIndex: number) => {
    if (form) {
      const updatedQuestions = [...form.questions];
      if (!updatedQuestions[questionIndex].options) {
        updatedQuestions[questionIndex].options = [];
      }
      updatedQuestions[questionIndex].options?.push("");
      setForm({ ...form, questions: updatedQuestions });
    }
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    if (form) {
      const updatedQuestions = [...form.questions];
      if (updatedQuestions[questionIndex].options) {
        updatedQuestions[questionIndex].options![optionIndex] = value;
        setForm({ ...form, questions: updatedQuestions });
      }
    }
  };

  const removeQuestion = (index: number) => {
    if (form) {
      const updatedQuestions = form.questions.filter((_, i) => i !== index);
      setForm({ ...form, questions: updatedQuestions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated. Please log in.");
        return;
      }

      const response = await fetch(`/api/forms/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update form");
      }
    } catch (error) {
      console.error("Error updating form:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Form</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Form Title</Label>
          <Input
            id="title"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Form Description</Label>
          <Textarea
            id="description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        {form.questions.map((question, index) => (
          <div key={index} className="border p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeQuestion(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id={`question-${index}`}
              value={question.question || ""}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
              className="mb-2"
              required
            />
            <Select
              value={question.type}
              onValueChange={(value) =>
                updateQuestion(index, "type", value as Question["type"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Short Answer</SelectItem>
                <SelectItem value="textarea">Long Answer</SelectItem>
                <SelectItem value="radio">Multiple Choice</SelectItem>
                <SelectItem value="checkbox">Checkboxes</SelectItem>
              </SelectContent>
            </Select>
            {(question.type === "radio" || question.type === "checkbox") && (
              <div className="mt-2">
                <Label>Options</Label>
                {question.options?.map((option, optionIndex) => (
                  <Input
                    key={optionIndex}
                    value={option || ""}
                    onChange={(e) =>
                      updateOption(index, optionIndex, e.target.value)
                    }
                    className="mt-1"
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />
                ))}
                <Button
                  type="button"
                  onClick={() => addOption(index)}
                  className="mt-2"
                >
                  Add Option
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button type="button" onClick={addQuestion} className="w-full">
          <PlusIcon className="mr-2 h-4 w-4" /> Add Question
        </Button>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button type="submit">Update Form</Button>
        </div>
      </form>
    </div>
  );
}

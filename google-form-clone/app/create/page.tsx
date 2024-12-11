"use client";

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

export default function CreateForm() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
    }
  }, [router]);

  const [questions, setQuestions] = useState([{ type: "text", question: "" }]);

  const addQuestion = () => {
    setQuestions([...questions, { type: "text", question: "" }]);
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Form</h1>
      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Form Title</Label>
          <Input id="title" placeholder="Enter form title" />
        </div>
        <div>
          <Label htmlFor="description">Form Description</Label>
          <Textarea id="description" placeholder="Enter form description" />
        </div>
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label>Question {index + 1}</Label>
            <Input
              placeholder="Enter question"
              value={question.question}
              onChange={(e) =>
                updateQuestion(index, "question", e.target.value)
              }
            />
            <Select
              value={question.type}
              onValueChange={(value) => updateQuestion(index, "type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Short Answer</SelectItem>
                <SelectItem value="textarea">Paragraph</SelectItem>
                <SelectItem value="radio">Multiple Choice</SelectItem>
                <SelectItem value="checkbox">Checkboxes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button onClick={addQuestion}>Add Question</Button>
        <Button className="ml-2">Save Form</Button>
      </div>
    </div>
  );
}

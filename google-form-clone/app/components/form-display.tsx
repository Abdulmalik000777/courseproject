"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

interface Question {
  type: string;
  question: string;
  options?: string[];
}

interface FormDisplayProps {
  title: string;
  description: string;
  questions: Question[];
}

export default function FormDisplay({
  title,
  description,
  questions,
}: FormDisplayProps) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<number, string | string[]>>(
    {}
  );

  const handleInputChange = (index: number, value: string | string[]) => {
    setResponses({ ...responses, [index]: value });
  };

  const handleSubmit = () => {
    console.log("Form responses:", responses);
    // Here you would typically send the responses to your backend
  };

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/login");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="mb-6 text-gray-600">{description}</p>
      {questions.map((question, index) => (
        <div key={index} className="mb-6">
          <Label className="mb-2 block">{question.question}</Label>
          {question.type === "text" && (
            <Input
              value={(responses[index] as string) || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          )}
          {question.type === "textarea" && (
            <Textarea
              value={(responses[index] as string) || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          )}
          {question.type === "radio" && (
            <RadioGroup
              value={(responses[index] as string) || ""}
              onValueChange={(value: string | string[]) =>
                handleInputChange(index, value)
              }
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`q${index}-option${optionIndex}`}
                  />
                  <Label htmlFor={`q${index}-option${optionIndex}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {question.type === "checkbox" && (
            <div>
              {question.options?.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-2 mt-2"
                >
                  <Checkbox
                    id={`q${index}-option${optionIndex}`}
                    checked={((responses[index] as string[]) || []).includes(
                      option
                    )}
                    onCheckedChange={(checked) => {
                      const currentResponses =
                        (responses[index] as string[]) || [];
                      const newResponses = checked
                        ? [...currentResponses, option]
                        : currentResponses.filter((item) => item !== option);
                      handleInputChange(index, newResponses);
                    }}
                  />
                  <Label htmlFor={`q${index}-option${optionIndex}`}>
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <Button onClick={handleSubmit}>Submit</Button>
      <Button onClick={handleLogout} variant="outline" className="mt-4">
        Logout
      </Button>
    </div>
  );
}

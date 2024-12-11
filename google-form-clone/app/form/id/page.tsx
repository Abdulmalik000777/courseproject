/* eslint-disable @typescript-eslint/no-unused-vars */
import FormDisplay from "@/app/components/form-display";

export default function ViewForm({ params }: { params: { id: string } }) {
  // In a real application, you'd fetch this data from a database based on the form ID
  const formData = {
    title: "Customer Feedback",
    description:
      "We value your feedback. Please take a moment to fill out this survey.",
    questions: [
      { type: "text", question: "What's your name?" },
      {
        type: "textarea",
        question: "How was your experience with our product?",
      },
      {
        type: "radio",
        question: "How likely are you to recommend our product to others?",
        options: ["Very likely", "Somewhat likely", "Not likely"],
      },
      {
        type: "checkbox",
        question: "Which features did you use?",
        options: ["Feature A", "Feature B", "Feature C", "Feature D"],
      },
    ],
  };

  return <FormDisplay {...formData} />;
}

import { AskQuestion } from "@/components/analytics/ask-question";

export default function AskQuestionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ask a Question</h1>
        <p className="text-muted-foreground">
          Select your data, add filters, and summarize to get new insights.
        </p>
      </div>
      <AskQuestion />
    </div>
  );
}
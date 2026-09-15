"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";

type QuestionAnswerFormProps = {
  questionId: string;
  prompt: string;
  onSave: (questionId: string, answer: string) => Promise<unknown>;
};

export function QuestionAnswerForm({
  questionId,
  prompt,
  onSave,
}: QuestionAnswerFormProps) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAnswer = answer.trim();
    if (!nextAnswer) {
      setError("Add the family answer before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(questionId, nextAnswer);
      setAnswer("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save this answer. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <label htmlFor={`question-${questionId}`} className="sr-only">
        Answer: {prompt}
      </label>
      <textarea
        id={`question-${questionId}`}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        maxLength={1_000}
        disabled={saving}
        placeholder="Add what your family says…"
        className="min-h-24 bg-white/75"
      />
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button type="submit" className="primary" disabled={saving}>
        <Check size={16} />
        {saving ? "Saving answer…" : "Save family answer"}
      </button>
    </form>
  );
}

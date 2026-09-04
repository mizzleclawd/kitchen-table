"use client";

import { useRef, useState, type FormEvent } from "react";

export type RecipeCaptureFormValues = {
  title: string;
  story: string;
  sourceWords: string;
};

type RecipeCaptureFormProps = {
  onSubmit: (values: RecipeCaptureFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitting: boolean;
};

export function RecipeCaptureForm({
  onSubmit,
  onCancel,
  submitting,
}: RecipeCaptureFormProps) {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [sourceWords, setSourceWords] = useState("");
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!title.trim()) {
      setError("Give this recipe a name.");
      titleRef.current?.focus();
      return;
    }
    if (!sourceWords.trim()) {
      setError("Keep the original words with the recipe.");
      return;
    }

    setError(null);
    void onSubmit({
      title: title.trim(),
      story: story.trim(),
      sourceWords: sourceWords.trim(),
    });
  }

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={submit} noValidate>
      <label htmlFor="recipe-title">
        Recipe name <span aria-hidden="true">*</span>
        <input
          id="recipe-title"
          ref={titleRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          disabled={submitting}
          autoComplete="off"
          placeholder="Grandma's cornbread"
        />
      </label>
      <label htmlFor="recipe-story">
        Why it matters
        <textarea
          id="recipe-story"
          value={story}
          onChange={(event) => setStory(event.target.value)}
          maxLength={5000}
          disabled={submitting}
          placeholder="Made every Thanksgiving"
        />
      </label>
      <label htmlFor="recipe-source-words">
        Their words <span aria-hidden="true">*</span>
        <textarea
          id="recipe-source-words"
          value={sourceWords}
          onChange={(event) => setSourceWords(event.target.value)}
          maxLength={5000}
          disabled={submitting}
          placeholder="She said to use a little extra…"
        />
      </label>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <div className="flex items-center gap-3">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save as family draft"}
        </button>
        <button type="button" className="back" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

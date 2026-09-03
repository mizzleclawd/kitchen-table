"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Values collected by RecipeCaptureForm. All strings are caller-owned. */
export interface RecipeCaptureFormValues {
  /** Recipe title (required by default). */
  title: string;
  /** Free-form story or context, e.g. origin, occasion, notes. */
  story: string;
  /** Short words identifying where the recipe came from. */
  sourceWords: string;
}

/** Optional per-field/per-button label overrides. All have generic defaults. */
export interface RecipeCaptureFormLabels {
  title: string;
  story: string;
  sourceWords: string;
  submit: string;
  submitting: string;
  cancel: string;
}

export interface RecipeCaptureFormPlaceholders {
  title: string;
  story: string;
  sourceWords: string;
}

export interface RecipeCaptureFormMaxLengths {
  title: number;
  story: number;
  sourceWords: number;
}

export interface RecipeCaptureFormProps {
  /** Called with current values after native/inline validation passes. */
  onSubmit: (values: RecipeCaptureFormValues) => void | Promise<void>;
  /** Called when the user chooses to cancel. Hide the cancel button by omitting. */
  onCancel?: () => void;
  /** Seeds the fields; also restore a draft by remounting with new values via `key`. */
  initialValues?: Partial<RecipeCaptureFormValues>;
  /** True while the caller is persisting; disables fields and shows a pending label. */
  submitting?: boolean;
  /** Disables all fields and buttons (e.g. read-only contexts). */
  disabled?: boolean;
  /** Require a non-empty title before submit (default true). */
  requireTitle?: boolean;
  /** Require the source words before submit (default false). */
  requireSourceWords?: boolean;
  /** Label/button text overrides. */
  labels?: Partial<RecipeCaptureFormLabels>;
  /** Placeholder overrides. */
  placeholders?: Partial<RecipeCaptureFormPlaceholders>;
  /** Character limits, overridable to match caller-side constraints. */
  maxLengths?: Partial<RecipeCaptureFormMaxLengths>;
  /** Unique prefix for element ids when rendering multiple instances. */
  idPrefix?: string;
  /** Accessible name for the form landmark. */
  formLabel?: string;
  className?: string;
}

const defaultLabels: RecipeCaptureFormLabels = {
  title: "Title",
  story: "Story",
  sourceWords: "Source",
  submit: "Save",
  submitting: "Saving…",
  cancel: "Cancel",
};

const defaultPlaceholders: RecipeCaptureFormPlaceholders = {
  title: "Enter a title",
  story: "Add any background or context (optional)",
  sourceWords: "Who or where it came from (optional)",
};

const defaultMaxLengths: RecipeCaptureFormMaxLengths = {
  title: 200,
  story: 5000,
  sourceWords: 300,
};

/**
 * Generic, reusable capture form for a recipe entry: title, story/context,
 * and source words. Presentation-only: no data fetching, routing, or app
 * state. All content comes from props and leaves through callbacks, so it
 * stays free of any hardcoded user or family content.
 */
export function RecipeCaptureForm({
  onSubmit,
  onCancel,
  initialValues,
  submitting = false,
  disabled = false,
  requireTitle = true,
  requireSourceWords = false,
  labels,
  placeholders,
  maxLengths,
  idPrefix = "recipe-capture",
  formLabel = "Recipe details",
  className,
}: RecipeCaptureFormProps) {
  const mergedLabels = { ...defaultLabels, ...labels };
  const mergedPlaceholders = { ...defaultPlaceholders, ...placeholders };
  const mergedMaxLengths = { ...defaultMaxLengths, ...maxLengths };

  const [title, setTitle] = React.useState(initialValues?.title ?? "");
  const [story, setStory] = React.useState(initialValues?.story ?? "");
  const [sourceWords, setSourceWords] = React.useState(
    initialValues?.sourceWords ?? "",
  );
  const [titleError, setTitleError] = React.useState<string | null>(null);
  const [sourceWordsError, setSourceWordsError] = React.useState<string | null>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const sourceWordsRef = React.useRef<HTMLInputElement>(null);

  const ids = React.useMemo(
    () => ({
      title: `${idPrefix}-title`,
      story: `${idPrefix}-story`,
      sourceWords: `${idPrefix}-source-words`,
      titleHint: `${idPrefix}-title-hint`,
      titleError: `${idPrefix}-title-error`,
      storyHint: `${idPrefix}-story-hint`,
      sourceWordsHint: `${idPrefix}-source-words-hint`,
      sourceWordsError: `${idPrefix}-source-words-error`,
    }),
    [idPrefix],
  );

  const allDisabled = disabled || submitting;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (allDisabled) return;

    if (requireTitle && title.trim() === "") {
      setTitleError("A title is required.");
      titleRef.current?.focus();
      return;
    }
    if (requireSourceWords && sourceWords.trim() === "") {
      setSourceWordsError("Source words are required.");
      sourceWordsRef.current?.focus();
      return;
    }
    setTitleError(null);
    setSourceWordsError(null);
    void onSubmit({
      title: title.trim(),
      story: story.trim(),
      sourceWords: sourceWords.trim(),
    });
  }

  return (
    <form
      aria-label={formLabel}
      aria-busy={submitting}
      noValidate
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={ids.title} className="text-sm font-medium">
          {mergedLabels.title}
          {requireTitle ? (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
          {requireTitle ? <span className="sr-only"> (required)</span> : null}
        </label>
        <Input
          id={ids.title}
          ref={titleRef}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError && event.target.value.trim() !== "") {
              setTitleError(null);
            }
          }}
          placeholder={mergedPlaceholders.title}
          maxLength={mergedMaxLengths.title}
          required={requireTitle}
          aria-required={requireTitle}
          aria-invalid={titleError !== null}
          aria-describedby={
            titleError !== null
              ? `${ids.titleHint} ${ids.titleError}`
              : ids.titleHint
          }
          disabled={allDisabled}
          autoComplete="off"
        />
        <p id={ids.titleHint} className="text-xs text-muted-foreground">
          {requireTitle
            ? "A short, recognizable name."
            : "A short, recognizable name (optional)."}
        </p>
        {titleError !== null ? (
          <p id={ids.titleError} role="alert" className="text-xs text-destructive">
            {titleError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={ids.story} className="text-sm font-medium">
          {mergedLabels.story}
        </label>
        <textarea
          id={ids.story}
          value={story}
          onChange={(event) => setStory(event.target.value)}
          placeholder={mergedPlaceholders.story}
          maxLength={mergedMaxLengths.story}
          aria-describedby={ids.storyHint}
          disabled={allDisabled}
          rows={5}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
        <p id={ids.storyHint} className="text-xs text-muted-foreground">
          Background, memories, or notes — anything beyond the ingredients.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={ids.sourceWords} className="text-sm font-medium">
          {mergedLabels.sourceWords}
          {requireSourceWords ? (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
          {requireSourceWords ? <span className="sr-only"> (required)</span> : null}
        </label>
        <Input
          id={ids.sourceWords}
          ref={sourceWordsRef}
          value={sourceWords}
          onChange={(event) => {
            setSourceWords(event.target.value);
            if (sourceWordsError && event.target.value.trim() !== "") {
              setSourceWordsError(null);
            }
          }}
          placeholder={mergedPlaceholders.sourceWords}
          maxLength={mergedMaxLengths.sourceWords}
          required={requireSourceWords}
          aria-required={requireSourceWords}
          aria-invalid={sourceWordsError !== null}
          aria-describedby={
            sourceWordsError !== null
              ? `${ids.sourceWordsHint} ${ids.sourceWordsError}`
              : ids.sourceWordsHint
          }
          disabled={allDisabled}
          autoComplete="off"
        />
        <p id={ids.sourceWordsHint} className="text-xs text-muted-foreground">
          A few words on the origin, kept separate from the story.
        </p>
        {sourceWordsError !== null ? (
          <p id={ids.sourceWordsError} role="alert" className="text-xs text-destructive">
            {sourceWordsError}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={allDisabled}>
          {submitting ? mergedLabels.submitting : mergedLabels.submit}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={allDisabled}
          >
            {mergedLabels.cancel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

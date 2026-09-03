"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Check, ChevronRight, Clock3, Mic, NotebookPen, Play, Sparkles } from "lucide-react";
import { RecipeCaptureForm, type RecipeCaptureFormValues } from "@/components/RecipeCaptureForm";

type Recipe = { _id: string; title: string; story: string; sourceText: string; status: "draft" | "approved"; emoji: string; cookTimeMinutes: number | null };
type Detail = { ingredients: { name: string; amount: string | null }[]; steps: { body: string; minutes: number | null }[]; questions: { prompt: string; resolved: boolean }[] };

export default function Home() {
  const recipes = useQuery(api.recipes.list) as Recipe[] | undefined;
  const seed = useMutation(api.recipes.seedDemo);
  const create = useMutation(api.recipes.createDraft);
  const [id, setId] = useState<string | null>(null);
  const [capture, setCapture] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  useEffect(() => { if (recipes?.length === 0) void seed(); }, [recipes?.length, seed]);
  if (id) return <DetailView recipeId={id} onBack={() => setId(null)} />;
  async function submit(values: RecipeCaptureFormValues) {
    setSubmitting(true);
    setCaptureError(null);
    try {
      const nextId = await create({
        title: values.title,
        story: values.story,
        sourceText: values.sourceWords,
      });
      setCapture(false);
      setId(nextId);
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : "Could not save this recipe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return <main className="min-h-screen bg-[#fbf5ea] text-[#2a221b]"><div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
    <header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#c85d37] text-xl">🍲</div><div><p className="font-serif text-2xl font-semibold">Kitchen Table</p><p className="text-sm text-[#765f4d]">Recipes worth passing down</p></div></div><span className="rounded-full border border-[#dcc8ae] bg-white/70 px-3 py-1 text-xs font-medium text-[#765f4d]">The Davis family</span></header>
    <section className="mt-14 grid gap-8 md:grid-cols-[1.15fr_.85fr] md:items-end"><div><p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f4dfc1] px-3 py-1 text-sm font-medium text-[#8b3d21]"><Sparkles size={15} /> A living family cookbook</p><h1 className="font-serif text-5xl leading-[.94] tracking-tight sm:text-6xl">Keep the recipe.<br/><em className="text-[#c85d37]">Keep the voice.</em></h1><p className="mt-6 max-w-xl text-lg leading-8 text-[#685545]">Capture the way family really explains food—stories, pinches, and all—then turn it into a recipe everyone can cook.</p></div><div className="rounded-[2rem] bg-[#2d584f] p-6 text-[#fff8ed] shadow-xl shadow-[#a78462]/20"><p className="text-sm font-medium uppercase tracking-[.16em] text-[#c9e0c4]">Tonight at the stove</p><p className="mt-3 font-serif text-3xl">Cubed Steak,<br/>Gravy & Rice</p><p className="mt-6 flex items-center gap-2 text-sm text-[#dcecdc]"><Clock3 size={17}/>35 minutes · served with a story</p></div></section>
    <section className="mt-14"><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-serif text-3xl">The family book</h2><p className="mt-1 text-[#765f4d]">Source words stay with every recipe.</p></div><button onClick={() => setCapture(true)} className="primary"><Mic size={17}/>Capture a recipe</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(recipes ?? []).map(recipe => <button key={recipe._id} onClick={() => setId(recipe._id)} className="group min-h-64 rounded-[1.65rem] border border-[#e5d5bf] bg-[#fffdf9] p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><span className="text-4xl">{recipe.emoji}</span><span className={recipe.status === "approved" ? "approved" : "draft"}>{recipe.status === "approved" ? "Family approved" : "Needs a detail"}</span></div><h3 className="mt-8 font-serif text-3xl leading-none">{recipe.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#765f4d]">{recipe.story}</p><p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#a44829]">Open recipe <ChevronRight size={16}/></p></button>)}</div></section>
  </div>{capture && <div className="modal"><div className="modal-card"><div className="flex justify-between"><div><p className="eyebrow">New family recipe</p><h2 className="mt-2 font-serif text-3xl">Start with their words.</h2></div><button type="button" onClick={() => setCapture(false)} disabled={submitting} aria-label="Close capture form" className="text-2xl">×</button></div><p className="mt-3 text-sm leading-6 text-[#765f4d]">Paste what they said. The original is saved with the draft—no made-up measurements.</p><RecipeCaptureForm onSubmit={submit} onCancel={() => setCapture(false)} submitting={submitting} requireSourceWords labels={{ title: "Recipe name", story: "Why it matters", sourceWords: "Their words", submit: "Save as family draft" }} placeholders={{ title: "Grandma's cornbread", story: "Made every Thanksgiving", sourceWords: "She said to use a little extra..." }} formLabel="Capture a family recipe" className="mt-6" />{captureError ? <p role="alert" className="mt-4 text-sm text-red-700">{captureError}</p> : null}</div></div>}</main>;
}

function DetailView({ recipeId, onBack }: { recipeId: string; onBack: () => void }) {
  const data = useQuery(api.recipes.get, { recipeId: recipeId as never }) as (Detail & { recipe: Recipe }) | null | undefined;
  const approve = useMutation(api.recipes.approve); const [cooking, setCooking] = useState(false); const [step, setStep] = useState(0);
  if (!data) return <main className="min-h-screen bg-[#fbf5ea] p-8">Loading family recipe…</main>;
  if (cooking) { const current = data.steps[step]; return <main className="min-h-screen bg-[#1e403a] px-6 py-8 text-[#fff8ed]"><button onClick={() => setCooking(false)} className="back text-[#f8e9d4]"><ArrowLeft size={18}/>Exit Cook Mode</button><div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col justify-center text-center"><p className="eyebrow text-[#dfc6a5]">Step {step + 1} of {data.steps.length}</p><h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">{current?.body ?? "This recipe needs cooking steps first."}</h1>{current?.minutes && <p className="mt-8 text-[#f9e9d2]"><Clock3 className="mr-2 inline" size={18}/>Simmer about {current.minutes} minutes</p>}<div className="mt-12 flex justify-center gap-3"><button disabled={!step} onClick={() => setStep(step - 1)} className="secondary">Back</button><button disabled={step >= data.steps.length - 1} onClick={() => setStep(step + 1)} className="primary">Next step <ChevronRight size={18}/></button></div></div></main>; }
  const recipe = data.recipe; return <main className="min-h-screen bg-[#fbf5ea] px-5 py-8 text-[#2a221b] sm:px-8"><div className="mx-auto max-w-4xl"><button onClick={onBack} className="back text-[#765f4d]"><ArrowLeft size={18}/>The family book</button><section className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><div className="flex items-center gap-4"><span className="text-6xl">{recipe.emoji}</span><div><p className="eyebrow">{recipe.status === "approved" ? "Family approved" : "Family draft"}</p><h1 className="mt-1 font-serif text-5xl leading-none">{recipe.title}</h1></div></div><p className="mt-6 text-lg leading-8 text-[#685545]">{recipe.story}</p><div className="mt-9 rounded-[1.5rem] border border-[#e5d5bf] bg-[#fffdf9] p-6"><p className="flex items-center gap-2 font-semibold"><NotebookPen size={18} className="text-[#c85d37]"/>What was said</p><p className="mt-4 leading-7 text-[#5d4a3b]">“{recipe.sourceText}”</p></div></div><aside className="rounded-[1.75rem] bg-[#2d584f] p-7 text-[#fff8ed]"><p className="eyebrow text-[#c9e0c4]">Ready when you are</p><h2 className="mt-3 font-serif text-3xl">Cook it together.</h2><p className="mt-3 leading-7 text-[#dcecdc]">Big steps, no scrolling, and the family version stays close at hand.</p><button onClick={() => setCooking(true)} disabled={!data.steps.length} className="primary mt-7"><Play size={17} fill="currentColor"/>Start Cook Mode</button>{recipe.status === "draft" && <button onClick={() => void approve({ recipeId: recipe._id as never })} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#dcecdc]"><Check size={17}/>Mark family-approved</button>}</aside></section><section className="mt-12 grid gap-7 md:grid-cols-2"><div><h2 className="font-serif text-3xl">Ingredients</h2><ul className="mt-4 divide-y divide-[#e7d8c4] rounded-2xl border border-[#e5d5bf] bg-[#fffdf9] px-5">{data.ingredients.map(item => <li key={item.name} className="flex justify-between py-4"><span>{item.name}</span><span className="text-[#765f4d]">{item.amount ?? "to confirm"}</span></li>)}</ul></div><div><h2 className="font-serif text-3xl">Ask before it disappears</h2><div className="mt-4 space-y-3">{data.questions.filter(q => !q.resolved).map(q => <div key={q.prompt} className="rounded-2xl border border-[#efc580] bg-[#fff1d8] p-5 text-[#703a20]"><Sparkles size={17} className="mb-2"/>{q.prompt}</div>)}{!data.questions.some(q => !q.resolved) && <p className="rounded-2xl bg-[#e0eee0] p-5 text-[#315c43]">No open questions. This one is ready to pass down.</p>}</div></div></section></div></main>;
}

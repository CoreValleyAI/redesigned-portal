"use client";

/**
 * "Not sure?" — one or two taps to the product that fits (08 §2). Choices
 * are radio groups (keyboard: arrows move, space selects); the answer is a
 * card that links to the product, announced politely.
 */
import { useId, useState } from "react";
import { ProductCard } from "./product-card";
import { PRODUCTS, type ProductSlug } from "@/copy/en/products";
import { cn } from "@/lib/cn";

type First = "train" | "serve" | "teach" | "store" | "help";
type Pace = "steady" | "bursts";

const FIRST: { id: First; label: string }[] = [
  { id: "train", label: "Train or fine-tune a model" },
  { id: "serve", label: "Serve a model to users" },
  { id: "teach", label: "Teach, or run notebooks" },
  { id: "store", label: "Keep datasets and checkpoints" },
  { id: "help", label: "Get help planning" },
];

const WHY: Record<ProductSlug, string> = {
  reserved: "Steady training is cheapest on capacity held for you for a term.",
  "on-demand": "Bursts of training fit whole GPUs billed by the second.",
  inferencing: "Endpoints with NVIDIA NIM or KServe, served from inside the valley.",
  "mig-slicing": "A hardware-isolated slice per person is right for notebooks and classes.",
  storage: "Fast, S3-compatible storage beside the GPUs.",
  services: "Our engineers in Kathmandu size it with you and quote it in rupees.",
};

function pick(first: First | null, pace: Pace | null): ProductSlug | null {
  if (!first) return null;
  if (first === "train") return pace ? (pace === "steady" ? "reserved" : "on-demand") : null;
  return ({ serve: "inferencing", teach: "mig-slicing", store: "storage", help: "services" } as const)[first];
}

function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-4">
      <legend id={id} className="type-title-3 mb-4 text-ink">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "type-small cursor-pointer rounded-pill border px-4 py-2.5 transition-[background-color,border-color,color,transform] duration-[var(--dur-spring-snappy)] ease-spring has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hydro active:scale-[0.97]",
              value === o.id
                ? "border-ink bg-ink text-bg"
                : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            <input
              type="radio"
              name={id}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FitFinder() {
  const [first, setFirst] = useState<First | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);
  const slug = pick(first, pace);
  const product = slug ? PRODUCTS.find((p) => p.slug === slug)! : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="flex flex-col gap-10">
        <Choices
          label="What will you do first?"
          options={FIRST}
          value={first}
          onChange={(v) => {
            setFirst(v);
            setPace(null);
          }}
        />
        {first === "train" && (
          <Choices
            label="How will the work run?"
            options={[
              { id: "steady", label: "Steadily, for weeks or months" },
              { id: "bursts", label: "In bursts, now and then" },
            ]}
            value={pace}
            onChange={setPace}
          />
        )}
      </div>
      <div aria-live="polite" className="min-h-[16rem]">
        {product ? (
          <div
            className="flex flex-col gap-4"
            key={product.slug}
            style={{ animation: "cv-rise-in 520ms var(--ease-expo) both" }}
          >
            <p className="type-kicker text-hydro-ink light:text-hydro">Our suggestion</p>
            <ProductCard product={product} detail highlight morph={false} />
            <p className="type-small text-ink-2">{WHY[product.slug]}</p>
          </div>
        ) : (
          <div className="flex h-full min-h-[16rem] items-center justify-center rounded-panel border border-dashed border-line p-8 text-center">
            <p className="type-small max-w-[22ch] text-ink-3">
              Answer on the left and the product that fits appears here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

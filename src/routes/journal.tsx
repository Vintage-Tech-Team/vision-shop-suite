import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/journal")({
  component: Journal,
  head: () => ({
    meta: [
      { title: "Journal — Stitch Makers" },
      { name: "description", content: "Notes from the studio: craft, materials, the slow approach." },
    ],
  }),
});

const posts = [
  { n: "01", t: "Why we use Tuscan leather", d: "On the difference a tannery makes — and why our soles take three weeks to cure.", date: "Mar 2025" },
  { n: "02", t: "The case for fewer pieces", d: "We launched four products this year. Here's what didn't make it.", date: "Feb 2025" },
  { n: "03", t: "Inside the Biella mill", d: "A visit to the wool weavers who supply the Bridge Bomber.", date: "Jan 2025" },
];

function Journal() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-16">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Journal</p>
      <h1 className="mt-2 font-display text-6xl md:text-8xl">Field notes.</h1>
      <ul className="mt-16 divide-y divide-border border-y border-border">
        {posts.map((p) => (
          <li key={p.n} className="group grid gap-2 py-10 md:grid-cols-12 md:items-baseline">
            <span className="font-display text-2xl text-muted-foreground md:col-span-1">{p.n}</span>
            <div className="md:col-span-7">
              <h2 className="font-display text-3xl transition-opacity group-hover:opacity-60 md:text-4xl">{p.t}</h2>
              <p className="mt-2 text-muted-foreground">{p.d}</p>
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground md:col-span-4 md:text-right">{p.date}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

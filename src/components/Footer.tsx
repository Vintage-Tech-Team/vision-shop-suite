export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="overflow-hidden border-b border-border py-10">
        <div className="marquee flex shrink-0 gap-16 whitespace-nowrap font-display text-6xl md:text-8xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-16">
              <span>Atlas</span><span className="text-muted-foreground">—</span>
              <span>Made slowly</span><span className="text-muted-foreground">—</span>
              <span>Worn forever</span><span className="text-muted-foreground">—</span>
              <span>Est. 2024</span><span className="text-muted-foreground">—</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 text-sm md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">Atlas.</p>
          <p className="mt-3 text-muted-foreground">Premium essentials, made to outlast trends.</p>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Shop</p>
          <ul className="space-y-2"><li>Sneakers</li><li>Outerwear</li><li>Knitwear</li><li>Bottoms</li></ul>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Company</p>
          <ul className="space-y-2"><li>About</li><li>Journal</li><li>Stores</li><li>Contact</li></ul>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Newsletter</p>
          <p className="text-muted-foreground">New drops, first.</p>
          <form className="mt-3 flex border-b border-foreground">
            <input className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground" placeholder="your@email.com" />
            <button className="text-xs uppercase tracking-widest">Join →</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Atlas Studio. All rights reserved.
      </div>
    </footer>
  );
}

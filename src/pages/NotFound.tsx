import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl">404</h1>
        <p className="mt-4 text-muted-foreground">This page wandered off.</p>
        <Link to="/" className="mt-6 inline-block border-b border-foreground pb-0.5 text-sm uppercase tracking-widest">
          Return home
        </Link>
      </div>
    </div>
  );
}

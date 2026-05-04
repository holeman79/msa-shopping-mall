import Link from "next/link";
import { Nav } from "./nav";
import { AuthMenu } from "./auth-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-(--color-border) bg-(--color-background)/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          MSA Shop <span className="text-(--color-primary)">Console</span>
        </Link>
        <div className="flex items-center gap-6">
          <Nav />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-end gap-2">
      <Image
        className="w-8 h-8"
        src="/logo.png"
        alt="Atria logo"
        width={32}
        height={32}
      />
      <span className="text-2xl font-extrabold text-foreground tracking-tight">
        Atria
      </span>
    </Link>
  );
}

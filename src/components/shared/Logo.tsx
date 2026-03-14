import Link from "next/link";

interface LogoProps {
  href?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ href = "/", width = 280, height = 80, className }: LogoProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo-transparent.png"
      alt="Curavia"
      width={width}
      height={height}
      className={`h-20 w-auto max-h-full object-contain object-left brightness-0 ${className ?? ""}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="flex shrink-0 items-center">
        {img}
      </Link>
    );
  }

  return <span className="flex shrink-0 items-center">{img}</span>;
}

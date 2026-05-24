import logo from "@/assets/stitch-makers-logo.png";

type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className = "h-10 w-10", size }: LogoProps) {
  return (
    <img
      src={logo}
      alt="Stitch Makers"
      className={className}
      width={size}
      height={size}
      decoding="async"
    />
  );
}

export const StitchMakersLogo = Logo;

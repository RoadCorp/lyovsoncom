import clsx from "clsx";
import Image from "next/image";

interface Props {
  className?: string;
}

// One image for both themes: the light crest is the dark one inverted, so
// dark mode inverts it with CSS instead of downloading a second file.
export const Logo = ({ className }: Props) => {
  return (
    <span className={clsx("relative block h-[150px] w-[150px]", className)}>
      <Image
        alt="Lyovson.com crest"
        className="object-contain dark:invert"
        fill={true}
        priority={true}
        sizes="150px"
        src="/crest-dark-simple.webp"
      />
    </span>
  );
};

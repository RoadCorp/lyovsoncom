import clsx from "clsx";
import Image from "next/image";

interface Props {
  className?: string;
}

// Render both palette-matched crests (aubergine ink on light, warm cream on
// dark) and toggle with CSS to avoid a theme flash on first paint.
export const Logo = ({ className }: Props) => {
  return (
    <span className={clsx("relative block h-[150px] w-[150px]", className)}>
      <Image
        alt="Lyóvson.com crest"
        className="object-contain dark:hidden"
        fill={true}
        priority={true}
        sizes="150px"
        src="/crest-dark-simple.webp"
      />
      <Image
        alt=""
        aria-hidden={true}
        className="hidden object-contain dark:block"
        fill={true}
        sizes="150px"
        src="/crest-light-simple.webp"
      />
    </span>
  );
};

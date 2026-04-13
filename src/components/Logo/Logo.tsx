import clsx from "clsx";
import Image from "next/image";

interface Props {
  className?: string;
}

export const Logo = ({ className }: Props) => {
  return (
    <span className={clsx("relative block h-[150px] w-[150px]", className)}>
      <Image
        alt="Lyovson.com crest"
        className="object-contain dark:hidden"
        fill={true}
        priority={true}
        sizes="150px"
        src="/crest-dark-simple.webp"
      />
      <Image
        alt="Lyovson.com crest"
        className="hidden object-contain dark:block"
        fill={true}
        priority={true}
        sizes="150px"
        src="/crest-light-simple.webp"
      />
    </span>
  );
};

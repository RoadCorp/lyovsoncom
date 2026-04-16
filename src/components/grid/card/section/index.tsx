import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GridCardSectionBaseProps {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}

type GridCardSectionStaticProps = GridCardSectionBaseProps &
  Omit<ComponentPropsWithoutRef<"section">, "children" | "className"> & {
    mode?: "static";
  };

type GridCardSectionButtonProps = GridCardSectionBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "children" | "className"> & {
    mode: "button";
  };

type GridCardSectionProps =
  | GridCardSectionStaticProps
  | GridCardSectionButtonProps;

function getSectionClassName(
  className: string | undefined,
  isInteractive: boolean,
  flush: boolean
): string {
  return cn(
    "surface-panel",
    flush && "p-0",
    "focus-visible:outline-none",
    isInteractive && "ui-interactive cursor-pointer active:scale-[0.98]",
    className
  );
}

export const GridCardSection = (props: GridCardSectionProps) => {
  if (props.mode === "button") {
    const {
      children: buttonChildren,
      className: buttonClassName,
      flush: buttonFlush = false,
      mode: _buttonMode,
      type,
      ...buttonProps
    } = props;
    const sectionClassName = getSectionClassName(
      buttonClassName,
      true,
      buttonFlush
    );

    return (
      <button
        className={cn(
          sectionClassName,
          "h-full w-full appearance-none text-left"
        )}
        type={type ?? "button"}
        {...buttonProps}
      >
        {buttonChildren}
      </button>
    );
  }

  const {
    children: sectionChildren,
    className: sectionClassNameProp,
    flush: sectionFlush = false,
    mode: _sectionMode,
    ...sectionProps
  } = props;
  const sectionClassName = getSectionClassName(
    sectionClassNameProp,
    false,
    sectionFlush
  );

  return (
    <section className={sectionClassName} {...sectionProps}>
      {sectionChildren}
    </section>
  );
};

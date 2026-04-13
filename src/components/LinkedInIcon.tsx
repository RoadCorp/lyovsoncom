import type { SVGProps } from "react";

interface LinkedInIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  color?: string;
  size?: number | string;
  title?: string;
}

export function LinkedInIcon({
  className,
  color = "currentColor",
  size = 24,
  title = "LinkedIn",
  ...props
}: LinkedInIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <path
        d="M6.94 8.25H3.56V19.5h3.38V8.25ZM5.25 3A2.25 2.25 0 1 0 5.25 7.5 2.25 2.25 0 0 0 5.25 3Zm6.02 5.25H8.03V19.5h3.24v-5.9c0-1.56.3-3.08 2.23-3.08 1.9 0 1.93 1.78 1.93 3.18v5.8h3.24v-6.46c0-3.17-.68-5.6-4.38-5.6-1.78 0-2.98.98-3.47 1.9h-.05V8.25Z"
        fill={color}
      />
    </svg>
  );
}

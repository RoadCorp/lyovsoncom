"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubscribeFormProps {
  action: (formData: FormData) => void;
  buttonText: string;
  isPending: boolean;
}

export function SubscribeForm({
  buttonText,
  action,
  isPending,
}: SubscribeFormProps) {
  return (
    <form
      action={action}
      aria-busy={isPending}
      className="grid h-full grid-cols-2 grid-rows-2 items-center gap-2"
    >
      <Input
        aria-label="First Name"
        autoComplete="given-name"
        name="firstName"
        placeholder="First Name"
        required
        type="text"
      />

      <Input
        aria-label="Last Name"
        autoComplete="family-name"
        name="lastName"
        placeholder="Last Name"
        type="text"
      />

      <Input
        aria-label="Email"
        autoComplete="email"
        name="email"
        placeholder="Email"
        required
        type="email"
      />

      <Button className="grow" disabled={isPending} type="submit">
        {isPending ? "Submitting..." : buttonText}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { GridCard } from "@/components/grid";
import { cn } from "@/lib/utils";
import { ErrorMode } from "./error-mode";
import { FormMode } from "./form-mode";
import { InfoMode } from "./info-mode";
import { SuccessMode } from "./success-mode";
import type { SubscribeMode } from "./types";

interface SubscribeActionResponse {
  errors?: Record<string, string>;
  message: string;
  success: boolean;
}

interface GridCardSubscribeProps {
  buttonText?: string;
  className?: string;
  description?: string;
  handleSubmit: (
    prevState: SubscribeActionResponse,
    formData: FormData
  ) => Promise<SubscribeActionResponse>;
  title?: string;
}

export const GridCardSubscribe = ({
  title = "Subscribe to updates",
  description = "Get notified about new posts and projects",
  buttonText = "Subscribe",
  className,
  handleSubmit,
}: GridCardSubscribeProps) => {
  const [mode, setMode] = useState<SubscribeMode>("form");
  const [state, formAction, isPending] = useActionState(handleSubmit, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        // Check if message indicates already subscribed
        if (state.message.includes("already subscribed")) {
          setMode("info");
        } else {
          setMode("success");
        }
      } else {
        setMode("error");
      }
    }
  }, [state.message, state.success]);

  return (
    <GridCard
      className={cn("col-start-1 col-end-2 row-start-2 row-end-3", className)}
    >
      {
        {
          form: (
            <FormMode
              buttonText={buttonText}
              description={description}
              formAction={formAction}
              isPending={isPending}
              title={title}
            />
          ),
          success: <SuccessMode message={state.message} setMode={setMode} />,
          error: <ErrorMode message={state.message} setMode={setMode} />,
          info: <InfoMode message={state.message} setMode={setMode} />,
        }[mode]
      }
    </GridCard>
  );
};

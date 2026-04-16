import { Mail } from "lucide-react";
import { GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import { SubscribeForm } from "./subscribe-form";

interface FormModeProps {
  buttonText: string;
  description: string;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  title: string;
}

export const FormMode = ({
  title,
  description,
  buttonText,
  formAction,
  isPending,
}: FormModeProps) => {
  return (
    <>
      <GridCardSection
        className={cn(
          "col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-2 text-center"
        )}
      >
        <Mail
          aria-label="Email subscription"
          className="h-12 w-12 text-primary"
        />
        <h2 className={cn("tone-heading font-bold text-2xl")}>{title}</h2>
        <p className={cn("tone-muted text-sm")}>{description}</p>
      </GridCardSection>

      <GridCardSection className="col-start-1 col-end-4 row-start-3 row-end-4">
        <SubscribeForm
          action={formAction}
          buttonText={buttonText}
          isPending={isPending}
        />
      </GridCardSection>
    </>
  );
};

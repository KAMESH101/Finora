import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva("fin-btn", {
  variants: {
    variant: {
      default: "fin-btn-primary",
      destructive: "fin-btn-destructive",
      outline: "fin-btn-outline",
      secondary: "fin-btn-secondary",
      ghost: "fin-btn-ghost",
      link: "fin-btn-link",
    },
    size: {
      default: "",
      sm: "fin-btn-sm",
      lg: "fin-btn-lg",
      icon: "fin-btn-icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      loading?: boolean;
    }
>(({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <span className="fin-btn-spinner" aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </Comp>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };

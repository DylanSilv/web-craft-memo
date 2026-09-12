import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex size-12 shrink-0 items-center justify-center border font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        outline: "border-border bg-background text-foreground hover:bg-foreground hover:text-background",
        accent: "border-accent bg-accent text-accent-foreground hover:bg-foreground hover:text-background",
        ghost: "border-transparent bg-transparent text-foreground hover:border-border",
      },
      size: {
        default: "h-10 w-auto px-4",
        sm: "h-9 w-auto px-3",
        lg: "h-11 w-auto px-6",
        icon: "size-12",
      },
    },
    defaultVariants: { variant: "outline", size: "icon" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant, size, asChild, ...props }, ref) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

export { Button, buttonVariants };
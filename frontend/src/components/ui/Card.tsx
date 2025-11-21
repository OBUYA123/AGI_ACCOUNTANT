import { HTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-lg border border-gray-200 bg-white shadow-sm",
          "dark:border-gray-700 dark:bg-gray-800",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

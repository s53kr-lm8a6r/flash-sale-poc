import Button from "@mui/material/Button";

import type { ReactNode } from "react";

export type CommonUIButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  variant?: "text" | "outlined" | "contained";
};

export function CommonUIButton({
  children,
  onClick,
  color = "primary",
  variant = "contained",
}: CommonUIButtonProps) {
  return (
    <Button color={color} variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}

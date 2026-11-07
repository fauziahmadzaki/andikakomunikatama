"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ActionIconButton({
  icon: Icon,
  label,
  onPress,
  tone = "default",
  isDisabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  tone?: "default" | "destructive";
  isDisabled?: boolean;
}) {
  return (
    <TooltipTrigger>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        isDisabled={isDisabled}
        onPress={onPress}
        className={cn(
          tone === "destructive" &&
            "text-destructive hover:bg-destructive/10 hover:text-destructive"
        )}
      >
        <Icon />
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}

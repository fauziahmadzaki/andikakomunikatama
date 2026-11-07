"use client";

import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      selectedKey={value}
      onSelectionChange={(key) => onValueChange(String(key))}
      aria-label={ariaLabel}
      isDisabled={disabled}
      placeholder={placeholder}
      className={cn("w-full", className)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} id={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getMinutes, getSeconds } from "../lib/time";

export function TimeInput({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className: string;
}) {
  function updateMinutes(minutes: number) {
    onChange((minutes ?? 0) * 60 + getSeconds(value));
  }

  function updateSeconds(seconds: number) {
    onChange(getMinutes(value) * 60 + (seconds ?? 0));
  }

  return (
    <fieldset className={className}>
      <legend className="mb-1">{label}</legend>

      <div className="flex space-x-2">
        <Label>
          <div className="mb-1">Minutes</div>
          <Input
            type="number"
            min={0}
            value={getMinutes(value)}
            onChange={(e) => updateMinutes(parseNumberInput(e.target.value ?? "0"))}
          />
        </Label>
        <Label>
          <div className="mb-1">Seconds</div>
          <Input
            type="number"
            min={0}
            value={getSeconds(value)}
            onChange={(e) => updateSeconds(parseNumberInput(e.target.value ?? "0"))}
          />
        </Label>
      </div>
    </fieldset>
  );
}

function parseNumberInput(input: string): number {
  if (input == "") {
    return 0;
  }

  return parseInt(input);
}

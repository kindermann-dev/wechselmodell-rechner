import { useState, useEffect, useRef } from "react";

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  style?: React.CSSProperties;
  debounceMs?: number;
  id?: string;
  disabled?: boolean;
}

export function NumericInput({
  value,
  onChange,
  className = "form-input",
  placeholder = "0",
  min,
  max,
  step = "any",
  style,
  debounceMs = 200,
  id,
  disabled = false,
}: NumericInputProps) {
  // Keep local string state to allow typing, clearing with Backspace, etc.
  const [localValue, setLocalValue] = useState<string>(
    value === 0
      ? "0"
      : value !== undefined && value !== null
        ? String(value)
        : "",
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserTypingRef = useRef(false);

  // Synchronize when value changes externally (e.g. reset or programmatic change)
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setLocalValue(
        value === 0
          ? "0"
          : value !== undefined && value !== null
            ? String(value)
            : "",
      );
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    isUserTypingRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      isUserTypingRef.current = false;
      if (raw === "" || raw === "-") {
        onChange(0);
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    }, debounceMs);
  };

  const handleBlur = () => {
    isUserTypingRef.current = false;
    if (localValue === "" || localValue === "-") {
      setLocalValue("0");
      onChange(0);
    } else {
      const parsed = parseFloat(localValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else {
        setLocalValue("0");
        onChange(0);
      }
    }
  };

  return (
    <input
      type="number"
      id={id}
      className={className}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      style={style}
      disabled={disabled}
    />
  );
}

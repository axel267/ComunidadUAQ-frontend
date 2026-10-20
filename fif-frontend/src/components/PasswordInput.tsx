"use client";

import { useId, useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon } from "./icons";

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  rightSlot?: React.ReactNode;
}

export function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  autoComplete = "new-password",
  required = true,
  rightSlot,
}: PasswordInputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-slate-700" htmlFor={id}>
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200/80 transition-all duration-200 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-600/15">
        <div className="pl-3.5 flex items-center pointer-events-none text-slate-400">
          <LockIcon />
        </div>
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 pl-3 pr-11 rounded-xl bg-transparent text-slate-800 text-[14px] font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
        />
        <button
          type="button"
          aria-label="Mostrar u ocultar contraseña"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

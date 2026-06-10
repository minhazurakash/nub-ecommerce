"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(endDate: Date): TimeLeft {
  const diff = Math.max(0, endDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

interface SaleCountdownProps {
  daysFromNow?: number;
  className?: string;
}

function CountdownUnit({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/12 text-2xl font-bold tabular-nums text-primary-foreground sm:h-[4.5rem] sm:w-[4.5rem] sm:text-3xl">
        {value}
      </div>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/65 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function SaleCountdown({
  daysFromNow = 22,
  className,
}: SaleCountdownProps) {
  const [endDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(23, 59, 59, 0);
    return d;
  });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(endDate)
  );

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(endDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div className={cn("text-center", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
        Sale ends in
      </p>
      <div className="mt-5 flex items-center justify-center gap-2.5 sm:gap-3">
        <CountdownUnit value={pad(timeLeft.days)} label="Days" />
        <span className="mb-6 text-xl font-light text-primary-foreground/35">
          :
        </span>
        <CountdownUnit value={pad(timeLeft.hours)} label="Hours" />
        <span className="mb-6 text-xl font-light text-primary-foreground/35">
          :
        </span>
        <CountdownUnit value={pad(timeLeft.minutes)} label="Minutes" />
        <span className="mb-6 text-xl font-light text-primary-foreground/35">
          :
        </span>
        <CountdownUnit value={pad(timeLeft.seconds)} label="Seconds" />
      </div>
    </div>
  );
}

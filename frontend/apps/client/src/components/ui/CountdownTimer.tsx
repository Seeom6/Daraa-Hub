'use client';

/**
 * Countdown Timer Component
 * Displays a countdown to a specific date/time
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface CountdownTimerProps {
  endTime: string | Date;
  onEnd?: () => void;
  className?: string;
  showLabels?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  endTime,
  onEnd,
  className,
  showLabels = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const difference = +new Date(endTime) - +new Date();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if countdown ended
      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  const isEnded =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  if (isEnded) {
    return (
      <div className={cn('text-center', className)}>
        <span className="text-red-500 font-bold">انتهى العرض</span>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'يوم', show: timeLeft.days > 0 },
    { value: timeLeft.hours, label: 'ساعة', show: true },
    { value: timeLeft.minutes, label: 'دقيقة', show: true },
    { value: timeLeft.seconds, label: 'ثانية', show: true },
  ];

  return (
    <div className={cn('flex items-center gap-2 dir-ltr', className)}>
      {timeUnits.map((unit, index) => {
        if (!unit.show) return null;

        return (
          <div key={unit.label} className="flex items-center gap-2">
            {/* Time Box */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'bg-primary-600 dark:bg-primary-500 text-white',
                  'rounded-lg px-3 py-2 min-w-[3rem]',
                  'font-bold text-xl text-center'
                )}
              >
                {String(unit.value).padStart(2, '0')}
              </div>
              {showLabels && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {unit.label}
                </span>
              )}
            </div>

            {/* Separator */}
            {index < timeUnits.filter((u) => u.show).length - 1 && (
              <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                :
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}


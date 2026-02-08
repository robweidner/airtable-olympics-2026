/**
 * CountdownTimer - Live countdown to Opening Ceremonies
 * Updates every second
 */
import { useState, useEffect } from 'react';
import { OPENING_CEREMONY_DATE } from '../constants';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function calculateTimeLeft() {
    const diff = OPENING_CEREMONY_DATE - new Date();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      started: false,
    };
  }

  if (timeLeft.started) {
    return (
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-greenLight2 dark:bg-green-greenDark1/30 text-green-greenDark1 dark:text-green-greenLight1 rounded-full font-semibold shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-green" />
          </span>
          The Games Are Live!
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 sm:gap-6 mb-8">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}

function TimeUnit({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-blue-blue tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs sm:text-sm text-tertiary uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

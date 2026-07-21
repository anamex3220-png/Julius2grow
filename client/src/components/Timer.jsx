import { useEffect, useState } from 'react';

export default function Timer({ startedAt, timeLimitSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAt, timeLimitSeconds));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = computeRemaining(startedAt, timeLimitSeconds);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitSeconds, onExpire]);

  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const seconds = Math.max(remaining, 0) % 60;
  const low = remaining <= 60;

  return (
    <div className={`timer ${low ? 'low' : ''}`}>
      ⏱ {minutes}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

function computeRemaining(startedAt, timeLimitSeconds) {
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  return Math.ceil(timeLimitSeconds - elapsed);
}

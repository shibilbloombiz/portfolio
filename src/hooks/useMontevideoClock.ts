import { useState, useEffect } from 'react';

export function useMontevideoClock() {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    function updateClock() {
      try {
        const formatted = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Montevideo'
        }).format(new Date());
        setTime(formatted);
      } catch (e) {
        // Fallback
        const d = new Date();
        const utc = d.getTime() + d.getTimezoneOffset() * 60000;
        const mvd = new Date(utc - 3 * 3600000);
        const hh = String(mvd.getHours()).padStart(2, '0');
        const mm = String(mvd.getMinutes()).padStart(2, '0');
        setTime(`${hh}:${mm}`);
      }
    }

    updateClock();
    const interval = setInterval(updateClock, 5000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

/** Seconds as m:ss. */
export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Seconds for a sentence: "1 second", "13 seconds", then m:ss from a minute up ("1:13"). */
export const formatDuration = (s: number) => (s < 60 ? `${s} ${s === 1 ? "second" : "seconds"}` : formatTime(s));

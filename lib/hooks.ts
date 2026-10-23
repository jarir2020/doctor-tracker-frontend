/** Doctor Tracker: Provides a reusable delayed-value hook for responsive search inputs. */
"use client";

import { useEffect, useState } from "react";

/** Wait briefly after changes so fast typing results in fewer API requests. */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

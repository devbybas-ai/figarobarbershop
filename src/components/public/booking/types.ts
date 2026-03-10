export interface Barber {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  durationMinutes: number;
  price: string;
}

export type TimeSlot = { time: string; label: string };

export const CATEGORY_LABELS: Record<string, string> = {
  HAIRCUT: "Haircut",
  BEARD: "Beard",
  SHAVE: "Shaves",
  COMBO: "Combos",
  OTHER: "Other",
};

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} min`;
}

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h ?? "0", 10);
  const minute = m ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${minute} ${ampm}`;
}

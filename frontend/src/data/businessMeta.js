// Visual-only metadata keyed by business id — sector label shown in the
// sidebar and header. Persona/system-prompt data lives server-side in
// api/businesses.py.
export const BUSINESS_META = {
  hospital: { sector: "Healthcare" },
  hotel: { sector: "Hospitality" },
  restaurant: { sector: "Dining" },
  car_rental: { sector: "Mobility" },
  dental: { sector: "Healthcare" },
  fitness: { sector: "Wellness" },
  law_firm: { sector: "Legal" },
  real_estate: { sector: "Real Estate" },
};

// Initials for the avatar squares, derived from the business label so it
// stays correct even if labels change server-side.
export function initialsFor(label) {
  const words = label.replace(/&/g, " ").split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w[0]);
  return letters.join("").toUpperCase();
}

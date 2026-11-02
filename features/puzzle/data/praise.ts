/**
 * Openers for the win message, each read before "You reframed it in …". They suit any solve,
 * so nothing that assumes speed ("Lightning fast") or perfection ("Flawless").
 */
export const PRAISE = [
  "Nicely done.",
  "Bravo!",
  "Well done.",
  "Beautifully done.",
  "Encore!",
  "Bravissimo!",
  "Magnifique!",
  "Bellissimo!",
  "Splendid.",
  "Wonderful.",
  "Superb.",
  "Marvellous.",
  "Brilliant.",
  "Exquisite.",
  "Sublime.",
  "Lovely work.",
  "Fine work.",
  "Stunning work.",
  "Masterful.",
  "Pure artistry.",
  "Picture perfect.",
  "A masterpiece, restored.",
  "A fine restoration.",
  "Every piece in place.",
  "Whole again.",
  "Back in one piece.",
  "Order restored.",
  "It all fits.",
  "And there it is.",
  "Framed and finished.",
  "Gallery-ready.",
  "Museum quality.",
  "Fit for the Louvre.",
  "Worthy of a frame.",
  "Hang it on the wall.",
  "The curator approves.",
  "The eye of a curator.",
  "What an eye.",
  "Sharp eye.",
  "Steady hands.",
  "Elegantly done.",
  "Smoothly done.",
  "Well played.",
  "Nailed it.",
  "Spot on.",
  "Top marks.",
  "Hats off.",
  "Take a bow.",
  "Standing ovation.",
  "Chef's kiss.",
];

let last = -1;

/** A random opener, never the same one twice in a row. */
export function pickPraise() {
  let i = Math.floor(Math.random() * PRAISE.length);
  if (i === last) i = (i + 1) % PRAISE.length;
  last = i;
  return PRAISE[i];
}

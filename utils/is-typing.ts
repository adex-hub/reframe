/** True when a key press is going into a text field, so single-letter shortcuts should ignore it. */
export const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

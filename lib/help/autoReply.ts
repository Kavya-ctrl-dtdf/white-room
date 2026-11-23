// The automated reply every help query gets. {ref} is replaced with the query's reference number.

export const TOPIC_LABELS: Record<string, string> = {
  stay: "Finding a stay",
  booking: "A booking",
  owner: "Listing a property",
  other: "Something else",
};

const OPENING = "Thank you for writing to White Room. We have your message, reference {ref}.";
const CLOSING = "A person on our team will reply by email or phone within one working day.";

const MIDDLE: Record<string, string> = {
  stay: "Every home we list has been visited and checked in person, and each page shows the date of our visit and what we checked.",
  booking:
    "If you have already moved in and something does not match the listing, open My stays and report a problem. We call you within 2 hours.",
  owner: "For your property, we will send the next steps and arrange a visit. We list a home only after it passes our 30 checks.",
  other: "We read every message and will point you to the right person.",
};

export function autoReplyTemplate(topic: string): string {
  return [OPENING, MIDDLE[topic] ?? MIDDLE.other, CLOSING].join(" ");
}

export function fillReference(text: string, ref: string | null): string {
  return ref ? text.replaceAll("{ref}", ref) : text.replaceAll(", reference {ref}", "");
}

/** Reference numbers look like HQ-3F9A2C. Anything else is ignored. */
export function cleanReference(value: string | undefined): string | null {
  return value && /^HQ-[A-Z0-9]{6}$/.test(value) ? value : null;
}

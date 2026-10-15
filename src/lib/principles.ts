// Approved text from the brief, with the changes recorded in decisions.md.
export const principlesTitle = "How I build";

export const principles = [
  {
    n: "01",
    title: "Friction costs more than a missing feature.",
    body: [
      "The ATS check on Joben works without an account. A visitor sees the result before any sign-up.",
    ],
  },
  {
    n: "02",
    title: "I design the system, AI writes it.",
    body: [
      "AI makes me faster at debugging and implementation. I decide the flows and the structure of the system and explain them clearly to the AI, because code written without that guidance works inside a system that makes no sense.",
      "On Nyra I defined the duplicate rules first: same file hash, same email or same phone marks a duplicate. An admin merges two records in one database transaction that keeps experiences, notes and tags.",
    ],
  },
  {
    n: "03",
    title: "The product moves with the client.",
    body: [
      "At ThinkUp, development zones and county assignments change over time. I imported a county map of Romania and colored it from their zones. When the zone of a county changes, the high schools and ambassador students move with it automatically.",
    ],
  },
];

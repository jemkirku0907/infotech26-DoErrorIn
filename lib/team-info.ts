export interface Developer {
  name: string;
  formattedName: string;
  team: string;
}

export const TEAM_DEVELOPERS: Developer[] = [
  { name: 'Jemkirk L. Utana', formattedName: 'Utana, Jemkirk L.', team: 'DoErrorIn' },
  { name: 'John Michael Bautista', formattedName: 'Bautista, John Michael', team: 'DoErrorIn' },
  { name: 'Kirk Stanley Tan', formattedName: 'Tan, Kirk Stanley', team: 'DoErrorIn' },
  { name: 'Romaine Sison', formattedName: 'Sison, Romaine', team: 'DoErrorIn' },
  { name: 'Jhon Loyd Jalea', formattedName: 'Jalea, Jhon Loyd', team: 'DoErrorIn' }
];

/**
 * Checks if the user is asking about the developers, creators, or authors of TAGA-asK AI / Team DoErrorIn.
 */
export function isDeveloperQuery(text: string): boolean {
  const q = text.toLowerCase().trim();

  // Exclude administrative university leadership queries
  if (
    q.includes('president') ||
    q.includes('dean') ||
    q.includes('registrar') ||
    q.includes('director') ||
    q.includes('vice president')
  ) {
    return false;
  }

  const patterns = [
    /\b(who\s+(developed|created|made|built|programmed|authored|coded|designed)\s+(you|this|taga-?ask|the app|the system|the chatbot|the bot))\b/i,
    /\b(who\s+are\s+(the\s+)?(developers|creators|authors|makers|programmers|proponents|team\s+behind))\b/i,
    /\b(sino|sinong)\s+(ang\s+)?(nag\s*develop|gumawa|nag\s*code|nag\s*create|nag\s*program|may\s*gawa)\b/i,
    /\b(sino(-sino)?\s+(ang\s+)?(mga\s+)?(developer|developers|creator|creators|gumawa|authors?))\b/i,
    /\b(team\s*doerrorin|doerror!n|doerrorin)\b/i,
    /^(credits?|developers?|creators?|authors?|proponents?)[!.]*$/i,
    /\b(sino\s+ang\s+team\s+doerrorin|sino\s+si\s+doerrorin)\b/i
  ];

  return patterns.some(p => p.test(q));
}

/**
 * Returns the verified developer credits for Team DoErrorIn (no emojis).
 */
export function getDeveloperResponse(): string {
  return `### Developers of TAGA-asK AI

TAGA-asK AI was developed by **Team DoErrorIn** from the University of Makati (UMak):

1. **Utana, Jemkirk L.** | DoErrorIn
2. **Bautista, John Michael** | DoErrorIn
3. **Tan, Kirk Stanley** | DoErrorIn
4. **Sison, Romaine** | DoErrorIn
5. **Jalea, Jhon Loyd** | DoErrorIn

TAGA-asK AI was engineered to serve as an official AI knowledge assistant for University of Makati students, providing verified answers grounded strictly in the official Student Handbook, campus map directory, scholarships, and academic policies.`;
}

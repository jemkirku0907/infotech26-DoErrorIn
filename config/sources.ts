export interface SourceConfig {
  id: string; // e.g. "Source05", "Source01"
  fileName: string; // e.g. "Source05.pdf", "Source01.pdf"
  displayName: string;
  shortName: string;
  pageCount: number;
  priority: number; // 1 = highest / primary
  role: 'primary' | 'supporting';
  viewerUrl: string;
  googleDrivePreviewUrl?: string;
  googleDriveViewUrl?: string;
  description: string;
  badgeColor: 'amber' | 'blue' | 'emerald' | 'purple' | 'indigo';
}

export const SOURCES: SourceConfig[] = [
  {
    id: 'Source05',
    fileName: 'Source05.pdf',
    displayName: 'Student Handbook (Main Source)',
    shortName: 'Student Handbook',
    pageCount: 287,
    priority: 1,
    role: 'primary',
    viewerUrl: '/sources/Source05.pdf',
    googleDrivePreviewUrl: 'https://drive.google.com/file/d/1YKn5loiy3J33LoBZwwWYkQZDD_A-rSFt/preview',
    googleDriveViewUrl: 'https://drive.google.com/file/d/1YKn5loiy3J33LoBZwwWYkQZDD_A-rSFt/view?usp=sharing',
    description: 'Official University of Makati Student Handbook (2021 Edition v2) — primary institutional authority on rules, admission, enrollment, offenses, and student governance.',
    badgeColor: 'amber',
  },
  {
    id: 'Source01',
    fileName: 'Source01.pdf',
    displayName: 'Scholarships & Exemption Guidelines',
    shortName: 'Scholarships & Exemption',
    pageCount: 14,
    priority: 2,
    role: 'supporting',
    viewerUrl: '/sources/Source01.pdf',
    description: 'Official policies on entrance grants, Dean’s Lister exemptions, employee dependents, and token fee application steps.',
    badgeColor: 'blue',
  },
  {
    id: 'Source02',
    fileName: 'Source02.pdf',
    displayName: 'CCIS Computer Science GWA Rules',
    shortName: 'CCIS GWA Rules',
    pageCount: 2,
    priority: 3,
    role: 'supporting',
    viewerUrl: '/sources/Source02.pdf',
    description: 'Academic grade requirements, GWA retention standards, and course-specific retention policies for CCIS degree programs.',
    badgeColor: 'emerald',
  },
  {
    id: 'Source03',
    fileName: 'Source03.pdf',
    displayName: 'UMak Campus Map & Navigation Guide',
    shortName: 'Campus Map',
    pageCount: 6,
    priority: 4,
    role: 'supporting',
    viewerUrl: '/sources/Source03.pdf',
    description: 'Comprehensive directory of campus buildings (Admin Building, Academic 1-3, HPSB) floor plans and wings.',
    badgeColor: 'purple',
  },
  {
    id: 'Source04',
    fileName: 'Source04.pdf',
    displayName: 'Admin Building & University Offices Directory',
    shortName: 'Offices Directory',
    pageCount: 14,
    priority: 5,
    role: 'supporting',
    viewerUrl: '/sources/Source04.pdf',
    description: 'Directory of University President, Vice Presidents, Directors, office functions, and key performance indicators.',
    badgeColor: 'indigo',
  },
];

export const PRIMARY_SOURCE = SOURCES.find(s => s.role === 'primary')!;
export const SUPPORTING_SOURCES = SOURCES.filter(s => s.role === 'supporting');

export function getSourceById(id: string): SourceConfig | undefined {
  const norm = id.toLowerCase().replace('.pdf', '');
  return SOURCES.find(s => s.id.toLowerCase() === norm || s.fileName.toLowerCase() === `${norm}.pdf`);
}

export function getAllSources(): SourceConfig[] {
  return [...SOURCES].sort((a, b) => a.priority - b.priority);
}

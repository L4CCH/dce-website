const repo = 'hinxcode/digital-collections-explorer';
const repoUrl = `https://github.com/${repo}`;

export const site = {
  name: 'Digital Collections Explorer',
  tagline: 'Search digital collections, even with little or no metadata.',
  description:
    'Open-source, self-hosted exploratory search for digital collections with visual features. Natural language queries and reverse image search, even for collections with little or no descriptive metadata. Made for galleries, libraries, archives and museums.',
  url: 'https://digital-collections-explorer.com',
  repo,
  repoUrl,
  readmeUrl: `${repoUrl}#readme`,
  contributingUrl: `${repoUrl}/blob/main/CONTRIBUTING.md`,
  discussionsUrl: `${repoUrl}/discussions`,
  ideasUrl: `${repoUrl}/discussions/categories/ideas`,
  newIdeaUrl: `${repoUrl}/discussions/new?category=ideas`,
  issuesUrl: `${repoUrl}/issues`,
  goodFirstIssuesUrl: `${repoUrl}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
  skillUrl: `${repoUrl}/tree/main/skills/dce-setup`,
  containerImage: 'ghcr.io/hinxcode/digital-collections-explorer',
  zenodoUrl: 'https://doi.org/10.5281/zenodo.15744570',
  paper: {
    title:
      'Digital Collections Explorer: An Open-Source, Multimodal Viewer for Searching Digital Collections',
    journal: 'Computational Humanities Research',
    volume: 1,
    article: 'e14',
    doi: '10.1017/chr.2025.10017',
    url: 'https://doi.org/10.1017/chr.2025.10017',
    arxivUrl: 'https://arxiv.org/abs/2507.00961',
    year: 2025,
    authors: ['Ying-Hsiang Huang', 'Benjamin Charles Germain Lee'],
  },
  lab: {
    name: 'Lab for Computing Cultural Heritage',
    short: 'L4CCH',
    url: 'https://l4cch.github.io/lab-website/',
    institution: 'University of Washington Information School',
    institutionUrl: 'https://ischool.uw.edu/',
  },
  license: { name: 'Apache 2.0', spdx: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' },
};

export type Template = {
  id: 'photographs' | 'maps' | 'documents';
  name: string;
  lead: string;
  features: string[];
  demo: string;
  live: boolean;
};

export const templates: Template[] = [
  {
    id: 'photographs',
    name: 'Photographs',
    lead: 'A wall of images to wander through, for photo collections and image archives.',
    features: [
      'Opens on a shuffled wall of images, so there is something to see before anyone types',
      'Suggested searches set by the institution',
      'Shows each object once, however many photographs it has',
      'Every image has its own page, with similar images and a link back to the original record',
      'Search by text or by uploading a picture',
    ],
    demo: '/photographs/',
    live: false,
  },
  {
    id: 'maps',
    name: 'Maps',
    lead: 'Deep-zoom viewing for maps, plans and other large sheets.',
    features: [
      'Search by what is drawn: "a harbor," "a railroad junction," "a coat of arms"',
      'Lightbox with deep zoom for large sheets',
      'Reverse image search from an uploaded picture',
      'Links each map back to the holding institution',
    ],
    demo: '/maps/',
    live: false,
  },
  {
    id: 'documents',
    name: 'Documents',
    lead: 'Page-level search for born-digital and scanned documents.',
    features: [
      'Indexes PDFs page by page and searches them by what the page looks like',
      'Preview cards with the matching page, then the whole document in a viewer',
      'Download of the original file',
      'Works without OCR, so it also finds handwriting, diagrams and forms',
    ],
    demo: '/documents/',
    live: false,
  },
];

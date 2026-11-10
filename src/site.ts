const repo = 'L4CCH/digital-collections-explorer';
const repoUrl = `https://github.com/${repo}`;

export const path = (to: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${to}`;

export const site = {
  name: 'Digital Collections Explorer',
  tagline: 'Search digital collections, even with little or no metadata.',
  description:
    'Open-source, self-hosted exploratory search for digital collections with visual features. Natural language queries and reverse image search, even for collections with little or no descriptive metadata, and catalog search where records exist. Made for galleries, libraries, archives and museums.',
  url: 'https://l4cch.github.io/dce-website',
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
  containerImage: 'ghcr.io/l4cch/digital-collections-explorer',
  paper: {
    title:
      'Digital Collections Explorer: An Open-Source, Multimodal Viewer for Searching Digital Collections',
    journal: 'Computational Humanities Research',
    volume: 1,
    article: 'e14',
    doi: '10.1017/chr.2025.10017',
    url: 'https://doi.org/10.1017/chr.2025.10017',
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
  license: { name: 'MIT', spdx: 'MIT', url: 'https://opensource.org/license/mit' },
  docsLicense: { name: 'CC BY 4.0', spdx: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
};

export type Medium = {
  id: 'images' | '3d' | 'pdf' | 'zoom';
  name: string;
  option?: string;
  lead: string;
  features: string[];
};

export const media: Medium[] = [
  {
    id: 'images',
    name: 'Images',
    lead: 'Photographs, scans and other images, on every site.',
    features: [
      'Opens on a shuffled wall of images, so there is something to see before anyone types',
      'Searches what the images show and, where a catalog exists, what the records say, and tells visitors how it read their words',
      'Filters by group, such as the museums of one institution, and can keep only images that have a catalog record',
      'Shows each object once, however many photographs it has',
      'Every object has its own page, with its catalog record, similar images, where else it appears and a link back to the original record',
      'Search by text or by uploading a picture, or start from suggested searches set by the institution',
    ],
  },
  {
    id: '3d',
    name: '3D models',
    option: '3d',
    lead: 'Objects scanned or modeled in 3D, as .glb files.',
    features: [
      "An object's page opens its model, which visitors can turn and zoom",
      'Views drawn from each model are searched with the photographs, so a model is found by what it looks like',
      'Finds other objects of a similar shape',
      'The viewer loads only on the page of an object that has a model',
    ],
  },
  {
    id: 'pdf',
    name: 'PDFs',
    option: 'pdf',
    lead: 'Born-digital and scanned documents, searched page by page.',
    features: [
      'Indexes PDFs page by page and searches them by what each page looks like',
      'Works without OCR, so it also finds handwriting, diagrams and forms',
      'Shows the matching page, with the whole document one click away',
    ],
  },
  {
    id: 'zoom',
    name: 'Deep zoom',
    option: 'zoom',
    lead: 'Maps, plans and other large images served by IIIF image servers.',
    features: [
      "Opens an image in deep zoom from the institution's own IIIF server",
      'Loads only the part of the image in view, so a large sheet opens quickly',
      'Shows the plain image if the server does not answer',
    ],
  },
];

export type Showcase = {
  id: string;
  name: string;
  summary: string;
  url: string;
  image: string;
  alt: string;
  tries: string[];
};

export const showcases: Showcase[] = [
  {
    id: 'loc-maps',
    name: 'Historical Maps from the Library of Congress',
    summary: '562,842 map sheets, from fire insurance maps to city views and charts, searched by what is drawn on them.',
    url: 'https://digital-collections-explorer.com/',
    image: '/showcases/loc-maps.jpg',
    alt: "Search results for a bird's-eye view of a city: panoramic views of American cities",
    tries: ["a bird's-eye view of a city", 'a battlefield map', 'a globe'],
  },
];

export const searchUrl = (showcase: Showcase, query: string) =>
  `${showcase.url}#/search?q=${encodeURIComponent(query).replace(/%20/g, '+')}`;

const repo = 'L4CCH/digital-collections-explorer';
const repoUrl = `https://github.com/${repo}`;

export const path = (to: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${to}`;

export const site = {
  name: 'Digital Collections Explorer',
  tagline: 'The multimodal viewer for searching digital collections.',
  description:
    'The open-source, self-hosted multimodal viewer for searching digital collections: natural language queries and reverse image search, even for collections with little or no descriptive metadata, and catalog search where records exist. Made for galleries, libraries, archives, and museums.',
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
  softwareDoi: 'https://doi.org/10.5281/zenodo.15744570',
  paper: {
    title:
      'Digital Collections Explorer: An Open-Source, Multimodal Viewer for Searching Digital Collections',
    journal: 'Computational Humanities Research',
    volume: 1,
    article: 'e14',
    doi: '10.1017/chr.2025.10017',
    url: 'https://doi.org/10.1017/chr.2025.10017',
    year: 2025,
    arxiv: 'https://arxiv.org/abs/2507.00961',
    authors: [
      { name: 'Ying-Hsiang Huang', orcid: 'https://orcid.org/0009-0007-4570-7738' },
      { name: 'Benjamin Charles Germain Lee', orcid: 'https://orcid.org/0000-0002-1677-6386' },
    ],
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
};

export const media: Medium[] = [
  {
    id: 'images',
    name: 'Images',
    lead: 'Photographs, scans and other images, on every site.',
  },
  {
    id: '3d',
    name: '3D models',
    option: '3d',
    lead: 'Objects scanned or modeled in 3D, as .glb files.',
  },
  {
    id: 'pdf',
    name: 'PDFs',
    option: 'pdf',
    lead: 'Born-digital and scanned documents, searched page by page.',
  },
  {
    id: 'zoom',
    name: 'Deep zoom',
    option: 'zoom',
    lead: 'Maps, plans and other large images served by IIIF image servers.',
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

import type { ImageMetadata } from 'astro';

const steps = [400, 640, 960, 1280, 1600];

export const widthsOf = (image: ImageMetadata) => [...steps.filter((width) => width < image.width), image.width];

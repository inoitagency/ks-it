import { OFFICIAL_MEDIA } from "@/content/official-media";

export type GalleryItem = {
  title: string;
  date: string;
  img: string;
  images: string[];
  tag?: string;
  description?: string;
  highlights?: string[];
};

// Dates are intentionally not invented: the source gallery does not date these photographs.
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: "Technomantra", date: "Official archive", tag: "Technology",
    img: OFFICIAL_MEDIA.technomantra,
    images: [OFFICIAL_MEDIA.technomantra, "/images/official/technomantra-5.webp", "/images/official/technomantra-6.webp", "/images/official/technomantra-7.webp"],
    description: "Student activities and displays from Technomantra, documented in the official KS School photo gallery.",
  },
  {
    title: "Advent", date: "Official archive", tag: "Management",
    img: OFFICIAL_MEDIA.advent,
    images: [OFFICIAL_MEDIA.advent, "/images/official/advent-7.webp"],
    description: "Moments from Advent, KS School's management festival, from the school's official photo archive.",
  },
  {
    title: "Melange", date: "Official archive", tag: "Community",
    img: OFFICIAL_MEDIA.melange,
    images: [OFFICIAL_MEDIA.melange, "/images/official/melange-3.webp", "/images/official/melange-4.webp", "/images/official/melange-5.webp", "/images/official/melange-6.webp"],
    description: "Students and faculty coming together for Melange, as documented in the official school gallery.",
  },
  {
    title: "Seminars & Workshops", date: "Official archive", tag: "Academic",
    img: OFFICIAL_MEDIA.seminar,
    images: [OFFICIAL_MEDIA.seminar, "/images/official/seminar-4.webp"],
    description: "Academic sessions and audiences photographed at KS School and published in its official seminar gallery.",
  },
  {
    title: "Library & Learning", date: "Official archive", tag: "Library",
    img: OFFICIAL_MEDIA.galleryLibrary,
    images: [OFFICIAL_MEDIA.galleryLibrary, "/images/official/library-2.webp"],
    description: "Library and study photographs published on the official KS School library page.",
  },
  {
    title: "Our Campus", date: "Official archive", tag: "Campus",
    img: OFFICIAL_MEDIA.galleryCampus,
    images: [OFFICIAL_MEDIA.galleryCampus],
    description: "Learning spaces photographed for the official KS School website.",
  },
];

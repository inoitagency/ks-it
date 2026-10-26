/** Reviewed against official school/university sources on 14 October 2026. */
export const SCHOOL = {
  established: 1993,
  mscEstablished: 1998,
  email: "ksschool31@yahoo.co.in",
  phones: ["+91 79 26305972", "+91 79 26302119"],
  address: "Gujarat University Campus, Navrangpura, Ahmedabad, Gujarat 380009",
  website: "https://ksschool.org.in/",
  brochure: "https://ksschool.org.in/notice/5/KS_Broucher_05-05-2025_Final.pdf",
  mba: "https://ksschool.org.in/mbainfo.php",
  msc: "https://ksschool.org.in/mscinfo.php",
  placements: "https://ksschool.org.in/mbaplacement.php",
  directorMessage: "https://ksschool.org.in/ksdirector1.php",
  admissions: "https://gcas.gujgov.edu.in/",
  eligibilitySummary: "HSC with required subjects",
  eligibility: "The 2025 brochure requires English and at least one of Mathematics, Physics, Chemistry, Biology, Statistics, Accountancy or Book-Keeping at HSC level. Check the current admission notice for applicable board, category and schedule requirements.",
} as const;

// The school message is signed by Dr. B. S. Agrawal; do not reattribute it.
export const LEADERSHIP = [
  { name: "Prof. Jagdish S. Joshi", role: "Vice Chancellor (I/C)", affiliation: "Gujarat University", image: "/images/official/vice-chancellor.webp", source: "https://www.gujaratuniversity.ac.in/vicechancellor" },
  { name: "Dr. B. S. Agrawal", role: "I/C Director", affiliation: "KS School · Director's Desk", image: "/images/official/school-director.webp", source: SCHOOL.directorMessage },
  { name: "Dr. Piyush M Patel", role: "Registrar (I/C)", affiliation: "Gujarat University", image: "/assets/Dr.%20Piyush%20M%20Patel.jpg", source: "https://www.gujaratuniversity.ac.in/registrar" },
] as const;

// Historical MBA recruiters pictured on the official placement page, not guarantees.
export const PAST_MBA_RECRUITERS = [
  "HDFC Bank", "Amul", "Torrent Power", "Indiabulls", "SBI Life Insurance",
  "The Times of India", "Pantaloons", "Claris", "Kotak Securities", "Prathama Blood Centre",
] as const;

# Current production readiness

The site is a working redesign, not a verified production replacement yet.

## Completed

- Real campus, computer laboratory, library, Advent, Technomantra, Melange and
  seminar imagery is stored locally as WebP. Recruiter logo assets come from the
  official MBA placement page. Each source is recorded in
  `public/images/official/sources.json`.
- Image paths are centralized in `src/content/official-media.ts`; the gallery
  uses source categories without inventing event dates or attendance figures.
- Stock image providers have been removed from `src`.
- Desktop animation choreography and the curtain footer are preserved. Mobile
  leadership photos and names reveal together with reserved image height.
- The current hero video shows the KS School campus in the browser checks.
- Unsupported placement statistics, recruiter claims, admissions eligibility
  wording and invented contact details were corrected against official sources.
- Faculty and paper proxies no longer substitute sample records for failed
  requests. Data pages have cancellation, bounded backend waits and retry states.
- The contact proxy now exists, validates input and reports success only when
  the backend explicitly confirms success.
- One user-approved live contact test succeeded through the frontend proxy and
  appeared exactly once in the admin inquiry list. Inbox email delivery is separate
  and remains unverified.
- The three campus-experience tiles are connected to active, category-matched
  activities. Empty/error/broken images use labeled official archive photos;
  obvious placeholder activities and announcements are filtered.
- Beyond the Classroom automatically rotates while visible and stops its timer
  off-screen or in a hidden tab. Manual selection restarts the interval.

## Remaining release blockers

Live checks on 23 October 2026 confirmed that anonymous faculty requests return
500 (authenticated admin reads succeed), and 7 public attachments return 404.
See `backend-api-audit.md` for the actual routes, counts and required backend fixes.

- Verify email notifications/inbox delivery if required. Submission into the
  live admin inquiry list has been confirmed with one approved test; automated
  regression tests still mock writes and send no real messages.
- Verify that backend faculty, papers and notices are current school records;
  confirm deployment configuration (`SCHOOL_API_URL`) and availability.
- Repair public faculty access and missing paper/announcement files. Correct
  frontend routes are already in use; these failures were observed upstream.
- Have the school approve the copy, leadership attribution and admissions notice
  for the actual launch date. The linked brochure is from 2025, not a current
  admissions schedule. See `content-audit.md` for the source matrix.
- Review deployment-side protection for the public contact endpoint before launch.

## Image sources

- https://ksschool.org.in/
- https://ksschool.org.in/AboutUs.php
- https://ksschool.org.in/Libraryinfo.php
- https://ksschool.org.in/photoG1.php
- https://ksschool.org.in/mbaplacement.php

The source site's generic event/placement/seminar cover photos were inspected
and excluded when they appeared to be stock imagery.

# Live backend verification — 23 October 2026

Inspected the public frontend served by `https://ksadmin.onrender.com/` and its
`/assets/index-CIWJtrFk.js` bundle. It uses
`https://ks-server-hqsn.onrender.com`, the same origin configured by the redesign.
Routes below were checked with live requests; additional routes were identified
in the bundle but not exercised. No school records were created, updated or
deleted. Supplied credentials were used only to sign in and perform authorized
reads; credentials, tokens and cookies were not saved in the repository.

## Verified live reads

| Route | Anonymous result | Response field / count | Redesign |
| --- | --- | --- | --- |
| `GET /api/faculty` | **500** | Authenticated admin read: `faculty`, 5 records | Existing proxy uses the correct path, but public requests fail upstream. |
| `GET /api/oldPapers/getByCategory/All` | 200 | `oldPaper`, 5 records | Existing proxy matches the real response shape. |
| `GET /api/announcements/all/General` | 200 | `announcement`, 3 records | Existing proxy matches. |
| `GET /api/announcements/all/MBA` | 200 | `announcement`, 1 record | Existing proxy matches. |
| `GET /api/announcements/all/MSCIT` | 200 | `announcement`, 2 records | Existing proxy matches. |
| `GET /api/results/all/MBA` | 200 | `results`, 0 records | Separate results feature; not currently consumed by the redesign. |
| `GET /api/sliders` | 200 | `sliders`, 2 records | Admin-managed content; redesign currently uses its authored hero. |
| `GET /api/activities` | 200 | `activities`, 1 record | Admin-managed content; redesign currently uses its curated gallery. |
| `GET /api/about-us` | 200 | `aboutUs`, 1 record | Redesign currently uses source-reviewed copy. |

`POST /api/auth/login` succeeded with the supplied account and returned the admin
role. Authenticated `GET /api/faculty/currentUser` and
`GET /api/contact-us/all` succeeded. The latter returned `contactUs`, containing
2 inquiry records. Only response fields/counts were inspected for inquiries;
their messages and contact details are not included in this report.

## Confirmed blockers

1. **Public faculty access fails.** The same faculty URL returns 500 without
   authentication and 200 with an administrator session. Backend source is needed
   to determine the exact middleware/controller cause. Provide a public endpoint
   returning only intended, active faculty profile fields; keep management and
   account fields protected. Do not put administrator credentials/cookies into the
   public frontend or use them to make the public faculty endpoint work.
2. **Missing uploaded files.** Of 5 paper attachments, 3 return 404 and 2 return
   200 with PDF content. Of 5 announcement attachments supplied across 6 notices,
   4 return 404 and 1 returns a JPEG. One failed URL per affected category was
   also checked with a normal GET, confirming 404 rather than a HEAD-method issue.
   Check stored URL spelling/case, the uploaded files, static-file serving and
   deployment storage persistence. Restore/reupload only with school approval.
3. **Contact submission/delivery is unverified.** The inquiry records use the
   same `fullName`, `email`, `phone`, `message` fields as the redesign. This does
   not prove that `POST /api/contact-us/create` accepts a new submission or sends
   email. No test inquiry or email was sent. The admin frontend has a separate
   inquiry-response email action; its existence does not establish automatic
   email delivery for new inquiries.

Metadata for missing files (record IDs and stored/resolved paths) is saved locally
in the ignored `.browser-check/broken-public-files.json` to support repair. The
read-status/shape summary is in `.browser-check/live-api-audit.json`.

## Additional route families identified in the admin frontend

These are references in the deployed bundle, not a claim that every operation
was tested or is public:

- Dashboard: `GET /api/dashboard`.
- Sliders and activities: list/detail reads and create/update/status/reorder/delete
  operations; `/api/activities/activityTypes` and `/api/all-activities/...` reads.
- Announcements and results: category/detail reads and management operations.
- Papers: `/api/oldPapers/years`, `/api/oldPapers/:id`, category reads and management.
- About content: `/api/about-us`, `/api/about-us/:id` and management operations.
- Inquiries: `/api/contact-us/all` and `/api/contact-us/status/:id`.
- Faculty: `/api/faculty`, `/api/faculty/:id`, `/api/faculty/currentUser` and management.
- Research: `/api/books/...`, `/api/publications/...`, `/api/programmes/...`,
  `/api/paperPresented/...`, `/api/distinctions/...`, `/api/collaborations/...`,
  `/api/consultancies/...`.
- Authentication: `/api/auth/login`, `/api/auth/logout`, `/api/auth/change-password`.

The existing public site paths for papers and announcements are correct; route
renaming would not repair missing uploads or the faculty authentication issue.
Records matching the admin database are not independently certified as genuine
school content. School review is still required for final published data.

## Integration follow-up

- The existing Workshops / Events / Placements selector now reads
  `/api/activities` through a same-origin proxy. Active records are matched by
  activity type to the existing tiles, preserving the design and five-second
  rotation. Unknown categories, obvious test content and invalid photo URLs are
  excluded. Empty, failed or broken-photo data uses an explicitly labeled official
  school archive photograph, not an invented live activity.
- The inspected activity was a Latin placeholder with a YouTube-logo image.
  The six inspected announcements also contained explicit testing/greeting/junk
  content. Obvious placeholders are filtered from announcements. These checks
  cannot certify the truth of future entries; published records still need school
  review. Admin data was not edited to implement these filters.
- Hero and About remain static as requested. Results are outside the existing
  frontend scope; no additional section was added.
- **Contact submission verified:** the user approved one labeled live test.
  Posting through the local frontend proxy returned HTTP 200 / `success: true`;
  an authenticated read found exactly one matching inquiry in the admin system.
  Marker: `WEBSITE-INTEGRATION-20261023-01`. No automatic retry or duplicate
  submission was made. Email inbox delivery remains unverified. The earlier
  contact limitation above describes the initial read-only audit, before this test.

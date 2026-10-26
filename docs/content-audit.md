# Content review — 15 October 2026

The redesign was compared with the public school website, the school's 2025
brochure, Gujarat University leadership pages and GCAS. Historical material is
not presented as a current admissions or placement guarantee.

| Area | Correction | Official reference |
| --- | --- | --- |
| Programs | Five-year integrated MBA and M.Sc. (CA & IT); BBA/BSc undergraduate stage. Removed invented year-by-year modules and mandatory six-month project claims. | [MBA](https://ksschool.org.in/mbainfo.php), [MSc](https://ksschool.org.in/mscinfo.php) |
| Specializations and eligibility | Use published 2025 brochure subjects and specializations; current availability, board rules and dates require the current notice. Removed “any stream” and “Maths only” eligibility. | [2025 brochure](https://ksschool.org.in/notice/5/KS_Broucher_05-05-2025_Final.pdf) |
| Admissions | Corrected the GCAS name and replaced the unrelated ACPC destination. | [Gujarat Common Admission Services](https://gcas.gujgov.edu.in/) |
| Placements | Removed unsupported salaries, placement percentages, offers, recruiter totals and employer names. Listed logos/names are explicitly historical MBA recruiters, including on the MSc page. Replaced invented job offers with practical-learning activities. | [MBA placement archive](https://ksschool.org.in/mbaplacement.php) |
| Leadership | University pages identify Prof. Jagdish S. Joshi and Dr. Piyush M Patel as acting office holders. The school director message is signed by Dr. B. S. Agrawal; its attribution and portrait were corrected. The requested public attribution link was removed from the redesigned page. | [Vice Chancellor](https://www.gujaratuniversity.ac.in/vicechancellor), [Registrar](https://www.gujaratuniversity.ac.in/registrar), [Director message](https://ksschool.org.in/ksdirector1.php) |
| Contact | Replaced invented email addresses and phone numbers with the published Yahoo address and both school numbers. | [Contact](https://ksschool.org.in/ContactUs.php) |
| About | Removed the unsupported alumni count and blanket career-readiness guarantee. | [About](https://ksschool.org.in/AboutUs.php) |
| Media | Removed external stock-photo sources. Distinct section photos are hosted locally; exact source URLs, dimensions and derivatives are in `public/images/official/sources.json`. A gallery dialog retains its own cover photograph, and the director's identity portrait is shared with the leadership section. | [School gallery](https://ksschool.org.in/photoG1.php), [School homepage](https://ksschool.org.in/) |
| Backend records | Removed sample faculty/papers returned as successful live records. Outages now produce failure responses and a visible retry state. | Existing project backend integration; live records still require school verification. |

## Layout and behavior

- People Behind retains the original pinned desktop animation at widths of
  768px and above. Cards scale to fit narrower/shorter desktop windows. Mobile
  photos reserve their height and reveal together with the name and role.
- Explore Campus uses the original college entrance photograph.
- Beyond the Classroom rotates every five seconds while visible, and still
  responds to hover, click, focus and touch. Manual selection restarts the timer;
  off-screen/hidden-tab rotation stops.
- The curtain footer is restored from 768px upward. Mobile retains normal flow.
- The loader appears on the first homepage visit in a browser tab/session;
  reloading that session does not replay it.

## Verification limits

Public source agreement cannot certify that school policies or historical
placement partners are current. The 2025 brochure is labeled by year. Backend
failure/validation tests use mocked upstream responses and send no messages.
Successful live contact delivery, current faculty/papers/notices and school
approval of the final copy remain release checks.

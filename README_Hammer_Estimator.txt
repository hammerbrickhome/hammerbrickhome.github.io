Hammer Brick & Home LLC — Advanced Estimator (Angi-style)

Files in this zip:
- estimator-advanced.js

How to use:

1. On your project-estimator.html page, find the existing <script> block that starts with:
   document.addEventListener("DOMContentLoaded", () => { ... });

2. Remove that inline JS block and instead add this line BEFORE </body>:

   <script src="/js/estimator-advanced.js"></script>

   (Or update the path to wherever you upload estimator-advanced.js.)

3. Upload estimator-advanced.js to your server (e.g., /js/estimator-advanced.js).

This keeps your existing layout (form on the left, results on the right) and
adds:
- National vs NYC average ranges
- Cost breakdown bars
- Complexity score & smart insights
- Extra brand options for Standard / Premium / Luxury
- "Email me this estimate" CTA
- "Save / Print PDF" button (opens printable view; use browser 'Save as PDF')
- Text-photos CTA link for faster quote.

All original functions and behaviors are preserved; this file is a drop-in replacement
for the previous estimator logic.

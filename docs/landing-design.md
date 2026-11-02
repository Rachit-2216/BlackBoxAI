# BlackBoxAI landing page

## Direction

A frontend-only firmware research landing page. Matte black, silver hardware, acid yellow, generous space, and precise typography replace the earlier green command-center composition. Downforce Creative and DataCanvas supplied general inspiration for confident art direction and interactive product storytelling; all implementation is original.

## Journey

1. The opening presents a procedural silver cube assembled from 27 rounded blocks. Pointer movement changes the viewing angle. The open button separates the blocks around the central core; scroll also opens and rotates the assembly.
2. A light process section changes an exploded feature diagram through deconstruction, recognition, and investigation. Scroll updates the active stage; buttons allow direct selection.
3. The evidence lab presents three illustrative binaries. Sample selection changes all evidence, tabs show overview, primitives, or findings, replay demonstrates scanning, and export downloads an explicitly labeled demo report.
4. Research principles, accessible expandable field notes, and a final lab/source call to action complete the page.

## Scope and implementation

The entry point renders only Landing. There are no API calls, uploads, credentials, or backend requirements. Existing backend and legacy tool-page sources remain available separately. Motion handles page reveals and scroll values; Three.js and React Three Fiber render the core. Existing dependencies are reused.

The 3D chunk is lazy-loaded, rendering pauses outside the viewport, and device pixel ratio is capped. Reduced motion removes pointer drift, automatic rotation, scroll transforms, and looping CSS effects. Manual open/reassemble remains available. A static procedural representation handles failed WebGL initialization.

## Verification

Run lint and production build. Check desktop at 1440 and 1920 pixels, mobile at 390 pixels, no horizontal overflow, keyboard navigation, sample switching, all evidence tabs, scan replay, report export, FAQ, reduced motion, and visible canvas pixels. The existing Vercel build/output settings remain applicable.

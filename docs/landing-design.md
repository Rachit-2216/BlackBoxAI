# BlackBoxAI landing page

## Direction

A frontend-only firmware research landing page. Matte black, silver hardware, acid yellow, generous space, and precise typography replace the earlier green command-center composition. Downforce Creative and DataCanvas supplied general inspiration for confident art direction and interactive product storytelling; all implementation is original.

## Journey

1. The opening presents a procedural silver cube assembled from 27 rounded blocks. Pointer movement changes the viewing angle. Native scrolling separates and rotates the blocks: the hero pins for 420 pixels, opening finishes by 320 pixels, and the open assembly holds briefly before the page continues. There is no click-to-open control. Scrolling backward reassembles the cube. Reduced motion removes the pin and extra scroll distance.
2. A light process section changes an exploded feature diagram through deconstruction, recognition, and investigation. Scroll updates the active stage; buttons allow direct selection.
3. The evidence lab presents three illustrative binaries. Sample selection changes all evidence, tabs show overview, primitives, or findings, replay demonstrates scanning, and export downloads an explicitly labeled demo report.
4. Research principles, accessible expandable field notes, and a final lab/source call to action complete the page.

## Scope and implementation

The entry point renders only Landing. There are no API calls, uploads, credentials, or backend requirements. Existing backend and legacy tool-page sources remain available separately. Motion handles page reveals and scroll values; Three.js and React Three Fiber render the core. Existing dependencies are reused.

The 3D chunk is lazy-loaded, rendering pauses outside the viewport, and device pixel ratio is capped. Reduced motion removes pointer drift, automatic rotation, scroll transforms, pinning, and looping CSS effects, and shows a stable partially open core. A static procedural representation handles failed WebGL initialization.

## Verification

### Motion and readability update (2026-11-03)

The hero uses a viewport-height grid so the core control and primary CTA remain visible at standard desktop and mobile dimensions, including 1920x935. The accent is a softer citron with explicit dark text and icon colors; supporting copy is brighter. CTA contrast is checked at a minimum 7:1.

Headlines decode on entry and pointer hover using layout-stable text layers. A pinned, scroll-driven passage moves physical data slabs through binary, pattern, and evidence states. A scroll-linked statement reveals word colors, a shard traces page progress, terminal lines stagger, and core blocks rotate independently around a moving scan line. Motion uses existing Motion and Three.js dependencies. Reduced-motion mode removes decoding, parallax, looping effects, and sticky scrolling duration.

Run lint and production build. Check desktop at 1440 and 1920 pixels, mobile at 390 pixels, no horizontal overflow, keyboard navigation, sample switching, all evidence tabs, scan replay, report export, FAQ, reduced motion, and visible canvas pixels. The existing Vercel build/output settings remain applicable.

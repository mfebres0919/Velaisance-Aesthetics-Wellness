/* ==========================================================================
   Smooth scrolling (every page)
   Lenis (javascript/vendor/lenis.min.js) eases mouse-wheel and trackpad
   scrolling so the page glides instead of stepping. Not loaded on touch
   screens (phones already have momentum). In-page links (#services etc.)
   glide too, stopping just below the sticky header. Off for reduced motion.
   The instance is shared as window.lenis so other scripts can use it.
   ========================================================================== */
(function () {
    if (typeof Lenis === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch screens already scroll natively with momentum; skip Lenis there
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const header = document.getElementById("site-header");
    const headerOffset = () => -(header ? header.offsetHeight : 80);

    const lenis = new Lenis({
        duration: 1.1, // seconds a wheel scroll takes to settle; higher = floatier
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // fast start, soft landing
        smoothWheel: true,
        anchors: { offset: headerOffset() },
    });

    window.lenis = lenis;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
})();

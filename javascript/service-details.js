/* ==========================================================================
   Service details – FAQ accordion
   Native <details>, with the open and close animated by height so they
   glide instead of snapping. Only one answer stays open at a time.
   Without JavaScript the <details> still open and close normally.
   ========================================================================== */
(function () {
    const items = [...document.querySelectorAll(".faq__item")];
    if (!items.length) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = 450;

    function animate(item, opening) {
        const answer = item.querySelector(".faq__answer");
        if (reduceMotion) {
            item.open = opening;
            return;
        }
        item.classList.add("is-animating");
        const start = opening ? 0 : answer.scrollHeight;
        const end = opening ? answer.scrollHeight : 0;
        if (opening) item.open = true;
        const run = answer.animate(
            [{ height: `${start}px`, opacity: opening ? 0 : 1 }, { height: `${end}px`, opacity: opening ? 1 : 0 }],
            { duration: DURATION, easing: "cubic-bezier(.22, .61, .36, 1)" }
        );
        item.classList.toggle("is-open", opening);
        run.onfinish = () => {
            if (!opening) item.open = false;
            item.classList.remove("is-animating");
        };
    }

    items.forEach((item) => {
        item.classList.toggle("is-open", item.open);
        item.querySelector(".faq__question").addEventListener("click", (event) => {
            event.preventDefault();
            if (item.classList.contains("is-animating")) return;
            const opening = !item.open;
            if (opening) items.forEach((other) => { if (other !== item && other.open) animate(other, false); });
            animate(item, opening);
        });
    });
})();

/* ==========================================================================
   Service details – sticky side columns
   The services/booking column and the hours card stay in view while the
   longer column beside them scrolls. If a column is taller than the space
   under the header, it pins by its foot instead, so nothing is ever cut off.
   ========================================================================== */
(function () {
    const columns = [...document.querySelectorAll(".sd-aside, .sd-hours")];
    const header = document.getElementById("site-header");
    if (!columns.length) return;
    const GAP = 24;

    function update() {
        const headerBottom = header ? header.getBoundingClientRect().height : 0;
        columns.forEach((col) => {
            const fits = headerBottom + GAP;
            const byFoot = window.innerHeight - col.offsetHeight - GAP;
            col.style.setProperty("--sticky-top", `${Math.min(fits, byFoot)}px`);
        });
    }

    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
})();

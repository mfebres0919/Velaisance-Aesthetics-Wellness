/* ==========================================================================
   Shop page – category filter
   "All" shows every category section; a category tab shows just that one.
   The choice is kept in the URL hash (#candles), so links can point
   straight to a category and the back button works.
   ========================================================================== */
(function () {
    const tabs = [...document.querySelectorAll(".shop-tab")];
    const sections = [...document.querySelectorAll(".shop-cat")];
    if (!tabs.length) return;
    const bar = document.querySelector(".shop-tabs");

    function apply(filter, scroll) {
        if (!sections.some((s) => s.dataset.category === filter)) filter = "all";
        tabs.forEach((tab) => {
            const on = tab.dataset.filter === filter;
            tab.classList.toggle("is-active", on);
            tab.setAttribute("aria-pressed", String(on));
        });
        sections.forEach((section) => {
            const show = filter === "all" || section.dataset.category === filter;
            section.hidden = !show;
            section.classList.remove("is-entering");
            if (show) {
                void section.offsetWidth;
                section.classList.add("is-entering");
            }
        });
        if (scroll && bar) {
            const y = bar.getBoundingClientRect().top + window.scrollY - (document.getElementById("site-header")?.offsetHeight || 0);
            if (window.scrollY > y) window.lenis ? window.lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" });
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const filter = tab.dataset.filter;
            history.replaceState(null, "", filter === "all" ? location.pathname : `#${filter}`);
            apply(filter, true);
        });
    });

    apply(location.hash.slice(1) || "all", false);
})();

/* ==========================================================================
   Global – header, mobile menu, services dropdown
   ========================================================================== */
(function () {
    const header = document.getElementById("site-header");
    const nav = document.getElementById("site-nav");
    const menuToggle = document.querySelector(".site-header__menu-toggle");
    const dropdownItem = document.querySelector(".site-nav__item--dropdown");
    const dropdownToggle = document.querySelector(".site-nav__toggle");
    const desktopQuery = window.matchMedia("(min-width: 1100px)");

    if (!header || !nav || !menuToggle) return;

    // Shadow once the page scrolls
    const updateScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    // Mobile menu
    const setMenu = (open) => {
        // Panel starts under the header wherever it currently sits (top bar may be visible)
        nav.style.setProperty("--nav-top", `${header.getBoundingClientRect().bottom}px`);
        nav.classList.toggle("is-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("is-menu-open", open);
    };

    menuToggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    desktopQuery.addEventListener("change", () => setMenu(false));

    // Services dropdown (click/tap + keyboard; hover handled in CSS on desktop)
    const setDropdown = (open) => {
        dropdownItem.classList.toggle("is-open", open);
        dropdownToggle.setAttribute("aria-expanded", String(open));
    };

    if (dropdownItem && dropdownToggle) {
        dropdownToggle.addEventListener("click", () => setDropdown(!dropdownItem.classList.contains("is-open")));

        document.addEventListener("click", (event) => {
            if (desktopQuery.matches && !dropdownItem.contains(event.target)) setDropdown(false);
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (dropdownItem && dropdownItem.classList.contains("is-open")) {
            setDropdown(false);
            dropdownToggle.focus();
        } else if (nav.classList.contains("is-open")) {
            setMenu(false);
            menuToggle.focus();
        }
    });
})();

/* ==========================================================================
   Global – top bar rotating announcements
   ========================================================================== */
(function () {
    const messages = document.querySelectorAll(".top-bar__message");
    if (messages.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current = 0;
    setInterval(() => {
        messages[current].classList.remove("is-active");
        current = (current + 1) % messages.length;
        messages[current].classList.add("is-active");
    }, 5000);
})();

/* ==========================================================================
   Global – footer year
   ========================================================================== */
(function () {
    const year = document.getElementById("footer-year");
    if (year) year.textContent = new Date().getFullYear();
})();

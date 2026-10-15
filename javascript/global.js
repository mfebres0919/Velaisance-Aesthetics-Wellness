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
        document.documentElement.classList.toggle("is-menu-open", open);
        // Freeze the smooth-scrolled page behind the open menu
        if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
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

/* ==========================================================================
   Global – highlight the nav link for the section in view (scroll spy)
   ========================================================================== */
(function () {
    const links = document.querySelectorAll(".site-nav [data-section]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const setCurrent = (id) => {
        links.forEach((link) => {
            const isCurrent = link.dataset.section === id;
            link.classList.toggle("is-current", isCurrent);
            if (isCurrent) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    };

    // A section is "current" once it crosses the middle band of the viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) setCurrent(entry.target.id);
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    // Sections without a nav link (e.g. the final CTA) clear the highlight
    document.querySelectorAll("main > section[id]").forEach((section) => observer.observe(section));
})();

/* ==========================================================================
   Global – draw ink underlines as they scroll into view
   ========================================================================== */
(function () {
    const marks = document.querySelectorAll(".ink-mark");
    if (!marks.length) return;

    if (!("IntersectionObserver" in window)) {
        marks.forEach((mark) => mark.classList.add("is-drawn"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-drawn");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    marks.forEach((mark) => observer.observe(mark));
})();

/* ==========================================================================
   Global – fade components in as they scroll into view
   Siblings in the same group are staggered so content flows in one by one.
   ========================================================================== */
(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const groups = [
        { selector: ".top-bar__inner, .site-header__inner", fade: true },
        // Hero: slower, more cinematic entrance on page load
        { selector: ".hero__content > *", start: 0.5, step: 0.3, duration: 1.8 },
        { selector: ".hero__footer", start: 2.3, duration: 1.8 },
        // Services (carousels reveal as a whole so off-screen cards aren't left hidden)
        { selector: ".treatment-ribbon" },
        { selector: ".services__header > *" },
        { selector: ".services__carousel" },
        // About
        { selector: ".about__visual" },
        { selector: ".about__content > *" },
        { selector: ".about__stats" },
        // Reviews
        { selector: ".reviews__header > *" },
        { selector: ".reviews__google, .reviews__carousel, .reviews__footer" },
        // Final CTA
        { selector: ".final-cta__content > *" },
        { selector: ".trust-ribbon" },
        // Contact (the success message animates on its own)
        { selector: ".contact__visual" },
        { selector: ".contact__panel > :not(.contact-success)" },
        // Footer
        { selector: ".site-footer__inner > *" },
        { selector: ".site-footer__bottom", fade: true },
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -4% 0px" });

    // start = delay before the first item, step = gap between siblings, duration = fade length (seconds)
    groups.forEach(({ selector, fade, start = 0, step = 0.12, duration }) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add("reveal");
            if (fade) el.classList.add("reveal--fade");
            el.style.setProperty("--reveal-delay", `${start + Math.min(index, 6) * step}s`);
            if (duration) el.style.setProperty("--reveal-duration", `${duration}s`);
            observer.observe(el);
        });
    });
})();

/* ==========================================================================
   Global – booking modal
   Any [data-booking] link opens the Prospyr booking page in a popup.
   The iframe loads on first open so it never slows down the page.
   Close with the X, Esc (native <dialog>), or by clicking the backdrop.
   ========================================================================== */
(function () {
    const modal = document.getElementById("booking-modal");
    if (!modal || typeof modal.showModal !== "function") return; // old browsers keep the new-tab fallback

    const frame = modal.querySelector(".booking-modal__frame");
    const closeButton = modal.querySelector(".booking-modal__close");
    let lastTrigger = null;

    frame.addEventListener("load", () => modal.classList.add("is-loaded"));

    const open = (trigger) => {
        lastTrigger = trigger;
        if (!frame.src) frame.src = frame.dataset.src;
        modal.showModal();
        document.documentElement.classList.add("is-booking-open");
        if (window.lenis) window.lenis.stop();
        closeButton.focus();
    };

    const close = () => modal.close();

    modal.addEventListener("close", () => {
        document.documentElement.classList.remove("is-booking-open");
        if (window.lenis) window.lenis.start();
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });

    document.querySelectorAll("[data-booking]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            open(link);
        });
    });

    closeButton.addEventListener("click", close);

    // Clicks on the backdrop land on the <dialog> itself, outside the panel
    modal.addEventListener("click", (event) => {
        if (event.target === modal) close();
    });
})();

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
        // Inner pages: banner, about page sections
        { selector: ".page-banner__inner > *", start: 0.1 },
        { selector: ".ab-story__visual" },
        { selector: ".ab-story__content > *" },
        { selector: ".ab-stat" },
        { selector: ".ab-process__header > *" },
        { selector: ".ab-step" },
        { selector: ".ab-why__photo" },
        { selector: ".ab-why__content > *" },
        { selector: ".vr__header > *" },
        { selector: ".vr__grid > li" },
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

/* ==========================================================================
   Global – contact form (homepage + contact page)
   Validates required fields, then plays the "message received" animation.
   TODO: replace the timeout with a real request to her form handler / CRM.
   ========================================================================== */
(function () {
    const form = document.getElementById("contact-form");
    const success = document.getElementById("contact-success");
    if (!form || !success) return;

    const fields = Array.from(form.querySelectorAll("[required]"));
    const successName = document.getElementById("contact-success-name");

    const validate = (input) => {
        const field = input.closest(".form-field");
        const valid = input.checkValidity();
        field.classList.toggle("is-invalid", !valid);
        input.setAttribute("aria-invalid", String(!valid));
        if (!valid) input.setAttribute("aria-describedby", `${input.id}-error`);
        else input.removeAttribute("aria-describedby");
        return valid;
    };

    // Re-check a field once the visitor has interacted with it
    fields.forEach((input) => {
        input.addEventListener("blur", () => validate(input));
        input.addEventListener("input", () => {
            if (input.closest(".form-field").classList.contains("is-invalid")) validate(input);
        });
        input.addEventListener("change", () => validate(input));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const invalid = fields.filter((input) => !validate(input));
        if (invalid.length) {
            invalid[0].focus();
            return;
        }

        form.classList.add("is-sending");
        form.querySelector(".contact-form__submit-label").textContent = "Sending…";

        setTimeout(() => {
            const firstName = form.elements.name.value.trim().split(" ")[0];
            successName.textContent = firstName || "beautiful";
            form.classList.add("is-leaving");

            setTimeout(() => {
                form.hidden = true;
                success.hidden = false;
                success.setAttribute("tabindex", "-1");
                success.focus({ preventScroll: true });
            }, 400);
        }, 1100);
    });

    success.querySelector(".contact-success__reset").addEventListener("click", () => {
        form.reset();
        form.classList.remove("is-sending", "is-leaving");
        form.querySelector(".contact-form__submit-label").textContent = "Send Message";
        fields.forEach((input) => input.closest(".form-field").classList.remove("is-invalid"));
        success.hidden = true;
        form.hidden = false;
        form.elements.name.focus();
    });
})();

/* ==========================================================================
   Global – card carousels (homepage services + reviews on any page)
   Auto-advances every 4s, pauses while the visitor hovers, focuses, or swipes,
   and marks the current card with .is-active.
   align: "start" lines the active card up with the track's left edge,
          "center" centers it.
   loop:  clones the cards on both sides so there are always neighbours,
          then silently jumps back to the real card after passing an end.
   ========================================================================== */
function initCarousel({ section, track, cardSelector, align = "start", loop = false, interval = 4000 }) {
    if (!section || !track) return;

    const originals = Array.from(track.querySelectorAll(cardSelector));
    const count = originals.length;
    let cards = originals;

    if (loop) {
        const makeClone = (card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.setAttribute("inert", "");
            return clone;
        };
        const before = originals.map(makeClone);
        const after = originals.map(makeClone);
        track.prepend(...before);
        track.append(...after);
        cards = [...before, ...originals, ...after];
    }

    // In loop mode the real cards sit in the middle set
    const firstReal = loop ? count : 0;
    const dots = section.querySelectorAll(".carousel-dot");
    const pauseButton = section.querySelector(".carousel-pause");
    const resumeDelay = 6000;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let current = 0;
    let timer = null;
    let resumeTimer = null;
    let isHovering = false;
    let isProgrammaticScroll = false;
    let scrollEndTimer = null;

    // Scroll position that puts a card in its resting spot
    const offsetFor = (card) => {
        if (align === "center") {
            return card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
        }
        return card.offsetLeft - cards[0].offsetLeft;
    };

    const setActive = (index) => {
        current = (index + cards.length) % cards.length;
        const dotIndex = current % count;
        cards.forEach((card, i) => card.classList.toggle("is-active", i === current));
        dots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === dotIndex);
            dot.setAttribute("aria-current", i === dotIndex ? "true" : "false");
        });
    };

    // Loop mode: if we've landed on a clone, swap to the identical real card instantly
    const normalizeLoop = () => {
        if (!loop || (current >= firstReal && current < firstReal + count)) return;
        track.classList.add("is-jumping");
        setActive(firstReal + (current % count));
        track.scrollLeft = offsetFor(cards[current]);
        requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("is-jumping")));
    };

    const scrollToCurrent = () => {
        isProgrammaticScroll = true;
        track.scrollTo({ left: offsetFor(cards[current]), behavior: reducedMotion ? "auto" : "smooth" });
    };

    // `step` moves relative to the current card; otherwise `index` is absolute
    const goTo = (index, step = null) => {
        if (loop && !(current >= firstReal && current < firstReal + count)) {
            // Snap back onto the real set first, then animate on the next frames
            normalizeLoop();
            requestAnimationFrame(() => requestAnimationFrame(() => {
                setActive(step === null ? index : current + step);
                scrollToCurrent();
            }));
            return;
        }
        setActive(step === null ? index : current + step);
        scrollToCurrent();
    };

    const isPaused = () => section.classList.contains("is-paused");

    const stop = () => clearInterval(timer);

    const start = () => {
        stop();
        if (isPaused() || isHovering || document.hidden) return;
        timer = setInterval(() => goTo(null, 1), interval);
    };

    // Brief pause after any manual interaction, then carry on
    const pauseForInteraction = () => {
        stop();
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(start, resumeDelay);
    };

    const setPaused = (paused) => {
        if (!pauseButton) return;
        section.classList.toggle("is-paused", paused);
        pauseButton.setAttribute("aria-pressed", String(paused));
        pauseButton.setAttribute("aria-label", pauseButton.getAttribute("aria-label").replace(paused ? "Pause" : "Play", paused ? "Play" : "Pause"));
        clearTimeout(resumeTimer);
        paused ? stop() : start();
    };

    // After the visitor scrolls/swipes, the card closest to its resting spot becomes active
    const syncFromScroll = () => {
        let nearest = 0;
        cards.forEach((card, i) => {
            if (Math.abs(offsetFor(card) - track.scrollLeft) < Math.abs(offsetFor(cards[nearest]) - track.scrollLeft)) nearest = i;
        });
        setActive(nearest);
    };

    track.addEventListener("scroll", () => {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
            if (isProgrammaticScroll) isProgrammaticScroll = false;
            else syncFromScroll();
            normalizeLoop();
        }, 120);
    }, { passive: true });

    ["pointerdown", "wheel", "touchstart"].forEach((type) => {
        track.addEventListener(type, () => {
            isProgrammaticScroll = false;
            pauseForInteraction();
        }, { passive: true });
    });

    // Start-aligned carousels highlight whichever card is hovered (services photo reveal)
    cards.forEach((card, i) => {
        if (align === "start") {
            card.addEventListener("mouseenter", () => {
                if (canHover.matches) setActive(i);
            });
        }
        card.addEventListener("focusin", () => {
            if (align === "center") goTo(i);
            else setActive(i);
        });
    });

    track.addEventListener("mouseenter", () => {
        if (!canHover.matches) return;
        isHovering = true;
        stop();
    });

    track.addEventListener("mouseleave", () => {
        if (!canHover.matches) return;
        isHovering = false;
        start();
    });

    section.querySelectorAll("[data-direction]").forEach((arrow) => {
        arrow.addEventListener("click", () => {
            goTo(null, arrow.dataset.direction === "next" ? 1 : -1);
            pauseForInteraction();
        });
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            goTo(firstReal + i);
            pauseForInteraction();
        });
    });

    if (pauseButton) pauseButton.addEventListener("click", () => setPaused(!isPaused()));

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    // Only run autoplay while the section is on screen
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
    }, { threshold: 0.25 });

    setActive(firstReal);
    if (align === "center" || loop) track.scrollLeft = offsetFor(cards[firstReal]);
    if (reducedMotion) setPaused(true);
    else observer.observe(section);
}

initCarousel({
    section: document.getElementById("reviews"),
    track: document.getElementById("reviews-track"),
    cardSelector: ".review-card",
    align: "center",
    loop: true,
});

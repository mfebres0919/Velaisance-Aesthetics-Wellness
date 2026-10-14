/* ==========================================================================
   Homepage – hero background slideshow
   ========================================================================== */
(function () {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const slides = hero.querySelectorAll(".hero__slide");
    const dots = hero.querySelectorAll(".hero__dot");
    const pauseButton = hero.querySelector(".hero__pause");
    const interval = 7000;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let current = 0;
    let timer = null;

    hero.style.setProperty("--hero-interval", `${interval}ms`);

    const show = (index) => {
        slides[current].classList.remove("is-active");
        dots[current].classList.remove("is-active");
        dots[current].setAttribute("aria-pressed", "false");

        current = (index + slides.length) % slides.length;

        slides[current].classList.add("is-active");
        dots[current].classList.add("is-active");
        dots[current].setAttribute("aria-pressed", "true");
    };

    const isPaused = () => hero.classList.contains("is-paused");

    const start = () => {
        clearInterval(timer);
        if (!isPaused()) timer = setInterval(() => show(current + 1), interval);
    };

    const setPaused = (paused) => {
        hero.classList.toggle("is-paused", paused);
        pauseButton.setAttribute("aria-pressed", String(paused));
        pauseButton.setAttribute("aria-label", paused ? "Play background slideshow" : "Pause background slideshow");
        paused ? clearInterval(timer) : start();
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });

    pauseButton.addEventListener("click", () => setPaused(!isPaused()));

    // Don't cycle while the tab is hidden
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearInterval(timer);
        else start();
    });

    if (reducedMotion) setPaused(true);
    else start();
})();

/* ==========================================================================
   Homepage – card carousels (services + reviews)
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
    section: document.getElementById("services"),
    track: document.getElementById("services-track"),
    cardSelector: ".service-card",
});

initCarousel({
    section: document.getElementById("reviews"),
    track: document.getElementById("reviews-track"),
    cardSelector: ".review-card",
    align: "center",
    loop: true,
});

/* ==========================================================================
   Homepage – contact form
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

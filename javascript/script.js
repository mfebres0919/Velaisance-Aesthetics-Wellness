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

    // The first slide is active in the HTML, so its slow zoom has nothing to
    // transition from. Restart it from zoomed-in once its photo has loaded,
    // so the opening image drifts like the others.
    if (!reducedMotion) {
        const firstImg = slides[0].querySelector("img");
        const replay = () => {
            firstImg.style.transition = "none";
            firstImg.style.transform = "scale(1.08)";
            void firstImg.offsetWidth;
            firstImg.style.transition = "";
            firstImg.style.transform = "";
        };
        if (firstImg.complete && firstImg.naturalWidth) replay();
        else firstImg.addEventListener("load", replay, { once: true });
    }
})();

initCarousel({
    section: document.getElementById("services"),
    track: document.getElementById("services-track"),
    cardSelector: ".service-card",
});

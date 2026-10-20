/* ==========================================================================
   Reviews page – video stories
   Each card carries its video path in data-video. Clicking opens the popup
   and only then loads the file, so the page stays light. Cards without a
   video yet show "Coming soon" and do nothing. Esc, the X, or a click on
   the backdrop closes the popup and stops playback.
   ========================================================================== */
(function () {
    const modal = document.getElementById("vr-modal");
    if (!modal || typeof modal.showModal !== "function") return;
    const video = modal.querySelector(".vr-modal__video");
    const title = modal.querySelector(".vr-modal__title");
    let opener = null;

    document.querySelectorAll(".vr-card").forEach((card) => {
        if (!card.dataset.video) {
            card.setAttribute("aria-disabled", "true");
            return;
        }
        card.addEventListener("click", () => {
            opener = card;
            title.textContent = card.dataset.title;
            video.src = card.dataset.video;
            modal.showModal();
            if (window.lenis) window.lenis.stop();
            video.play().catch(() => {}); // some browsers block autoplay with sound; controls remain
        });
    });

    function close() {
        if (modal.open) modal.close();
    }

    modal.querySelector(".vr-modal__close").addEventListener("click", close);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) close();
    });
    modal.addEventListener("close", () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        if (window.lenis) window.lenis.start();
        opener?.focus();
    });
})();

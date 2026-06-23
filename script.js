(() => {
  "use strict";

  const pages = [...document.querySelectorAll(".page")];
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const pageNav = document.getElementById("pageNav");
  const sweep = document.getElementById("signalSweep");
  const song = document.getElementById("loveSong");
  const restartButton = document.getElementById("restartButton");

  let index = 0;
  let transitioning = false;
  let songStarted = false;
  let touchStartX = 0;
  let touchStartY = 0;

  totalPages.textContent = String(pages.length - 1).padStart(2, "0");

  const startSong = async () => {
    if (songStarted || !song) return;
    songStarted = true;

    try {
      song.currentTime = 0;
      song.volume = 0.42;
      await song.play();
    } catch (error) {
      console.info("Audio could not start:", error);
    }
  };

  const updateControls = () => {
    currentPage.textContent = String(index).padStart(2, "0");
    prevButton.disabled = index === 0;
    nextButton.disabled = index === pages.length - 1;

    // The cover has its own arrow, so hide the lower navigation there.
    pageNav.classList.toggle("is-hidden", index === 0);
  };

  const runSweep = () => {
    sweep.classList.remove("is-running");
    void sweep.offsetWidth;
    sweep.classList.add("is-running");
  };

  const goTo = (nextIndex, direction = 1) => {
    if (transitioning) return;
    if (nextIndex < 0 || nextIndex >= pages.length || nextIndex === index) return;

    transitioning = true;
    runSweep();

    if (index === 0 && nextIndex > 0) {
      // The audio call stays inside the direct button/touch interaction.
      startSong();
    }

    const oldPage = pages[index];
    const newPage = pages[nextIndex];

    oldPage.classList.remove("is-active", "is-entering-forward", "is-entering-back");
    oldPage.classList.toggle("was-before", direction > 0);

    newPage.classList.remove("was-before", "is-entering-forward", "is-entering-back");
    newPage.classList.add("is-active");
    newPage.classList.add(direction > 0 ? "is-entering-forward" : "is-entering-back");

    index = nextIndex;
    updateControls();

    window.setTimeout(() => {
      newPage.classList.remove("is-entering-forward", "is-entering-back");
      transitioning = false;
    }, 780);
  };

  const next = () => goTo(index + 1, 1);
  const previous = () => goTo(index - 1, -1);

  document.querySelectorAll(".js-next").forEach((button) => {
    button.addEventListener("click", next);
  });

  prevButton.addEventListener("click", previous);
  nextButton.addEventListener("click", next);

  restartButton.addEventListener("click", () => {
    goTo(0, -1);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      next();
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      previous();
    }

    if (event.key === "Home") {
      event.preventDefault();
      goTo(0, -1);
    }

    if (event.key === "End") {
      event.preventDefault();
      goTo(pages.length - 1, 1);
    }
  });

  const deck = document.getElementById("deck");

  deck.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  deck.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
        return;
      }

      if (deltaX < 0) next();
      if (deltaX > 0) previous();
    },
    { passive: true }
  );

  document.querySelectorAll("img").forEach((image) => {
    image.setAttribute("draggable", "false");
  });

  updateControls();
})();

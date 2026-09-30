const WORD_TIMES = [0, 0.34, 0.52, 1.05, 1.5, 1.9, 2.25];
const LINE_END = 3.0;

function playLine(subtitle) {
  const words = [...subtitle.querySelectorAll(".svx-word")];
  const timers = subtitle.svxTimers || [];
  timers.forEach(clearTimeout);
  words.forEach(word => word.classList.remove("svx-spoken"));

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  subtitle.svxTimers = words.map((word, index) => setTimeout(() => {
    words.forEach(other => other.classList.toggle("svx-spoken", other === word));
  }, WORD_TIMES[index] * 1000));
  subtitle.svxTimers.push(setTimeout(() => words.forEach(word => word.classList.remove("svx-spoken")), LINE_END * 1000));
}

export default {
  iconLinks: [
    { icon: "github", href: "https://github.com/exnihilus/subvoxpro-docs", title: "GitHub" }
  ],
  start: () => {
    document.querySelector("header")?.setAttribute("data-bs-theme", "dark");

    const subtitle = document.querySelector(".svx-subtitle");
    const button = document.querySelector(".svx-play");
    if (!subtitle || !button) {
      return;
    }

    button.addEventListener("click", () => playLine(subtitle));
    setTimeout(() => playLine(subtitle), 600);
  }
};

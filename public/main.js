const DEMO_SPEAKER = "Alex";
const DEMO_LINES = [
  { time: 0.05, words: [["The", 0.05], ["gate", 0.18], ["is", 0.33], ["sealed.", 0.42]] },
  { time: 0.82, words: [["Whatever", 0.82], ["is", 1.23], ["behind", 1.33], ["it", 1.63], ["wants", 1.73], ["to", 1.98], ["stay", 2.08], ["hidden.", 2.28]] }
];

function renderSubtitle(subtitle, time, mode) {
  let line = DEMO_LINES[0];
  for (const candidate of DEMO_LINES) {
    if (time >= candidate.time) {
      line = candidate;
    }
  }

  const spoken = line.words.filter(([, start]) => time >= start).length;
  const shown = mode === "TimedWords" ? line.words.slice(0, spoken) : line.words;
  const key = `${DEMO_LINES.indexOf(line)}:${mode}:${spoken}`;
  if (subtitle.dataset.svxKey === key) {
    return;
  }

  subtitle.dataset.svxKey = key;
  subtitle.replaceChildren();
  const speaker = document.createElement("span");
  speaker.className = "svx-speaker";
  speaker.textContent = `${DEMO_SPEAKER}:`;
  subtitle.append(speaker);
  shown.forEach(([text], index) => {
    const word = document.createElement("span");
    word.className = "svx-word";
    word.textContent = text;
    if (mode === "Karaoke" && index === spoken - 1) {
      word.classList.add("svx-spoken");
    }

    subtitle.append(" ", word);
  });
}

function startDemo() {
  const stage = document.querySelector(".svx-stage");
  if (!stage) {
    return;
  }

  const subtitle = stage.querySelector(".svx-subtitle");
  const button = stage.querySelector(".svx-play");
  const select = stage.querySelector("[data-svx-mode]");
  const modeName = stage.querySelector("[data-svx-mode-name]");
  const audio = stage.querySelector("[data-svx-audio]");
  let timer = 0;

  const idle = () => renderSubtitle(subtitle, 0, "FullSubtitle");
  const tick = () => renderSubtitle(subtitle, audio.currentTime, select.value);
  const stop = () => {
    clearInterval(timer);
    audio.pause();
    audio.currentTime = 0;
    button.classList.remove("svx-playing");
    button.setAttribute("aria-label", "Play the example line");
    idle();
  };

  button.addEventListener("click", () => {
    if (!audio.paused) {
      stop();
      return;
    }

    audio.currentTime = 0;
    audio.play().then(() => {
      button.classList.add("svx-playing");
      button.setAttribute("aria-label", "Stop the example line");
      tick();
      timer = setInterval(tick, 30);
    }).catch(stop);
  });
  audio.addEventListener("ended", () => setTimeout(stop, 700));
  select.addEventListener("change", () => {
    modeName.textContent = select.value;
    if (audio.paused) {
      idle();
    }
  });
  idle();
}

export default {
  iconLinks: [
    { icon: "github", href: "https://github.com/exnihilus/subvoxpro-docs", title: "GitHub" }
  ],
  start: () => {
    document.querySelector("header")?.setAttribute("data-bs-theme", "dark");

    document.querySelectorAll("article h4.section").forEach(heading => {
      const list = heading.nextElementSibling;
      const describes = list?.matches("dl.parameters") && [...list.querySelectorAll("dd")].some(item => item.textContent.trim());
      if (list?.matches("dl.parameters") && !describes) {
        heading.remove();
        list.remove();
      }
    });

    startDemo();
  }
};

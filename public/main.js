import { highlightCSharp, renderCSharp, startCodeThemes } from "./code-themes.js?v=a4fe1b4a38";

const DEMO_SPEAKER = "Alex";
const DEMO_LINES = [
  { time: 0.05, words: [["The", 0.05], ["gate", 0.18], ["is", 0.33], ["sealed.", 0.42]] },
  { time: 0.82, words: [["Whatever", 0.82], ["is", 1.23], ["behind", 1.33], ["it", 1.63], ["wants", 1.73], ["to", 1.98], ["stay", 2.08], ["hidden.", 2.28]] }
];
const UNITY_MESSAGES = new Set(["Awake", "Start", "OnEnable", "OnDisable", "OnDestroy", "Update", "LateUpdate", "FixedUpdate",
  "OnValidate", "Reset", "OnTriggerEnter", "OnTriggerExit", "OnTriggerEnter2D", "OnTriggerExit2D"]);

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
  const demo = document.querySelector(".svx-demo");
  if (!demo) {
    return;
  }

  const subtitle = demo.querySelector(".svx-subtitle");
  const button = demo.querySelector(".svx-play");
  const progress = demo.querySelector("[data-svx-progress]");
  const codeLines = [...demo.querySelectorAll("[data-svx-template]")];
  const modeButtons = [...demo.querySelectorAll("[data-svx-mode]")];
  const audio = demo.querySelector("[data-svx-audio]");
  let mode = "Karaoke";
  let timer = 0;

  const renderCode = changed => codeLines.forEach(line => {
    line.innerHTML = renderCSharp(line.dataset.svxTemplate.replace("{mode}", mode))
      .replace('<span class="tk-punctuation">.</span><span class="tk-constant">', '<wbr><span class="tk-punctuation">.</span><span class="tk-constant svx-changed">');
    line.querySelector(".svx-changed")?.classList.toggle("svx-changed", changed);
  });
  const playing = () => demo.classList.contains("svx-playing");
  const tick = () => {
    renderSubtitle(subtitle, playing() ? audio.currentTime : 0, playing() ? mode : "FullSubtitle");
    progress.style.width = audio.duration ? `${Math.min(100, audio.currentTime / audio.duration * 100)}%` : "0%";
  };
  const stop = () => {
    clearInterval(timer);
    audio.pause();
    audio.currentTime = 0;
    demo.classList.remove("svx-playing");
    button.setAttribute("aria-label", "Play the example line");
    tick();
  };

  button.addEventListener("click", () => {
    if (playing()) {
      stop();
      return;
    }

    audio.currentTime = 0;
    demo.classList.add("svx-playing");
    button.setAttribute("aria-label", "Stop the example line");
    clearInterval(timer);
    timer = setInterval(tick, 30);
    audio.play().catch(stop);
  });
  audio.addEventListener("ended", () => setTimeout(stop, 700));
  modeButtons.forEach(modeButton => modeButton.addEventListener("click", () => {
    mode = modeButton.dataset.svxMode;
    modeButtons.forEach(other => other.setAttribute("aria-pressed", String(other === modeButton)));
    renderCode(true);
    tick();
  }));
  renderCode(false);
  tick();
}

function badgesOf(signature, name) {
  const badges = [];
  const declaration = signature.split("{")[0];
  if (/\bstatic\b/.test(declaration)) badges.push(["static", "static"]);
  if (/\bconst\b/.test(declaration)) badges.push(["const", "static"]);
  if (/\bprotected\b/.test(declaration)) badges.push(["protected", "muted"]);
  if (/\babstract\b/.test(declaration)) badges.push(["abstract", "override"]);
  if (/\bvirtual\b/.test(declaration)) badges.push(["overridable", "override"]);
  if (/\boverride\b/.test(declaration)) badges.push(["override", "override"]);
  if (/\{\s*get;\s*\}/.test(signature) || /\breadonly\b/.test(declaration)) badges.push(["read-only", "readonly"]);
  if (UNITY_MESSAGES.has(name.replace(/\(.*$/, ""))) badges.push(["Unity message", "unity"]);
  return badges;
}

function badgeElements(badges) {
  return badges.map(([label, kind]) => {
    const badge = document.createElement("span");
    badge.className = `svx-badge svx-badge-${kind}`;
    badge.textContent = label;
    return badge;
  });
}

function firstSentence(element) {
  const text = element?.textContent.replace(/\s+/g, " ").trim() ?? "";
  const ends = /[.!?](?=\s|$)/g;
  for (let end = ends.exec(text); end; end = ends.exec(text)) {
    const sentence = text.slice(0, end.index + 1);
    if (!/\b(?:e\.g|i\.e)\.$/.test(sentence)) {
      return sentence;
    }
  }

  return text;
}

function buildMemberOverview(article) {
  const sections = [...article.querySelectorAll("h2.section")];
  if (!sections.length) {
    return;
  }

  const overview = document.createElement("nav");
  overview.className = "svx-overview";
  overview.setAttribute("aria-label", "Members");
  for (const section of sections) {
    const group = document.createElement("div");
    group.className = "svx-overview-group";
    const title = document.createElement("div");
    title.className = "svx-overview-title";
    title.textContent = section.textContent.trim();
    const list = document.createElement("ul");
    group.append(title, list);

    for (let node = section.nextElementSibling; node && node.tagName !== "H2"; node = node.nextElementSibling) {
      if (!node.matches("h3[data-uid]")) {
        continue;
      }

      const name = node.textContent.replace(/\s+/g, " ").trim();
      let summary = null;
      let signature = "";
      for (let detail = node.nextElementSibling; detail && !detail.matches("h2, h3, a[data-uid]"); detail = detail.nextElementSibling) {
        if (!summary && detail.matches(".summary")) summary = detail;
        if (!signature && detail.matches(".codewrapper")) signature = detail.textContent;
      }

      const badges = badgesOf(signature, name);
      if (badges.length) {
        const row = document.createElement("div");
        row.className = "svx-badges svx-member-badges";
        row.append(...badgeElements(badges));
        node.after(row);
      }

      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${node.id}`;
      const code = document.createElement("code");
      code.textContent = name;
      link.append(code);
      const description = document.createElement("span");
      description.className = "svx-overview-summary";
      description.textContent = firstSentence(summary);
      const tags = document.createElement("span");
      tags.className = "svx-badges svx-overview-badges";
      tags.append(...badgeElements(badges));
      item.append(link, description, tags);
      list.append(item);
    }

    if (list.children.length) {
      overview.append(group);
    }
  }

  if (overview.children.length) {
    const anchor = article.querySelector("h2");
    anchor.before(overview);
  }
}

function trimInheritance(article) {
  const inheritance = article.querySelector("dl.inheritance");
  if (!inheritance) {
    return;
  }

  const steps = [...inheritance.querySelectorAll("dd > div")];
  steps.filter(step => step.querySelector("a[href*='learn.microsoft.com']")).forEach(step => step.remove());
  if (inheritance.querySelectorAll("dd > div").length <= 1) {
    inheritance.remove();
  }
}

function removeEmptyValueSections() {
  document.querySelectorAll("article h4.section").forEach(heading => {
    const list = heading.nextElementSibling;
    const describes = list?.matches("dl.parameters") && [...list.querySelectorAll("dd")].some(item => item.textContent.trim());
    if (list?.matches("dl.parameters") && !describes) {
      heading.remove();
      list.remove();
    }
  });
}

export default {
  configureHljs: highlightCSharp,
  iconLinks: [
    { icon: "github", href: "https://github.com/exnihilus/subvoxpro-docs", title: "GitHub" }
  ],
  start: () => {
    document.querySelector("header")?.setAttribute("data-bs-theme", "dark");
    startCodeThemes();
    removeEmptyValueSections();
    const article = document.querySelector("article[data-uid]");
    if (article) {
      trimInheritance(article);
      buildMemberOverview(article);
    }

    startDemo();
  }
};

import { highlightCSharp, renderCSharp, startCodeThemes } from "./code-themes.js?v=f80e8285a0";

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

const ACCESS_FILTERS = [["all", "All"], ["public", "Public"], ["protected", "Protected"]];
const ACCESS_ZONES = {
  public: { label: "Public", hint: "Call these from any script." },
  protected: { label: "Protected — for subclasses", hint: "Only reachable from a class that derives from this one." }
};

function memberBlocks(section) {
  const blocks = [];
  for (let node = section.nextElementSibling; node && node.tagName !== "H2"; node = node.nextElementSibling) {
    if (node.matches("a[data-uid]") || !blocks.length || (node.matches("h3[data-uid]") && blocks.at(-1).heading)) {
      blocks.push({ elements: [], heading: null, summary: null, signature: "" });
    }

    const block = blocks.at(-1);
    block.elements.push(node);
    if (node.matches("h3[data-uid]")) block.heading = node;
    else if (block.heading && !block.summary && node.matches(".summary")) block.summary = node;
    else if (block.heading && !block.signature && node.matches(".codewrapper")) block.signature = node.textContent;
  }

  return blocks.filter(block => block.heading).map(block => ({
    ...block,
    name: block.heading.textContent.replace(/\s+/g, " ").trim(),
    access: /^\s*protected\b/.test(block.signature) ? "protected" : "public"
  }));
}

function labelElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function overviewRow(block, badges) {
  const item = document.createElement("li");
  item.dataset.svxAccess = block.access;
  const link = document.createElement("a");
  link.href = `#${block.heading.id}`;
  const code = labelElement("code", "", "");
  block.name.split(/(?<=\(|, )/).forEach((part, index) => code.append(...(index ? [document.createElement("wbr"), part] : [part])));
  link.append(code);
  const tags = labelElement("span", "svx-badges svx-overview-badges", "");
  tags.append(...badgeElements(badges));
  item.append(link, labelElement("span", "svx-overview-summary", firstSentence(block.summary)), tags);
  return item;
}

function memberElement(block) {
  const badges = badgesOf(block.signature, block.name);
  const title = labelElement("div", "svx-member-title", "");
  block.elements.splice(block.elements.indexOf(block.heading), 1, title);
  title.append(block.heading);
  if (badges.length) {
    const row = labelElement("div", "svx-badges svx-member-badges", "");
    row.append(...badgeElements(badges));
    title.append(row);
  }

  const member = labelElement("div", "svx-member", "");
  member.dataset.svxAccess = block.access;
  member.append(...block.elements);
  return { member, row: overviewRow(block, badges) };
}

function chevron() {
  return labelElement("i", "bi bi-chevron-down svx-chevron", "");
}

function accessZone(access) {
  const zone = labelElement("details", `svx-member-zone svx-zone-${access}`, "");
  zone.open = true;
  zone.dataset.svxAccess = access;
  const header = labelElement("summary", "svx-zone-header", "");
  header.append(chevron(), labelElement("strong", "", ACCESS_ZONES[access].label), labelElement("span", "", ACCESS_ZONES[access].hint));
  zone.append(header);

  const list = labelElement("ul", `svx-overview-zone svx-zone-${access}`, "");
  list.dataset.svxAccess = access;
  const toggle = labelElement("button", "", "");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "true");
  toggle.append(chevron(), ACCESS_ZONES[access].label);
  toggle.addEventListener("click", () => {
    const collapsed = list.classList.toggle("svx-collapsed");
    toggle.setAttribute("aria-expanded", String(!collapsed));
  });
  const label = labelElement("li", "svx-overview-access", "");
  label.append(toggle);
  list.append(label);
  return { zone, list };
}

function buildMemberOverview(article) {
  const sections = [...article.querySelectorAll("h2.section")]
    .map(section => ({ section, blocks: memberBlocks(section) }))
    .filter(entry => entry.blocks.length);
  if (!sections.length) {
    return;
  }

  const zoned = sections.some(entry => entry.blocks.some(block => block.access === "protected"));
  const overview = document.createElement("nav");
  overview.className = "svx-overview";
  overview.setAttribute("aria-label", "Members");
  if (zoned) {
    overview.append(accessFilter(article));
  }

  for (const { section, blocks } of sections) {
    const group = labelElement("div", "svx-overview-group", "");
    group.append(labelElement("div", "svx-overview-title", section.textContent.trim()));
    let insertAfter = section;
    for (const access of zoned ? ["public", "protected"] : ["public"]) {
      const members = blocks.filter(block => block.access === access);
      if (!members.length) {
        continue;
      }

      const { zone, list } = zoned ? accessZone(access) : { zone: null, list: document.createElement("ul") };
      for (const block of members) {
        const { member, row } = memberElement(block);
        if (zone) {
          zone.append(member);
        } else {
          insertAfter.after(member);
          insertAfter = member;
        }

        list.append(row);
      }

      if (zone) {
        insertAfter.after(zone);
        insertAfter = zone;
      }

      group.append(list);
    }

    overview.append(group);
  }

  article.querySelector("h2").before(overview);
}

function accessFilter(article) {
  const bar = labelElement("div", "svx-access-filter", "");
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", "Show members");
  for (const [value, label] of ACCESS_FILTERS) {
    const button = labelElement("button", "", label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(value === "all"));
    button.addEventListener("click", () => {
      bar.querySelectorAll("button").forEach(other => other.setAttribute("aria-pressed", String(other === button)));
      applyAccessFilter(article, value);
    });
    bar.append(button);
  }

  return bar;
}

function applyAccessFilter(article, filter) {
  article.querySelectorAll("[data-svx-access]").forEach(element => {
    element.hidden = filter !== "all" && element.dataset.svxAccess !== filter;
  });
  article.querySelectorAll(".svx-overview-group").forEach(group => {
    group.hidden = !group.querySelector("li[data-svx-access]:not([hidden])");
  });
  article.querySelectorAll("h2.section").forEach(section => {
    let node = section.nextElementSibling;
    while (node && node.tagName !== "H2" && (node.hidden || !node.dataset.svxAccess)) {
      node = node.nextElementSibling;
    }

    section.hidden = !node || node.tagName === "H2";
  });
  document.querySelectorAll(".affix a[href^='#']").forEach(link => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    link.closest("li").hidden = Boolean(target?.hidden);
  });
}

function flashMember(id) {
  const member = id && document.getElementById(decodeURIComponent(id))?.closest(".svx-member");
  if (!member) {
    return;
  }

  member.classList.remove("svx-flash");
  let lastTop = null;
  let checks = 0;
  const waitForScrollEnd = () => {
    const top = member.getBoundingClientRect().top;
    if (top === lastTop || checks++ > 40) {
      member.classList.add("svx-flash");
      return;
    }

    lastTop = top;
    setTimeout(waitForScrollEnd, 60);
  };
  setTimeout(waitForScrollEnd, 60);
}

function revealMember(id) {
  const zone = id && document.getElementById(decodeURIComponent(id))?.closest("details");
  if (zone && !zone.open) {
    zone.open = true;
    return true;
  }

  return false;
}

function startMemberFlash() {
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href*='#']");
    if (link && link.pathname === location.pathname && link.hash) {
      revealMember(link.hash.slice(1));
      setTimeout(() => flashMember(link.hash.slice(1)));
    }
  });
  addEventListener("hashchange", () => {
    if (revealMember(location.hash.slice(1))) {
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    }

    flashMember(location.hash.slice(1));
  });
  flashMember(location.hash.slice(1));
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
  defaultTheme: "dark",
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
      startMemberFlash();
    }

    startDemo();
  }
};

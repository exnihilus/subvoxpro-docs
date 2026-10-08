import { documentationRoot, localize } from "./languages.js?v=65a73091a9";

const VERSION_META = "svx:version";
const LATEST_FOLDER = "latest";

function metaContent(name) {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute("content");
}

async function readCatalog(siteRoot) {
  try {
    const response = await fetch(new URL("versions.json", siteRoot), { cache: "no-cache" });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function samePageIn(siteRoot, folder, pagePath) {
  const target = new URL(`${folder}/${pagePath}`, siteRoot);
  try {
    const response = await fetch(target, { method: "HEAD", cache: "no-cache" });
    if (response.ok) {
      return target.href + location.hash;
    }
  } catch (error) {
    console.debug(error);
  }

  const language = pagePath.match(/^(fr|de|ja|zh-Hans)\//)?.[0];
  if (language) {
    const english = new URL(`${folder}/${pagePath.slice(language.length)}`, siteRoot);
    try {
      if ((await fetch(english, { method: "HEAD" })).ok) return english.href + location.hash;
    } catch {
    }
  }
  return new URL(`${folder}/`, siteRoot).href;
}

function buildPicker(current, versions, latest, open) {
  const picker = document.createElement("div");
  picker.className = "dropdown svx-version";
  const title = localize("Documentation version", "Version de la documentation", "Version der Dokumentation", "ドキュメントのバージョン", "文档版本");
  picker.innerHTML = `<button class="btn border-0 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="${title}">
      <i class="bi bi-clock-history"></i><span class="svx-version-name"></span></button>
    <ul class="dropdown-menu dropdown-menu-end"><li><h6 class="dropdown-header">${title}</h6></li></ul>`;
  picker.querySelector(".svx-version-name").textContent = current;
  const menu = picker.querySelector("ul");
  for (const version of versions) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dropdown-item";
    button.textContent = version;
    if (version === latest) {
      const tag = document.createElement("span");
      tag.className = "svx-version-latest";
      tag.textContent = localize("latest", "dernière", "neueste", "最新", "最新");
      button.append(tag);
    }

    const active = version === current;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", String(active));
    button.addEventListener("click", () => open(version));
    item.append(button);
    menu.append(item);
  }

  return picker;
}

function showOutdatedBanner(current, latest, open) {
  const banner = document.createElement("div");
  banner.className = "svx-outdated";
  banner.setAttribute("role", "note");
  banner.innerHTML = `<i class="bi bi-info-circle"></i><span>${localize("You are reading the documentation of SubVox Pro", "Vous consultez la documentation de SubVox Pro", "Sie lesen die Dokumentation von SubVox Pro", "表示中のドキュメント：SubVox Pro", "您正在阅读的文档版本：SubVox Pro")} <strong></strong>. ${localize("The latest version is", "La dernière version est", "Die neueste Version ist", "最新バージョン：", "最新版本为")} <strong></strong>.</span>`;
  const [shown, newest] = banner.querySelectorAll("strong");
  shown.textContent = current;
  newest.textContent = latest;
  const link = document.createElement("button");
  link.type = "button";
  link.className = "btn btn-sm";
  link.textContent = localize(`View this page in ${latest}`, `Voir cette page en version ${latest}`, `Diese Seite in Version ${latest} anzeigen`, `このページをバージョン ${latest} で表示`, `查看此页面的 ${latest} 版本`);
  link.addEventListener("click", () => open(LATEST_FOLDER));
  banner.append(link);
  (document.querySelector("main .content > article") ?? document.querySelector("main"))?.prepend(banner);
}

export async function startVersionPicker() {
  const current = metaContent(VERSION_META);
  if (!current) {
    return;
  }

  const root = documentationRoot();
  const siteRoot = new URL("../", root);
  const catalog = await readCatalog(siteRoot);
  const versions = catalog?.versions?.length ? catalog.versions : [current];
  const latest = catalog?.latest ?? current;
  const pagePath = location.href.split("#")[0].slice(root.href.length);
  const open = async folder => {
    location.href = catalog ? await samePageIn(siteRoot, folder, pagePath) : location.href;
  };

  const navbar = document.querySelector("#navbar");
  navbar?.insertBefore(buildPicker(current, versions, latest, open), navbar.querySelector(".svx-language") ?? navbar.querySelector(".svx-code-theme") ?? navbar.querySelector("form.search"));
  if (catalog && current !== latest) {
    showOutdatedBanner(current, latest, open);
  }
}

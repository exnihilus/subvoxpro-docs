const LANGUAGES = [["en", "English", ""], ["fr", "Français", "fr/"], ["de", "Deutsch", "de/"], ["ja", "日本語", "ja/"], ["zh-Hans", "简体中文", "zh-Hans/"]];
const current = () => LANGUAGES.find(([language]) => language === document.documentElement.lang) ?? LANGUAGES[0];
export const localize = (english, french, german, japanese, chinese) => ({ fr: french, de: german, ja: japanese, "zh-Hans": chinese })[current()[0]] ?? english;

export function documentationRoot() {
  const relative = document.querySelector('meta[name="docfx:rel"]')?.content ?? "";
  const root = new URL(relative, location.href);
  return current()[2] ? new URL("../", root) : root;
}

export function startLanguagePicker() {
  const root = documentationRoot();
  const page = location.pathname.slice(root.pathname.length).replace(/^(fr|de|ja|zh-Hans)\//, "");
  const picker = document.createElement("div");
  picker.className = "dropdown svx-language";
  picker.innerHTML = `<button class="btn border-0 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="${localize("Documentation language", "Langue de la documentation", "Sprache der Dokumentation", "ドキュメントの言語", "文档语言")}">
      <i class="bi bi-translate" aria-hidden="true"></i><span>${current()[1]}</span></button>
    <ul class="dropdown-menu dropdown-menu-end"></ul>`;
  for (const [language, label, folder] of LANGUAGES) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.className = "dropdown-item";
    link.textContent = label;
    link.hreflang = language;
    link.lang = language;
    const update = () => {
      link.href = new URL(folder + page, root).href + location.search + location.hash;
    };
    update();
    window.addEventListener("hashchange", update);
    if (document.documentElement.lang === language) {
      link.classList.add("active");
      link.setAttribute("aria-current", "true");
    }
    item.append(link);
    picker.querySelector("ul").append(item);
  }
  const navbar = document.querySelector("#navbar");
  navbar?.insertBefore(picker, navbar.querySelector(".svx-code-theme") ?? navbar.querySelector("form.search"));
}

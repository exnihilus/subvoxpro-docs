export const isFrench = () => document.documentElement.lang === "fr";
export const localize = (english, french) => isFrench() ? french : english;

export function documentationRoot() {
  const relative = document.querySelector('meta[name="docfx:rel"]')?.content ?? "";
  const root = new URL(relative, location.href);
  return isFrench() ? new URL("../", root) : root;
}

export function startLanguagePicker() {
  const root = documentationRoot();
  const page = location.pathname.slice(root.pathname.length).replace(/^fr\//, "");
  const picker = document.createElement("div");
  picker.className = "dropdown svx-language";
  picker.innerHTML = `<button class="btn border-0 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="${localize("Documentation language", "Langue de la documentation")}">
      <i class="bi bi-translate" aria-hidden="true"></i><span>${localize("English", "Français")}</span></button>
    <ul class="dropdown-menu dropdown-menu-end"></ul>`;
  for (const [language, label, folder] of [["en", "English", ""], ["fr", "Français", "fr/"]]) {
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

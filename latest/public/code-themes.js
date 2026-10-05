import { localize } from "./languages.js?v=e3253bcd65";

const ROLES = ["text", "keyword", "control", "class", "struct", "interface", "enum", "delegate", "typeparam", "method",
  "property", "field", "event",
  "constant", "variable", "namespace", "string", "number", "comment", "operator", "punctuation"];
const STORAGE_KEY = "svx-code-theme";
const DEFAULT_THEME = "visual-studio";

function tones(background, text, colors, styles = {}) {
  const palette = { background, ...Object.fromEntries(ROLES.map(role => [role, text])), ...colors };
  return { palette, styles };
}

export const CODE_THEMES = {
  subvox: {
    name: "SubVox",
    dark: tones("#141416", "#d4d4d8", {
      keyword: "#c4b5fd", control: "#c4b5fd", class: "#7dd3fc", struct: "#7dd3fc", interface: "#7dd3fc", enum: "#7dd3fc",
      delegate: "#7dd3fc", typeparam: "#7dd3fc",
      method: "#a5b4fc", property: "#e4e4e7", field: "#e4e4e7", event: "#e4e4e7", constant: "#ffd14d", string: "#86efac",
      number: "#fda4af", comment: "#71717a", operator: "#a1a1aa", punctuation: "#a1a1aa"
    }, { comment: "italic" }),
    light: tones("#f4f4f5", "#18181b", {
      keyword: "#6d28d9", control: "#6d28d9", class: "#0369a1", struct: "#0369a1", interface: "#0369a1", enum: "#0369a1",
      delegate: "#0369a1", typeparam: "#0369a1",
      method: "#4338ca", constant: "#b45309", variable: "#27272a", string: "#15803d", number: "#be123c", comment: "#71717a",
      operator: "#52525b", punctuation: "#52525b"
    }, { comment: "italic" })
  },
  "visual-studio": {
    name: "Visual Studio",
    dark: tones("#1E1E1E", "#DCDCDC", {
      keyword: "#569CD6", control: "#D8A0DF", class: "#4EC9B0", struct: "#86C691", interface: "#B8D7A3", enum: "#B8D7A3",
      delegate: "#4EC9B0", typeparam: "#B8D7A3",
      method: "#DCDCAA", variable: "#9CDCFE", string: "#D69D85", number: "#B5CEA8", comment: "#57A64A", operator: "#B4B4B4"
    }),
    light: tones("#FFFFFF", "#000000", {
      keyword: "#0000FF", control: "#8F08C4", class: "#2B91AF", struct: "#2B91AF", interface: "#2B91AF", enum: "#2B91AF",
      delegate: "#2B91AF", typeparam: "#2B91AF",
      method: "#74531F", variable: "#1F377F", string: "#A31515", comment: "#008000"
    })
  },
  "vs-code": {
    name: "Visual Studio Code",
    dark: tones("#1F1F1F", "#CCCCCC", {
      keyword: "#569CD6", control: "#C586C0", class: "#4EC9B0", struct: "#4EC9B0", interface: "#4EC9B0", enum: "#4EC9B0",
      delegate: "#4EC9B0", typeparam: "#4EC9B0",
      namespace: "#4EC9B0", method: "#DCDCAA", property: "#9CDCFE", field: "#9CDCFE", event: "#9CDCFE", variable: "#9CDCFE",
      constant: "#4FC1FF", string: "#CE9178", number: "#B5CEA8", comment: "#6A9955", operator: "#D4D4D4"
    }),
    light: tones("#FFFFFF", "#3B3B3B", {
      keyword: "#0000FF", control: "#AF00DB", class: "#267F99", struct: "#267F99", interface: "#267F99", enum: "#267F99",
      delegate: "#267F99", typeparam: "#267F99",
      namespace: "#267F99", method: "#795E26", property: "#001080", field: "#001080", event: "#001080", variable: "#001080",
      constant: "#0070C1", string: "#A31515", number: "#098658", comment: "#008000", operator: "#000000"
    })
  },
  rider: {
    name: "JetBrains Rider",
    dark: tones("#191A1C", "#D0D0D0", {
      keyword: "#6C95EB", control: "#6C95EB", class: "#C191FF", interface: "#C191FF", namespace: "#C191FF", struct: "#E1BFFF",
      delegate: "#E1BFFF", typeparam: "#C191FF",
      enum: "#E1BFFF", method: "#39CC9B", property: "#66C3CC", field: "#66C3CC", constant: "#66C3CC", event: "#ED94C0",
      variable: "#BDBDBD", string: "#C9A26D", number: "#ED94C0", comment: "#85C46C", operator: "#BDBDBD", punctuation: "#BDBDBD"
    }, { comment: "italic", constant: "bold" }),
    light: tones("#FFFFFF", "#202020", {
      keyword: "#0F54D6", control: "#0F54D6", class: "#6B2FBA", interface: "#6B2FBA", namespace: "#6B2FBA", struct: "#300073",
      delegate: "#300073", typeparam: "#6B2FBA",
      enum: "#300073", method: "#00855F", property: "#0093A1", field: "#0093A1", constant: "#0093A1", event: "#AB2F6B",
      variable: "#383838", string: "#8C6C41", number: "#AB2F6B", comment: "#248700", operator: "#383838", punctuation: "#383838"
    }, { comment: "italic", constant: "bold" })
  }
};

const KEYWORDS = new Set(("abstract as async await base bool byte char checked class const decimal default delegate double " +
  "enum event explicit extern false fixed float get implicit in init int interface internal is lock long nameof namespace " +
  "new null object operator out override params private protected public readonly record ref sbyte sealed set short " +
  "sizeof stackalloc static string struct this true typeof uint ulong unchecked unsafe ushort using var virtual void " +
  "volatile when where").split(" "));
const CONTROL = new Set("if else switch case for foreach while do break continue return yield goto try catch finally throw".split(" "));
const STRUCTS = new Set(["SubtitleInfo", "SubtitleWordInfo", "SubtitleWordStyle", "SubtitleHistoryEntry", "LocalizedSubtitleLine",
  "Vector2", "Vector3", "Vector4", "Vector2Int", "Vector3Int", "Quaternion", "Color", "Color32", "Rect", "Bounds", "LayerMask",
  "Matrix4x4", "Ray", "RaycastHit", "TimeSpan", "DateTime", "Guid"]);
const DELEGATES = new Set(["Action", "Func", "Predicate", "Comparison", "EventHandler", "UnityAction"]);
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\$@?"(?:[^"\\\n]|\\.)*"|@?"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)')|(\b\d+(?:\.\d+)?[fFdDmMuUlL]*\b)|(@?[A-Za-z_]\w*)|(\s+)|([{}()[\];,.])|([+\-*/%=!<>&|^~?:]+)|(.)/g;
const KINDS = ["comment", "string", "number", "identifier", "space", "punctuation", "operator", "text"];

function lex(code) {
  const tokens = [];
  for (const match of code.matchAll(TOKEN)) {
    const kind = KINDS[match.slice(1).findIndex(group => group !== undefined)];
    if (kind === "string" && match[0].startsWith("$")) {
      tokens.push(...lexInterpolated(match[0]));
    } else {
      tokens.push({ text: match[0], kind, role: kind === "identifier" ? null : kind });
    }
  }

  return tokens;
}

function lexInterpolated(text) {
  return text.split(/(\{[^{}]*\})/).filter(Boolean).flatMap(part => part.startsWith("{") && part.endsWith("}")
    ? [{ text: "{", kind: "punctuation", role: "punctuation" }, ...classify(lex(part.slice(1, -1))),
      { text: "}", kind: "punctuation", role: "punctuation" }]
    : [{ text: part, kind: "string", role: "string" }]);
}

function typeRole(name) {
  if (/^T([A-Z]\w*)?$/.test(name)) return "typeparam";
  if (DELEGATES.has(name)) return "delegate";
  if (/^E[A-Z]/.test(name)) return "enum";
  if (/^I[A-Z]/.test(name)) return "interface";
  return STRUCTS.has(name) ? "struct" : "class";
}

function closesGenericCall(tokens, index) {
  let depth = 0;
  for (let i = index; i < tokens.length; i++) {
    const text = tokens[i].text;
    if (text === "<") depth++;
    else if (text === ">") depth--;
    else if (text === ">>") depth -= 2;
    else if (!/^(\w+|[.,?[\]]|\s+)$/.test(text)) return false;
    if (depth <= 0) return tokens[i + 1]?.text === "(";
  }

  return false;
}

function declaredMembers(significant) {
  const declared = new Set();
  significant.forEach((token, index) => {
    const previous = significant[index - 1];
    const next = significant[index + 1];
    const typed = previous && (previous.kind === "identifier" || [">", "]", "?"].includes(previous.text));
    const member = /^[A-Z_]/.test(token.text);
    if (token.kind === "identifier" && member && typed && ["=", ";", "{"].includes(next?.text) && !KEYWORDS.has(previous.text)) {
      declared.add(token.text);
    }
  });

  return declared;
}

function classify(tokens) {
  const significant = tokens.filter(token => token.kind !== "space" && token.kind !== "comment");
  const declared = declaredMembers(significant);
  let inNamespace = false;
  let inEvent = false;
  let inAttribute = false;
  let attributeDepth = 0;
  significant.forEach((token, index) => {
    const previous = significant[index - 1];
    const next = significant[index + 1];
    if (token.kind !== "identifier") {
      if (token.text === ";" || token.text === "{" || token.text === "(") inNamespace = false;
      if (token.text === ";" || token.text === "{" || token.text === "}") inEvent = false;
      if (token.text === "[" && (!previous || [";", "{", "}", "]"].includes(previous.text))) {
        inAttribute = true;
        attributeDepth = 0;
      } else if (inAttribute && token.text === "(") {
        attributeDepth++;
      } else if (inAttribute && token.text === ")") {
        attributeDepth--;
      } else if (inAttribute && token.text === "]" && attributeDepth === 0) {
        inAttribute = false;
      }

      return;
    }

    const word = token.text.replace(/^@/, "");
    if (CONTROL.has(word)) {
      token.role = "control";
    } else if (KEYWORDS.has(word)) {
      token.role = "keyword";
      inNamespace = (word === "using" || word === "namespace") && next?.kind === "identifier" && next.text !== "var";
      inEvent ||= word === "event";
    } else if (inNamespace) {
      token.role = "namespace";
    } else if (inEvent && (!next || [";", "{", "="].includes(next.text))) {
      token.role = "event";
    } else if (inAttribute && attributeDepth === 0 && (previous?.text === "[" || previous?.text === ",")) {
      token.role = "class";
    } else {
      token.role = identifierRole(word, significant, index, previous, next, declared);
    }
  });

  return tokens;
}

function identifierRole(word, significant, index, previous, next, declared) {
  const pascal = /^[A-Z]/.test(word);
  if (/^T([A-Z]\w*)?$/.test(word) && previous?.text !== ".") {
    return "typeparam";
  }

  if (next?.text === "(") {
    const constructs = ["new", "[", "public", "protected", "private", "internal", "static"].includes(previous?.text);
    return constructs ? typeRole(word) : "method";
  }

  if (next?.text === "<") {
    return closesGenericCall(significant, index + 1) ? "method" : typeRole(word);
  }

  if (next?.text === "+=" || next?.text === "-=") {
    return pascal ? "event" : "variable";
  }

  if (previous?.text === ".") {
    const owner = significant[index - 2]?.role;
    if (next?.kind === "identifier") return typeRole(word);
    if (owner === "enum") return "constant";
    if (next?.text === "." && ["class", "namespace"].includes(owner)) return "class";
    return /^[A-Z][A-Z0-9_]+$/.test(word) ? "constant" : "property";
  }

  if (declared.has(word)) {
    return word.startsWith("_") ? "field" : "property";
  }

  if (pascal) {
    const declares = ["new", "class", "struct", "enum", "interface", "record", "typeof", "is", "as", "<", ":", "["];
    const typed = declares.includes(previous?.text) || next?.kind === "identifier" || next?.text === "." ||
      next?.text === ">" || (next?.text === "[" && significant[index + 2]?.text === "]") ||
      (next?.text === "?" && significant[index + 2]?.kind === "identifier");
    if (typed) return typeRole(word);
    return /^[A-Z][A-Z0-9_]+$/.test(word) ? "constant" : "property";
  }

  return word.startsWith("_") ? "field" : "variable";
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderCSharp(code) {
  return classify(lex(code)).map(token => token.kind === "space" || token.kind === "text"
    ? escapeHtml(token.text)
    : `<span class="tk-${token.role}">${escapeHtml(token.text)}</span>`).join("");
}

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
  }
}

function applyTheme(id) {
  const theme = CODE_THEMES[id] ?? CODE_THEMES[DEFAULT_THEME];
  const siteMode = document.documentElement.getAttribute("data-bs-theme") === "light" ? "light" : "dark";
  const root = document.documentElement.style;
  for (const [prefix, tone] of [["--tk", theme[siteMode]], ["--tkd", theme.dark]]) {
    root.setProperty(`${prefix}-background`, tone.palette.background);
    ROLES.forEach(role => root.setProperty(`${prefix}-${role}`, tone.palette[role]));
    root.setProperty(`${prefix}-comment-style`, tone.styles.comment === "italic" ? "italic" : "normal");
    root.setProperty(`${prefix}-constant-weight`, tone.styles.constant === "bold" ? "700" : "inherit");
  }
}

function injectRoleStyles() {
  const style = document.createElement("style");
  style.textContent = ROLES.map(role => `.tk-${role}{color:var(--tk-${role})}.svx-snippet .tk-${role}{color:var(--tkd-${role})}`).join("");
  document.head.append(style);
}

function swatches(theme) {
  const tone = theme[document.documentElement.getAttribute("data-bs-theme") === "light" ? "light" : "dark"].palette;
  return ["keyword", "class", "method", "string"].map(role => `<i style="background:${tone[role]}"></i>`).join("");
}

function buildPicker(current) {
  const picker = document.createElement("div");
  picker.className = "dropdown svx-code-theme";
  const title = localize("Code colors", "Couleurs du code");
  picker.innerHTML = `<button class="btn border-0 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="${title}">
      <i class="bi bi-code-slash"></i><span class="svx-code-theme-name"></span></button>
    <ul class="dropdown-menu dropdown-menu-end"><li><h6 class="dropdown-header">${title}</h6></li></ul>`;
  const menu = picker.querySelector("ul");
  const label = picker.querySelector(".svx-code-theme-name");
  const refresh = selected => {
    label.textContent = CODE_THEMES[selected].name;
    menu.querySelectorAll("[data-svx-code-theme]").forEach(item => {
      const active = item.dataset.svxCodeTheme === selected;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", String(active));
      item.querySelector(".svx-swatches").innerHTML = swatches(CODE_THEMES[item.dataset.svxCodeTheme]);
    });
  };

  for (const [id, theme] of Object.entries(CODE_THEMES)) {
    const item = document.createElement("li");
    item.innerHTML = `<button class="dropdown-item" type="button" data-svx-code-theme="${id}"><span class="svx-swatches"></span>${theme.name}</button>`;
    item.firstElementChild.addEventListener("click", () => {
      storeTheme(id);
      applyTheme(id);
      refresh(id);
    });
    menu.append(item);
  }

  refresh(current);
  new MutationObserver(() => {
    const selected = CODE_THEMES[readStoredTheme()] ? readStoredTheme() : DEFAULT_THEME;
    applyTheme(selected);
    refresh(selected);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
  return picker;
}

export function startCodeThemes() {
  const stored = readStoredTheme();
  const current = CODE_THEMES[stored] ? stored : DEFAULT_THEME;
  injectRoleStyles();
  applyTheme(current);
  const navbar = document.querySelector("#navbar");
  navbar?.insertBefore(buildPicker(current), navbar.querySelector("form.search"));
}

export function highlightCSharp(hljs) {
  hljs.addPlugin({
    "after:highlightElement": ({ el, result }) => {
      if (result.language === "csharp" || /\blang-(csharp|cs)\b/.test(el.className)) {
        el.innerHTML = renderCSharp(el.textContent);
      }
    }
  });
}

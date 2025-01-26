console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


const pages = [
  { url: "index.html", title: "Home" },
  { url: "projects/index.html", title: "Projects" },
  { url: "resume.html", title: "Resume" },
  { url: "contact/index.html", title: "Contact" },
  { url: "https://github.com/rohanvasudev1", title: "GitHub" },
];


const ARE_WE_HOME = document.documentElement.classList.contains("home");


const nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  const isAbsoluteUrl = url.startsWith("http");

  if (!isAbsoluteUrl && !ARE_WE_HOME) {
    url = `../${url}`;
  }

  const a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  if (isAbsoluteUrl) {
    a.target = "_blank";
  }

  nav.append(a);
}


document.body.insertAdjacentHTML(
  "afterbegin",
  `
    <label class="color-scheme">
        Theme:
        <select id="theme-switcher">
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
  `
);

const themeSwitcher = document.getElementById("theme-switcher");
const rootElement = document.documentElement;

function updateTheme(selectedTheme) {
  if (selectedTheme === "auto") {
    rootElement.style.setProperty("color-scheme", "light dark");
    document.body.style.backgroundColor = getComputedStyle(rootElement).getPropertyValue("--background-color").trim();
    document.body.style.color = getComputedStyle(rootElement).getPropertyValue("--text-color").trim();
  } else {
    rootElement.style.setProperty("color-scheme", selectedTheme);
    if (selectedTheme === "dark") {
      rootElement.style.setProperty("--background-color", "#121212");
      rootElement.style.setProperty("--text-color", "#f4f4f4");
      rootElement.style.setProperty("--color-accent", "#66aaff");
    } else {
      rootElement.style.setProperty("--background-color", "#f4f4f4");
      rootElement.style.setProperty("--text-color", "#000");
      rootElement.style.setProperty("--color-accent", "#007bff");
    }
  }
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
themeSwitcher.value = prefersDark ? "dark" : "light";
updateTheme(themeSwitcher.value);

themeSwitcher.addEventListener("input", (event) => {
  const selectedTheme = event.target.value;
  updateTheme(selectedTheme);
  console.log("Theme updated to:", selectedTheme);
});

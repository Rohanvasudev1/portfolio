console.log("IT’S ALIVE!");

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
      return []; 
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

async function loadGitHubProfile() {
  const username = "rohanvasudev1";
  
  try {
      const githubData = await fetchGitHubData(username);

      document.getElementById("followers").textContent = githubData.followers;
      document.getElementById("following").textContent = githubData.following;
      document.getElementById("repos").textContent = githubData.public_repos;
      document.getElementById("gists").textContent = githubData.public_gists;

  } catch (error) {
      console.error("Error fetching GitHub profile data:", error);
  }
}

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Dynamically get the domain
const domain = window.location.origin;

const pages = [
  { url: `${domain}/index.html`, title: "Home" },
  { url: `${domain}/projects/index.html`, title: "Projects" },
  { url: `${domain}/resume.html`, title: "Resume" },
  { url: `${domain}/contact/index.html`, title: "Contact" },
  { url: "https://github.com/rohanvasudev1", title: "GitHub" }, // External link remains unchanged
];

const nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  const isAbsoluteUrl = url.startsWith("http");

  const a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Normalize paths to ensure proper active link detection
  const currentPath = window.location.pathname.replace(/\/$/, "").toLowerCase();
  const linkPath = new URL(url, domain).pathname.replace(/\/$/, "").toLowerCase();

  a.classList.toggle("current", currentPath === linkPath);

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

const savedTheme = localStorage.getItem("colorScheme") || "auto";
themeSwitcher.value = savedTheme;
updateTheme(savedTheme);

themeSwitcher.addEventListener("input", (event) => {
  const selectedTheme = event.target.value;
  updateTheme(selectedTheme);
  localStorage.setItem("colorScheme", selectedTheme);
  console.log("Theme updated to:", selectedTheme);
});

export function renderProjects(project, containerElement, headingLevel = "h2") {
  if (!project || typeof project !== "object") {
      console.error("Invalid project data:", project);
      return;
  }

  if (!containerElement || !(containerElement instanceof HTMLElement)) {
      console.error("Invalid container element:", containerElement);
      return;
  }

  if (!/^h[1-6]$/.test(headingLevel)) {
      console.warn(`Invalid heading level "${headingLevel}". Defaulting to "h2".`);
      headingLevel = "h2";
  }

  const article = document.createElement("article");

  const imageSrc = project.image && project.image.trim() ? project.image : "https://via.placeholder.com/300";

  article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${imageSrc}" alt="${project.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300';">
      <p>${project.description || "No description available."}</p>
  `;

  containerElement.appendChild(article);
}

async function loadProjects() {
  const projectsContainer = document.querySelector(".projects");
  const projectsTitle = document.querySelector(".projects-title");

  if (!projectsContainer || !projectsTitle) return; 

  const projects = await fetchJSON(`${domain}/lib/projects.json`);

  projectsContainer.innerHTML = "";

  projectsTitle.textContent = `Projects (${projects.length})`;

  projects.forEach(project => renderProjects(project, projectsContainer, "h3"));
}

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  loadGitHubProfile();
});

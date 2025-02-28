import { fetchJSON, renderProjects } from './global.js';
const projects = await fetchJSON('/portfolio/lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');

// import { fetchGitHubData } from "./global.js";

// async function loadGitHubProfile() {
//     const username = "rohanvasudev1"; 
//     const profileStats = document.querySelector("#profile-stats");

//     if (!profileStats) return; // 

//     try {
//         const githubData = await fetchGitHubData(username);

//         profileStats.innerHTML = `
//             <dl>
//                 <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
//                 <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
//                 <dt>Followers:</dt><dd>${githubData.followers}</dd>
//                 <dt>Following:</dt><dd>${githubData.following}</dd>
//             </dl>
//         `;

//     } catch (error) {
//         console.error("Error fetching GitHub profile data:", error);
//         profileStats.innerHTML = "<p>Failed to load GitHub profile.</p>";
//     }
// }

// document.addEventListener("DOMContentLoaded", () => {
//     loadGitHubProfile();
//   });
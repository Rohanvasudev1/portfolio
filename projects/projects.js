import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

console.log("IT’S ALIVE!");

import { fetchJSON, renderProjects } from '/portfolio/global.js'; 

const width = 500;
const height = 500;
const radius = Math.min(width, height) / 2; 

let projects = [];
let query = '';
const searchInput = document.querySelector('.searchBar');
const projectsContainer = document.querySelector('.projects'); 
projects = await fetchJSON("/portfolio/lib/projects.json"); 
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(processProjectsData(projects)); 


// async function initializeProjects() {

//     const latestProjects = projects.slice(0, 3);
//     renderProjects(latestProjects, projectsContainer, 'h2');
//     loadProjects();
// }

// async function loadProjects() {
//     projects = await fetchJSON("../lib/projects.json"); 
//     renderProjects(projects, projectsContainer, "h2"); 
//     renderPieChart(processProjectsData(projects)); 
// }

// async function loadProjects(newprojects) {
//   const projectsContainer = document.querySelector(".projects");
//   const projectsTitle = document.querySelector(".projects-title");

//   if (!projectsContainer || !projectsTitle) return; 

//   const projects = await fetchJSON(`/portfolio/lib/projects.json`);

//   projectsContainer.innerHTML = "";

//   projectsTitle.textContent = `Projects (${projects.length})`;

//   projects.forEach(project => renderProjects(project, projectsContainer, "h3"));
//   renderPieChart(processProjectsData(projects)); 
// }



function processProjectsData(filteredProjects) {
    let rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length, 
        (d) => d.year 
    );

    return rolledData.map(([year, count]) => ({
        value: count,
        label: year.toString(), 
    }));
}


function renderPieChart(data) {
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select("#projects-plot")
                  .attr("viewBox", "-250 -250 500 500")
                  .html(""); 

    const g = svg.append("g").attr("transform", "translate(0,0)");

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colors(i))
      .attr("stroke", "#fff")
      .style("stroke-width", "2px");

  
    const legend = d3.select("#legend").html("");

    const legendItems = legend.selectAll(".legend-item")
                              .data(data)
                              .enter()
                              .append("div")
                              .attr("class", "legend-item");

    legendItems.append("span")
               .attr("class", "legend-color")
               .style("background-color", (d, i) => colors(i));

    legendItems.append("span").text((d) => `${d.label} (${d.value})`);
}


function setQuery(newQuery) {
    query = newQuery.toLowerCase();

    return projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });
}


searchInput.addEventListener("input", (event) => {
    let filteredProjects = setQuery(event.target.value);

    
    if (!projectsContainer) {
        console.error("Error: projectsContainer not found.");
        return;
    }

    renderProjects(filteredProjects, projectsContainer, 'h2');

    

    
    let newData = processProjectsData(filteredProjects);
    renderPieChart(newData);
});




// document.addEventListener('DOMContentLoaded', () => {
//   const searchInput = document.querySelector('.searchBar');
  
//   searchInput.addEventListener('input', (event) => {
//       query = event.target.value;
//       const filteredProjects = filterProjects(query);
//       const container = document.querySelector('.projects');
//       renderProjects(filteredProjects, container, 'h2');
//   });
  
//   // Load initial projects
//   loadProjects(filteredProjects);
// });
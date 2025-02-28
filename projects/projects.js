// Fixed version
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

console.log("IT'S ALIVE!");

import { fetchJSON, renderProjects } from '/portfolio/global.js'; 

const width = 500;
const height = 500;
const radius = Math.min(width, height) / 2; 

let projects = [];
let query = '';
const searchInput = document.querySelector('.searchBar');
const projectsContainer = document.querySelector('.projects'); 

// Main initialization function
async function initialize() {
  try {
    // Fetch projects data
    projects = await fetchJSON("/portfolio/lib/projects.json"); 
    
    // Clear container first
    projectsContainer.innerHTML = "";
    
    // Loop through projects and render each one individually
    projects.forEach(project => {
      renderProjects(project, projectsContainer, 'h2');
    });
    
    // Render pie chart
    renderPieChart(processProjectsData(projects));
  } catch (error) {
    console.error("Error initializing projects:", error);
  }
}

// Call the initialize function
initialize();

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

    // Clear container first
    projectsContainer.innerHTML = "";
    
    // Loop through filtered projects and render each one
    filteredProjects.forEach(project => {
        renderProjects(project, projectsContainer, 'h2');
    });
    
    let newData = processProjectsData(filteredProjects);
    renderPieChart(newData);
});
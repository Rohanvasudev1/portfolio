
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// console.log("IT'S ALIVE!");

// import { fetchJSON, renderProjects } from '/portfolio/global.js'; 

// const width = 500;
// const height = 500;
// const radius = Math.min(width, height) / 2; 

// let projects = [];
// let query = '';
// const searchInput = document.querySelector('.searchBar');
// const projectsContainer = document.querySelector('.projects'); 

// // Main initialization function
// async function initialize() {
//   try {
//     // Fetch projects data
//     projects = await fetchJSON("/portfolio/lib/projects.json"); 
    
//     // Clear container first
//     projectsContainer.innerHTML = "";
    
//     // Loop through projects and render each one individually
//     projects.forEach(project => {
//       renderProjects(project, projectsContainer, 'h2');
//     });
    
    
//     renderPieChart(processProjectsData(projects));
//   } catch (error) {
//     console.error("Error initializing projects:", error);
//   }
// }


// initialize();

// function processProjectsData(filteredProjects) {
//     let rolledData = d3.rollups(
//         filteredProjects,
//         (v) => v.length, 
//         (d) => d.year 
//     );

//     return rolledData.map(([year, count]) => ({
//         value: count,
//         label: year.toString(), 
//     }));
// }

// function renderPieChart(data) {
//     const colors = d3.scaleOrdinal(d3.schemeTableau10);

//     const svg = d3.select("#projects-plot")
//                   .attr("viewBox", "-250 -250 500 500")
//                   .html(""); 

//     const g = svg.append("g").attr("transform", "translate(0,0)");

//     const pie = d3.pie().value((d) => d.value);
//     const arc = d3.arc().innerRadius(0).outerRadius(radius);

//     g.selectAll("path")
//       .data(pie(data))
//       .enter()
//       .append("path")
//       .attr("d", arc)
//       .attr("fill", (d, i) => colors(i))
//       .attr("stroke", "#fff")
//       .style("stroke-width", "2px");

//     const legend = d3.select("#legend").html("");

//     const legendItems = legend.selectAll(".legend-item")
//                               .data(data)
//                               .enter()
//                               .append("div")
//                               .attr("class", "legend-item");

//     legendItems.append("span")
//                .attr("class", "legend-color")
//                .style("background-color", (d, i) => colors(i));

//     legendItems.append("span").text((d) => `${d.label} (${d.value})`);
// }

// function setQuery(newQuery) {
//     query = newQuery.toLowerCase();

//     return projects.filter((project) => {
//         let values = Object.values(project).join('\n').toLowerCase();
//         return values.includes(query);
//     });
// }

// searchInput.addEventListener("input", (event) => {
//     let filteredProjects = setQuery(event.target.value);
    
//     if (!projectsContainer) {
//         console.error("Error: projectsContainer not found.");
//         return;
//     }

//     // Clear container first
//     projectsContainer.innerHTML = "";
    
//     // Loop through filtered projects and render each one
//     filteredProjects.forEach(project => {
//         renderProjects(project, projectsContainer, 'h2');
//     });
    
//     let newData = processProjectsData(filteredProjects);
//     renderPieChart(newData);
// });

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log("IT'S ALIVE!");
import { fetchJSON, renderProjects } from '/portfolio/global.js';

const width = 500;
const height = 500;
const radius = Math.min(width, height) / 2;
let projects = [];
let query = '';
let activeYear = null;
const searchInput = document.querySelector('.searchBar');
const projectsContainer = document.querySelector('.projects');

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "chart-tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "rgba(0, 0, 0, 0.8)")
  .style("color", "white")
  .style("padding", "8px 12px")
  .style("border-radius", "4px")
  .style("font-size", "14px")
  .style("pointer-events", "none")
  .style("z-index", "100")
  .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.2)");

async function initialize() {
  try {
    projects = await fetchJSON("/portfolio/lib/projects.json");
    
    projectsContainer.innerHTML = "";
    
    projects.forEach(project => {
      renderProjects(project, projectsContainer, 'h2');
    });
    
    renderPieChart(processProjectsData(projects), true);
    
  } catch (error) {
    console.error("Error initializing projects:", error);
  }
}

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

function calculatePercentage(d, data) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return ((d.value / total) * 100).toFixed(1);
}

function renderPieChart(data, animate = false) {
  const customColors = ["#2c3e50", "#3498db", "#1abc9c", "#2980b9", "#16a085", "#34495e", "#2574a9", "#1f3a93"];
  const colors = d3.scaleOrdinal(customColors);
  
  const svg = d3.select("#projects-plot")
    .attr("viewBox", "-300 -300 600 600")
    .html("");
    
  const g = svg.append("g").attr("transform", "translate(0,0)");
  
  const pie = d3.pie().value((d) => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const hoverArc = d3.arc().innerRadius(0).outerRadius(radius * 1.05);
  
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -220)

    .style("font-size", "24px")
    .style("font-weight", "bold")
    .attr("fill", "currentColor");
    
  const paths = g.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => colors(i))
    .attr("stroke", "#fff")
    .style("stroke-width", "2px")
    .style("cursor", "pointer")
    .style("transition", "opacity 0.3s");
    
  if (animate) {
    paths
      .style("opacity", 0)
      .each(function(d, i) {
        d3.select(this)
          .transition()
          .duration(500)
          .delay(i * 100)
          .style("opacity", activeYear === null || d.data.label === activeYear ? 1 : 0.6);
      });
  } else {
    paths.style("opacity", d => activeYear === null || d.data.label === activeYear ? 1 : 0.6);
  }
  
  paths
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("d", hoverArc);
      
      tooltip
        .html(`<strong>${d.data.label}</strong>: ${d.data.value} project${d.data.value !== 1 ? 's' : ''} (${calculatePercentage(d.data, data)}%)`)
        .style("visibility", "visible")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("d", arc);
        
      tooltip.style("visibility", "hidden");
    })
    .on("click", function(event, d) {
      const year = d.data.label;
      
      if (activeYear === year) {
        activeYear = null;
        filterProjectsByYear(null);
      } else {
        activeYear = year;
        filterProjectsByYear(year);
      }
      
      g.selectAll("path")
        .transition()
        .duration(300)
        .style("opacity", item => activeYear === null || item.data.label === activeYear ? 1 : 0.6);
        
      d3.selectAll(".legend-item")
        .transition()
        .duration(300)
        .style("opacity", item => activeYear === null || item.label === activeYear ? 1 : 0.6);
    });
  
  g.selectAll("text")
    .data(pie(data))
    .enter()
    .append("text")
    .attr("transform", d => {
      if (d.endAngle - d.startAngle > 0.3) {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]},${centroid[1]})`;
      }
      return "translate(-1000,-1000)";
    })
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.data.value)
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#fff")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .transition()
    .delay((d, i) => animate ? 500 + i * 100 : 0)
    .duration(500)
    .style("opacity", 1);
  
  const legend = d3.select("#legend").html("");
  
  const legendItems = legend.selectAll(".legend-item")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .style("cursor", "pointer")
    .style("opacity", d => activeYear === null || d.label === activeYear ? 1 : 0.6)
    .on("mouseover", function(event, d) {
      g.selectAll("path")
        .filter(path => path.data.label === d.label)
        .transition()
        .duration(200)
        .attr("d", hoverArc);
        
      d3.select(this)
        .transition()
        .duration(200)
        .style("transform", "translateX(5px)");
    })
    .on("mouseout", function(event, d) {
      g.selectAll("path")
        .transition()
        .duration(200)
        .attr("d", arc);
        
      d3.select(this)
        .transition()
        .duration(200)
        .style("transform", "translateX(0)");
    })
    .on("click", function(event, d) {
      const year = d.label;
      
      if (activeYear === year) {
        activeYear = null;
        filterProjectsByYear(null);
      } else {
        activeYear = year;
        filterProjectsByYear(year);
      }
      
      g.selectAll("path")
        .transition()
        .duration(300)
        .style("opacity", item => activeYear === null || item.data.label === activeYear ? 1 : 0.6);
        
      d3.selectAll(".legend-item")
        .transition()
        .duration(300)
        .style("opacity", item => activeYear === null || item.label === activeYear ? 1 : 0.6);
    });
  
  legendItems.append("span")
    .attr("class", "legend-color")
    .style("background-color", (d, i) => colors(i));
    
  legendItems.append("span")
    .text((d) => `${d.label} (${d.value})`);
    
  if (activeYear !== null) {
    legend.append("div")
      .attr("class", "legend-reset")
      .style("margin-top", "15px")
      .style("cursor", "pointer")
      .style("color", "var(--accent-color)")
      .style("font-weight", "bold")
      .text("Reset filters")
      .on("click", function() {
        activeYear = null;
        filterProjectsByYear(null);
        
        g.selectAll("path")
          .transition()
          .duration(300)
          .style("opacity", 1);
          
        d3.selectAll(".legend-item")
          .transition()
          .duration(300)
          .style("opacity", 1);
      });
  }
}

function filterProjectsByYear(year) {
  const filteredProjects = year === null 
    ? projects 
    : projects.filter(project => project.year.toString() === year);
  
  projectsContainer.innerHTML = "";
  
  filteredProjects.forEach(project => {
    renderProjects(project, projectsContainer, 'h2');
  });
  
  let newData = processProjectsData(filteredProjects);
  if (newData.length === 0 && year !== null) {
    newData = [{ label: year, value: 0 }];
  }
  
  renderPieChart(newData, false);
}

function setQuery(newQuery) {
  query = newQuery.toLowerCase();
  activeYear = null;
  
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
  
  projectsContainer.innerHTML = "";
  
  filteredProjects.forEach(project => {
    renderProjects(project, projectsContainer, 'h2');
  });
  
  let newData = processProjectsData(filteredProjects);
  renderPieChart(newData, false);
});
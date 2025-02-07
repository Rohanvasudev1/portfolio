import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Dimensions for the pie chart
const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2; // 150

// Example data array with labels and values
const data = [
  { value: 1, label: "apples" },
  { value: 2, label: "oranges" },
  { value: 3, label: "mangos" },
  { value: 4, label: "pears" },
  { value: 5, label: "limes" },
  { value: 5, label: "cherries" }
];

// Create a color scale (Tableau10 is a nice built-in scheme)
const colors = d3.scaleOrdinal(d3.schemeTableau10);

// Select the SVG and set up a viewBox so the chart can scale if needed
const svg = d3.select("#projects-plot")
  .attr("viewBox", [-width / 2, -height / 2, width, height].join(" "));

// Select the <g> inside the SVG and ensure it's centered at (0,0)
const g = svg.select("g").attr("transform", "translate(0,0)");

// Create a D3 pie layout generator
const pie = d3.pie().value(d => d.value);

// Create arc generators for the slices
const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

// Draw the pie slices (no stroke around slices)
g.selectAll("path")
  .data(pie(data))
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("fill", (d, i) => colors(i));

// OPTIONAL: Add label lines, if desired
const outerArc = d3.arc()
  .innerRadius(radius * 1.2)
  .outerRadius(radius * 1.3);




// =============== BUILD THE LEGEND ===============
const legend = d3.select("#legend")
  .selectAll(".legend-item")
  .data(data)
  .enter()
  .append("div")
  .attr("class", "legend-item");

// Append a color chip span (circular)
legend.append("span")
  .attr("class", "legend-color")
  .style("background-color", (d, i) => colors(i));

// Append the label + value
legend.append("span")
  .text(d => ` ${d.label} (${d.value})`);

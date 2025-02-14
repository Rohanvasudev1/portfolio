// Global variables for data storage
let data = [];
let commits = [];

const width = 1000;
const height = 600;

// Load CSV data and process it
async function loadData() {
    try {
        data = await d3.csv('loc.csv');
        console.log("CSV Data Loaded:", data);

        displayStats(); // Display detailed stats
        displaySummaryStats(); // Display summary stats
        createScatterplot(); // Create the scatterplot

    } catch (error) {
        console.error("Error loading CSV file:", error);
    }
}

// Process commit data
function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit) 
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            let ret = {
                id: commit,
                url: 'https://github.com/YOUR_REPO/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime: new Date(datetime),
                hourFrac: new Date(datetime).getHours() + new Date(datetime).getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                writable: false,
                enumerable: false,
                configurable: false
            });

            return ret;
        });
}

// Display detailed statistics
function displayStats() {
    processCommits();

    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    dl.append('dt').text('Number of Files');
    dl.append('dd').text(d3.group(data, (d) => d.file).size);

    const fileLengths = d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file);
    dl.append('dt').text('Average File Length');
    dl.append('dd').text(d3.mean(fileLengths, (d) => d[1]).toFixed(2));

    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    dl.append('dt').text('Most Active Time of Day');
    dl.append('dd').text(maxPeriod);
}
function brushSelector() {
    const svg = document.querySelector("svg");
    d3.select(svg).call(d3.brush()); // Attach brushing to the SVG
}
// Display summary statistics
function displaySummaryStats() {
    processCommits();

    const summary = d3.select("#summary-stats").html("");

    const stats = [
        { label: "Commits", value: commits.length },
        { label: "Files", value: d3.group(data, (d) => d.file).size },
        { label: "Total LOC", value: data.length },
        { label: "Max Depth", value: d3.max(data, (d) => d.depth) },
        { label: "Longest Line", value: d3.max(data, (d) => d.line_length) },
        { label: "Max Lines", value: d3.max(data, (d) => d.line) },
    ];

    summary
        .selectAll(".summary-item")
        .data(stats)
        .join("dl")
        .attr("class", "summary-item")
        .html(d => `<dt>${d.label}</dt><dd>${d.value}</dd>`);
}
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}
function updateTooltipContent(commit, event = null) {
    const tooltip = document.getElementById("commit-tooltip");
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const lines = document.getElementById("commit-lines");

    if (Object.keys(commit).length === 0) {
        tooltip.style.display = "none"; // Hide tooltip if no commit
        return;
    }

    // Update content with commit details
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleDateString("en", { dateStyle: "full" });
    time.textContent = commit.datetime.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;

    tooltip.style.display = "block"; // Show tooltip

    if (event) {
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
    }
}
// Create scatterplot of commits over time
let brushSelection = null;
let xScale, yScale; // Declare globally to access in isCommitSelected()

function createScatterplot() {
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("overflow", "visible");

    const margin = { top: 10, right: 10, bottom: 30, left: 50 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // Store scales globally
    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(
            d3.axisLeft(yScale)
                .tickSize(-usableArea.width)
                .tickFormat("")
        );

    // Change gridline colors based on time of day
    gridlines.selectAll("line")
        .each(function (d, i) {
            let hour = yScale.domain()[0] + i;
            d3.select(this)
                .attr("stroke", hour < 6 || hour > 18 ? "#3366cc" : "#ff9800") 
                .attr("stroke-opacity", 0.6);
        });

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxisFormatted = d3.axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

    svg.append("g")
        .attr("transform", `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(yAxisFormatted);

    // Calculate the min and max number of lines edited
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    // Use a square root scale to map commit size to dot size correctly
    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])  
        .range([2, 30]);

    // Sort commits by total lines edited (largest first)
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // Draw Circles
    const dots = svg.append("g")
        .attr("class", "dots")
        .selectAll("circle")
        .data(sortedCommits)
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", (d) => rScale(d.totalLines)) 
        .attr("fill", "steelblue")
        .style("fill-opacity", 0.7)
        .on("mouseenter", function (event, d) {
            d3.select(event.currentTarget)
                .style("fill-opacity", 1)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
            updateTooltipContent(d, event);
            updateTooltipVisibility(true);
        })
        .on("mouseleave", function () {
            d3.select(event.currentTarget)
                .style("fill-opacity", 0.7)
                .attr("stroke", "none");
            updateTooltipVisibility(false);
        });

    // ====== Brushing: Select Multiple Data Points ======

    const brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
        .on("brush end", brushed);

    // Append brush interaction **BEFORE** dots so it doesn’t block tooltips
    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    // Raise dots and tooltips **above** the brush overlay so they remain interactive
    svg.selectAll(".dots, .overlay ~ *").raise();
}
function updateSelectionCount() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected) // Filter selected commits
        : [];

    const countElement = document.getElementById("selection-count");
    countElement.textContent = `${
        selectedCommits.length || "No"
    } commits selected`;

    return selectedCommits;
}
function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];
    
    const container = document.getElementById("language-breakdown");

    if (selectedCommits.length === 0) {
        container.innerHTML = "<p>No commits selected</p>";
        return;
    }

    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Count lines per language using d3.rollup
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update DOM with breakdown
    container.innerHTML = "";
    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format(".1~%")(proportion);

        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }

    return breakdown;
}
// Handle brush events
function brushed(event) {
    console.log(event); // Log brush events to debug
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}

// Check if a commit is inside the brush selection
function isCommitSelected(commit) {
    if (!brushSelection) return false; // No selection, no filtering

    const [[x0, y0], [x1, y1]] = brushSelection; // Get brush box bounds

    // Get commit coordinates using scales
    const commitX = xScale(commit.datetime);
    const commitY = yScale(commit.hourFrac);

    return x0 <= commitX && commitX <= x1 && y0 <= commitY && commitY <= y1;
}

// Update selection by applying CSS class to selected dots
function updateSelection() {
    d3.selectAll("circle")
        .classed("selected", (d) => isCommitSelected(d)); // Apply class if selected
}


// Call loadData to start everything
document.addEventListener("DOMContentLoaded", loadData);


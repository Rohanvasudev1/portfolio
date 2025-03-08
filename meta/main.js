
// let data = [];
// let commits = [];
// let selectedCommits = [];

// let commitProgress = 100;
// let timeScale;
// let commitMaxTime;


// let isHovering = false;

let data = [];
let commits = [];
let selectedCommits = [];
let filteredCommits = []; 
let isHovering = false;
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

const width = 1000;
const height = 600;

// async function loadData() {
//     try {
//         data = await d3.csv('loc.csv');
//         console.log("CSV Data Loaded:", data);

//         displayStats(); // Display detailed stats
//         displaySummaryStats(); // Display summary stats
//         createScatterplot(); // Create the scatterplot

//         const slider = document.getElementById('time-slider');
//         if (slider) {
//             slider.addEventListener('input', function() {
//                 commitProgress = Number(this.value);
//                 commitMaxTime = timeScale.invert(commitProgress);
//                 updateTimeDisplay();
//             });
            
//             // Initialize time display
//             updateTimeDisplay();
//         }

//     } catch (error) {
//         console.error("Error loading CSV file:", error);
//     }
// }

// Add these at the top level with your other variable declarations
let NUM_ITEMS = 0; 
let ITEM_HEIGHT = 110; // Increased to match screenshot - each commit needs more space
let VISIBLE_COUNT = 6;
let totalHeight = 0;

// Enhanced initScrollytelling function
function initScrollytelling() {
    // Sort commits chronologically (oldest to newest)
    commits = commits.sort((a, b) => a.datetime - b.datetime);
    
    NUM_ITEMS = commits.length;
    totalHeight = NUM_ITEMS * ITEM_HEIGHT;
    
    // Setup for graph scrollytelling
    const graphScrollContainer = d3.select('#graph-scrollytelling');
    const graphSpacer = d3.select('#graph-spacer');
    graphSpacer.style('height', `${totalHeight}px`);
    
    // Setup for files scrollytelling
    const filesScrollContainer = d3.select('#files-scrollytelling');
    const filesSpacer = d3.select('#files-spacer');
    filesSpacer.style('height', `${totalHeight}px`);
    
    // Initial render for both
    renderGraphItems(0);
    renderFilesItems(0);
    
    // Set up scroll events for graph scrollytelling
    graphScrollContainer.on('scroll', function() {
        const scrollTop = this.scrollTop;
        let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
        
        // Get the latest visible commit to update visualizations
        const visibleCommits = commits.slice(startIndex, startIndex + VISIBLE_COUNT);
        if (visibleCommits.length > 0) {
            // Update to show commits up to the most recent visible one
            const latestVisibleCommit = visibleCommits[visibleCommits.length - 1];
            commitMaxTime = latestVisibleCommit.datetime;
            
            // Update visualizations
            filterCommitsByTime();
            updateScatterplot(filteredCommits);
        }
        
        renderGraphItems(startIndex);
    });
    
    // Set up scroll events for files scrollytelling
    filesScrollContainer.on('scroll', function() {
        const scrollTop = this.scrollTop;
        let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
        
        // Get the latest visible commit to update visualizations
        const visibleCommits = commits.slice(startIndex, startIndex + VISIBLE_COUNT);
        if (visibleCommits.length > 0) {
            // Update to show commits up to the most recent visible one
            const latestVisibleCommit = visibleCommits[visibleCommits.length - 1];
            commitMaxTime = latestVisibleCommit.datetime;
            
            // Update file visualization
            filterCommitsByTime();
            displayCommitFiles();
        }
        
        renderFilesItems(startIndex);
    });
}

// Updated to format commit stories with proper chronological context
function generateCommitStory(commit, index, allCommits) {
    // Determine if this is the first commit
    const isFirstCommit = index === 0;
    const commitMessage = isFirstCommit ? 
        'my first commit, and it was glorious' : 
        'another glorious commit';
    
    // Format the date exactly as shown in screenshot
    const dateFormatted = commit.datetime.toLocaleString("en-US", {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
    
    // Return the formatted story text
    return `On ${dateFormatted}, I made <a href="${commit.url}" target="_blank">${commitMessage}</a>. I edited ${commit.totalLines} lines. Then I looked over all I had made, and I saw that it was very good.`;
}

// Updated renderGraphItems function to show commits in chronological order
function renderGraphItems(startIndex) {
    // Clear existing elements
    const itemsContainer = d3.select('#graph-items');
    itemsContainer.selectAll('div').remove();
    
    // Get the slice of commits to display
    const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
    let visibleCommits = commits.slice(startIndex, endIndex);
    
    // Update the scatterplot if there are commits to display
    if (visibleCommits.length > 0) {
        // Use the most recent visible commit to set the cutoff time
        const latestVisibleCommit = visibleCommits[visibleCommits.length - 1];
        commitMaxTime = latestVisibleCommit.datetime;
        filterCommitsByTime();
        updateScatterplot(filteredCommits);
    }
    
    // Render the commit items
    itemsContainer.selectAll('div')
        .data(visibleCommits)
        .enter()
        .append('div')
        .attr('class', 'item')
        .style('position', 'absolute')
        .style('width', '100%')
        .style('left', '0')
        .style('padding', '22px 25px')
        .style('box-sizing', 'border-box')
        .style('border-bottom', '1px solid #e9ecef')
        .style('background-color', '#f8f9fa')
        .style('min-height', 'auto')
        .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`)
        .html((d, i) => {
            // Generate story text with proper context
            const absoluteIndex = startIndex + i;
            return `<p style="margin: 0; text-align: left; line-height: 1.5;">${generateCommitStory(d, absoluteIndex, commits)}</p>`;
        })
        .on('click', (event, d) => {
            // Update visualization to show up to this commit
            commitMaxTime = d.datetime;
            filterCommitsByTime();
            updateScatterplot(filteredCommits);
            displayCommitFiles();
        });
}

// Similarly updated renderFilesItems function
function renderFilesItems(startIndex) {
    // Clear existing elements
    const itemsContainer = d3.select('#files-items');
    itemsContainer.selectAll('div').remove();
    
    // Get the slice of commits to display
    const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
    let visibleCommits = commits.slice(startIndex, endIndex);
    
    // Update the file visualization if there are commits to display
    if (visibleCommits.length > 0) {
        // Use the most recent visible commit to set the cutoff time
        const latestVisibleCommit = visibleCommits[visibleCommits.length - 1];
        commitMaxTime = latestVisibleCommit.datetime;
        filterCommitsByTime();
        displayCommitFiles();
    }
    
    // Render the commit items
    itemsContainer.selectAll('div')
        .data(visibleCommits)
        .enter()
        .append('div')
        .attr('class', 'item')
        .style('position', 'absolute')
        .style('width', '100%')
        .style('left', '0')
        .style('padding', '22px 25px')
        .style('box-sizing', 'border-box')
        .style('border-bottom', '1px solid #e9ecef')
        .style('background-color', '#f8f9fa')
        .style('min-height', 'auto')
        .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`)
        .html((d, i) => {
            // Generate story text with proper context
            const absoluteIndex = startIndex + i;
            return `<p style="margin: 0; text-align: left; line-height: 1.5;">${generateCommitStory(d, absoluteIndex, commits)}</p>`;
        })
        .on('click', (event, d) => {
            // Update visualization to show up to this commit
            commitMaxTime = d.datetime;
            filterCommitsByTime();
            displayCommitFiles();
        });
}

// Update these constants at the top of your fi
function renderItems(startIndex) {
  // Clear things off
  const itemsContainer = d3.select('#items-container');
  itemsContainer.selectAll('div').remove();
  
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);
  
  // Update the time slider to match the latest commit in view
  if (newCommitSlice.length > 0) {
    const latestCommit = newCommitSlice[0];
    commitMaxTime = latestCommit.datetime;
    
    // Update the time slider value
    const timeValue = timeScale(commitMaxTime);
    const timeSlider = document.getElementById('time-slider');
    if (timeSlider) {
      timeSlider.value = timeValue;
    }
    
    // Update visualizations
    filterCommitsByTime();
    updateScatterplot(filteredCommits);
    updateFileVisualization();
  }
  
  // Re-bind the commit data to the container and represent each using a div
  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .attr('class', 'item')
    .html(d => `
      <strong>${d.id.substring(0, 7)}</strong> - 
      ${d.datetime.toLocaleDateString()} ${d.datetime.toLocaleTimeString()} - 
      <em>${d.author}</em> - 
      ${d.totalLines} lines
    `)
    .style('position', 'absolute')
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
    .on('click', (event, d) => {
      // When a commit is clicked, update to show only that commit
      commitMaxTime = d.datetime;
      filterCommitsByTime();
      updateScatterplot(filteredCommits);
      updateFileVisualization();
      
      // Update selected time display
      const selectedTime = document.getElementById('selectedTime');
      if (selectedTime) {
        selectedTime.textContent = commitMaxTime.toLocaleString('en', {
          dateStyle: "long",
          timeStyle: "short"
        });
      }
    });
}


async function loadData() {
    try {
      // Try to load the CSV file
      try {
        data = await d3.csv('loc.csv');
        console.log("CSV Data Loaded:", data);
      } catch (csvError) {
        console.warn("Could not load CSV file, using sample data instead:", csvError);
        data = sampleData;
      }
  
      processCommits();
      displayStats();
      displaySummaryStats();
      
      // Initially filter all commits (no filtering)
      filterCommitsByTime();
      
      // Create initial scatter plot with all commits
      updateScatterplot(filteredCommits);
      displayCommitFiles();
      
      // Initialize scrollytelling
      initScrollytelling();
    } catch (error) {
      console.error("Error in data processing:", error);
    }
  }
function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit) 
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;

            let ret = {
                id: commit,
                url: 'https://github.com/rohanvasudev1/portfolio/commit/' + commit,
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
        timeScale = d3.scaleTime()
            .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
            .range([0, 100]);
        commitMaxTime = timeScale.invert(commitProgress);
}


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
    d3.select(svg).call(d3.brush()); 
}

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
// function updateTooltipVisibility(isVisible) {
//     const tooltip = document.getElementById('commit-tooltip');
//     tooltip.hidden = !isVisible;
// }
// function updateTooltipContent(commit, event = null) {
//     const tooltip = document.getElementById("commit-tooltip");
//     const link = document.getElementById("commit-link");
//     const date = document.getElementById("commit-date");
//     const time = document.getElementById("commit-time");
//     const author = document.getElementById("commit-author");
//     const lines = document.getElementById("commit-lines");

//     if (Object.keys(commit).length === 0) {
//         tooltip.style.display = "none"; 
//         return;
//     }

//     // Update tooltip content
//     link.href = commit.url;
//     link.textContent = commit.id;
//     date.textContent = commit.datetime.toLocaleDateString("en", { dateStyle: "full" });
//     time.textContent = commit.datetime.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
//     author.textContent = commit.author;
//     lines.textContent = commit.totalLines;

//     tooltip.style.display = "block"; 

//     if (event) {
//         // Position tooltip directly next to the point
//         // Calculate position based on circle radius
//         const pointRadius = parseFloat(event.currentTarget.getAttribute("r"));
        
//         // Position tooltip to the right of the point with minimal offset
//         tooltip.style.left = `${event.pageX + pointRadius + 5}px`;
        
//         // Center tooltip vertically with the point
//         const tooltipHeight = tooltip.offsetHeight;
//         tooltip.style.top = `${event.pageY - (tooltipHeight / 2)}px`;
//     }
// }

function showTooltip(commit, event) {
    // Get the tooltip element
    const tooltip = document.getElementById("commit-tooltip");
    if (!tooltip) {
        console.error("Tooltip element not found!");
        return;
    }
    
    // Get all the tooltip content elements
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const lines = document.getElementById("commit-lines");
    
    if (!link || !date || !time || !author || !lines) {
        console.error("One or more tooltip elements not found!");
        return;
    }
    
    // Update tooltip content
    link.href = commit.url;
    link.textContent = commit.id.substring(0, 7); // Show first 7 chars of commit hash
    date.textContent = commit.datetime.toLocaleDateString("en", { dateStyle: "full" });
    time.textContent = commit.datetime.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
    
    // Force show the tooltip
    tooltip.classList.add("visible");
    tooltip.style.display = "grid"; // Add this line to explicitly set display property
    
    // Position tooltip near the circle - simplified positioning
    tooltip.style.left = `${event.pageX + 15}px`;
    tooltip.style.top = `${event.pageY - 30}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById("commit-tooltip");
    if (tooltip) {
        tooltip.classList.remove("visible");
        tooltip.style.display = "none"; // Add this line to explicitly set display to none
    }
}

let brushSelection = null;
let xScale, yScale; 

function updateScatterplot(commits) {
    // Remove previous SVG
    d3.select('#chart svg').remove();
    
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
  
    // Update scales with filtered commits
    xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();
  
    yScale = d3.scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);
  
    const gridlines = svg.append("g")
      .attr("class", "gridlines")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-usableArea.width)
          .tickFormat("")
      );
  
    gridlines.selectAll("line")
      .each(function (d, i) {
        let hour = yScale.domain()[0] + i;
        d3.select(this)
          .attr("stroke", hour < 6 || hour > 18 ? "#3366cc" : "#ff9800") 
          .attr("stroke-opacity", 0.6);
      });
  
    const xAxis = d3.axisBottom(xScale);
    const yAxisFormatted = d3.axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");
  
    svg.append("g")
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .call(xAxis);
  
    svg.append("g")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(yAxisFormatted);
  
    // Update rScale with filtered commits
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt()
      .domain([minLines, maxLines])  
      .range([2, 30]);
  
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
    const dots = svg.append("g")
    .attr("class", "dots")
    .selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => rScale(d.totalLines))
    .style("animation-duration", d => `${Math.min(500, rScale(d.totalLines) * 10)}ms`)  // Add this line here
    .attr("fill", "steelblue")
    .style("fill-opacity", 0.7)
    .on("mouseenter", function(event, d) {
        isHovering = true;
        
        // Highlight the circle
        d3.select(this)
          .style("fill-opacity", 1)
          .attr("stroke", "black")
          .attr("stroke-width", 2)
          .classed('selected', isCommitSelected(d));
        
        // Show tooltip with commit info
        showTooltip(d, event);
    })
    .on("mouseleave", function(event, d) {
        isHovering = false;
        
        // Return circle to normal
        d3.select(this)
          .style("fill-opacity", 0.7)
          .attr("stroke", "none")
          .classed('selected', isCommitSelected(d));
        
        // Hide tooltip
        hideTooltip();
    })
    .on("mousemove", function(event, d) {
        // Only update tooltip if we're actually hovering
        if (isHovering) {
            const tooltip = document.getElementById("commit-tooltip");
            if (tooltip && tooltip.classList.contains("visible")) {
                showTooltip(d, event);
            }
        }
    })
  
    const brush = d3.brush()
      .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
      .on("brush end", brushed);
  
    svg.append("g")
      .attr("class", "brush")
      .call(brush);
  
    svg.selectAll(".dots, .overlay ~ *").raise();
  }
// function updateSelectionCount() {
//     const selectedCommits = brushSelection
//         ? commits.filter(isCommitSelected) 
//         : [];

//     const countElement = document.getElementById("selection-count");
//     countElement.textContent = `${
//         selectedCommits.length || "No"
//     } commits selected`;

//     return selectedCommits;
// }

function updateSelectionCount() {
    const countElement = document.getElementById("selection-count");
    if (countElement) {
        countElement.textContent = `${
            selectedCommits.length || "No"
        } commits selected`;
    }
    return selectedCommits;
}
function updateLanguageBreakdown() {

    const container = document.getElementById("language-breakdown");
    
    if (!container) return;

    if (selectedCommits.length === 0) {
        container.innerHTML = "<p>No commits selected</p>";
        return;
    }

    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    
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


// function brushed(event) {
//     console.log(event); 
//     brushSelection = event.selection;
//     updateSelection();
//     updateSelectionCount();
//     updateLanguageBreakdown();
// }

function brushed(event) {
    let brushSelection = event.selection;
    selectedCommits = !brushSelection
      ? []
      : filteredCommits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.datetime);
          let y = yScale(commit.hourFrac);
  
          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
    
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }

  function displayCommitFiles() {
    const lines = filteredCommits.flatMap((d) => d.lines);
    let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
    let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
      return { name, lines };
    });
    files = d3.sort(files, (d) => -d.lines.length);
    d3.select('.files').selectAll('div').remove();
    let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
    filesContainer.append('dt').html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
    filesContainer.append('dd')
                  .selectAll('div')
                  .data(d => d.lines)
                  .enter()
                  .append('div')
                  .attr('class', 'line')
                  .style('background', d => fileTypeColors(d.type));
  }

  function updateTimeDisplay() {
    const timeSlider = document.getElementById('time-slider');
    const selectedTime = document.getElementById('selectedTime');
    
    if (!timeSlider || !selectedTime) return;
    
    commitProgress = Number(timeSlider.value);
    commitMaxTime = timeScale.invert(commitProgress);
    
    // Update the displayed time
    selectedTime.textContent = commitMaxTime.toLocaleString('en', {
      dateStyle: "long",
      timeStyle: "short"
    });
    
    // Filter commits and update visualization
    filterCommitsByTime();
    updateScatterplot(filteredCommits);
    updateSelectionCount();
    updateLanguageBreakdown();
    updateFileVisualization();
  }


// function isCommitSelected(commit) {
//     if (!brushSelection) return false; 

//     const [[x0, y0], [x1, y1]] = brushSelection; 


//     const commitX = xScale(commit.datetime);
//     const commitY = yScale(commit.hourFrac);

//     return x0 <= commitX && commitX <= x1 && y0 <= commitY && commitY <= y1;
// }

// function isCommitSelected(commit) {
//     return selectedCommits.includes(commit);
// }

function isCommitSelected(commit) {
    // First check if the commit is before our max time
    if (commit.datetime > commitMaxTime) {
        return false;
    }
    
    // Then check if it's in our selection set
    return selectedCommits.includes(commit);
}

function filterCommitsByTime() {
    // Filter commits by comparing datetime with commitMaxTime
    filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
    
    // Update selection to only include commits that are still visible
    selectedCommits = selectedCommits.filter(commit => commit.datetime <= commitMaxTime);
    
    // Return the filtered commits for chaining
    return filteredCommits;
  }

  function updateFileVisualization() {
    // Get lines from filtered commits
    let lines = filteredCommits.flatMap((d) => d.lines);
    
    // Group lines by file
    let files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
        return { name, lines };
      })
      .sort((a, b) => b.lines.length - a.lines.length); // Sort by number of lines (descending)
    
    // Update the visualization
    d3.select('.files').selectAll('div').remove(); // Clear existing elements
    
    let filesContainer = d3.select('.files')
      .selectAll('div')
      .data(files)
      .enter()
      .append('div');
    
    // Add the filename with line count
    filesContainer.append('dt')
      .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
    
    // Add container for line dots
    const dotsContainer = filesContainer.append('dd');
    
    // Add individual dots for each line, colored by technology
    dotsContainer.selectAll('div')
      .data(d => d.lines)
      .enter()
      .append('div')
      .attr('class', 'line')
      .style('background-color', d => fileTypeColors(d.type || "Unknown"))
      .attr('title', d => `${d.type || "Unknown"} (Line ${d.line})`) // Add tooltip showing file type and line number
  }


// function updateSelection() {
//     d3.selectAll("circle")
//         .classed("selected", (d) => isCommitSelected(d)); 
// }



function updateSelection() {
    d3.selectAll("circle")
        .classed("selected", (d) => isCommitSelected(d))
        .attr("visibility", (d) => d.datetime > commitMaxTime ? "hidden" : "visible");
}





document.addEventListener("DOMContentLoaded", loadData);


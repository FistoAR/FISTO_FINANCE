(function ($) {
  // ==========================================
  // DONUT CHART PLUGIN
  // ==========================================

  $.fn.drawDonutChart = function (data, options) {
    var $container = this,
      settings = $.extend(
        {
          width: 310,
          height: 310,
          innerRadius: 0.6,
          colors: ["#10B981", "#6366F1", "#CBD5E1", "#F59E0B"],
          strokeColor: "#ffffff",
          strokeWidth: 3,
          animationDuration: 1200,
          summaryTitle: "Total",
          onSegmentHover: function () {},
        },
        options
      );

    var width = settings.width,
      height = settings.height,
      radius = Math.min(width, height) / 2,
      innerRadius = radius * settings.innerRadius;

    // Clear previous chart
    $container.empty();

    // Create SVG
    var svg = d3
      .select($container[0])
      .append("svg")
      .attr("class", "donut-svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create tooltip
    var $tip = $('<div class="chart-tip"></div>').appendTo("body");

    // Create summary
    var $summary = $('<div class="donut-summary"></div>')
      .appendTo($container)
      .html(
        '<div class="donut-summary-number">0</div>' +
          '<div class="donut-summary-title">' +
          settings.summaryTitle +
          "</div>"
      );

    // Calculate total
    var displayValue =
      typeof settings.centerValue !== "undefined"
        ? settings.centerValue
        : d3.sum(data, function (d) {
            return d.value;
          });

    // Create arc
    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(radius);

    var pie = d3.layout
      .pie()
      .value(function (d) {
        return d.value;
      })
      .sort(null);

    // Draw segments
    var path = svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", function (d, i) {
        return d.data.color || settings.colors[i % settings.colors.length];
      })
      .attr("stroke", settings.strokeColor)
      .attr("stroke-width", settings.strokeWidth)
      .on("mouseenter", function (d) {
        $tip.text(d.data.title + ": " + d.data.value).addClass("show");
        settings.onSegmentHover(d.data);
      })
      .on("mouseleave", function () {
        $tip.removeClass("show");
      })
      .on("mousemove", function () {
        $tip.css({
          top: d3.event.pageY - 60,
          left: d3.event.pageX - $tip.width() / 2,
        });
      })
      .transition()
      .duration(settings.animationDuration)
      .attrTween("d", function (d) {
        var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    // Animate total number
    var displayValue =
      typeof settings.centerValue !== "undefined"
        ? settings.centerValue
        : d3.sum(data, function (d) {
            return d.value;
          });

    return this;
  };

  // ==========================================
  // BAR CHART PLUGIN
  // ==========================================

  $.fn.drawBarChart = function (data, options) {
    var $container = this,
      settings = $.extend(
        {
          width: 700,
          height: 380,
          padding: { top: 50, right: 30, bottom: 70, left: 60 },
          colors: ["#10B981", "#6366F1", "#CBD5E1", "#F59E0B"],
          animationDuration: 900,
          onBarClick: function () {},
        },
        options
      );

    var width = settings.width,
      height = settings.height,
      padding = settings.padding;

    // Clear previous chart
    $container.empty();

    // Create SVG
    var svg = d3
      .select($container[0])
      .append("svg")
      .attr("class", "bar-graph-svg")
      .attr("width", width)
      .attr("height", height);

    // Scales
    var xScale = d3.scale
      .ordinal()
      .domain(
        data.map(function (d) {
          return d.label;
        })
      )
      .rangeRoundBands([padding.left, width - padding.right], 0.25);

    var yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d.value;
        }),
      ])
      .range([height - padding.bottom, padding.top]);

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(6);

    svg
      .append("g")
      .attr("class", "axis xaxis")
      .attr("transform", "translate(0," + (height - padding.bottom) + ")")
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "axis yaxis")
      .attr("transform", "translate(" + padding.left + ",0)")
      .call(yAxis);

    // Tooltip
    var $tip = $('<div class="chart-tip"></div>').appendTo("body");

    // Bars
    var bars = svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return xScale(d.label);
      })
      .attr("width", xScale.rangeBand())
      .attr("y", height - padding.bottom)
      .attr("height", 0)
      .attr("fill", function (d, i) {
        return d.color || settings.colors[i % settings.colors.length];
      })
      .attr("rx", 6)
      .attr("ry", 6)
      .on("mouseenter", function (d) {
        $tip.text(d.label + ": " + d.value).addClass("show");
      })
      .on("mouseleave", function () {
        $tip.removeClass("show");
      })
      .on("mousemove", function () {
        $tip.css({
          top: d3.event.pageY - 60,
          left: d3.event.pageX - $tip.width() / 2,
        });
      })
      .on("click", function (d) {
        settings.onBarClick(d);
      });

    // Animate bars
    bars
      .transition()
      .duration(settings.animationDuration)
      .delay(function (d, i) {
        return i * 120;
      })
      .ease("elastic")
      .attr("y", function (d) {
        return yScale(d.value);
      })
      .attr("height", function (d) {
        return height - padding.bottom - yScale(d.value);
      });

    // Value labels on top
    svg
      .selectAll(".bar-value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-value-label")
      .attr("x", function (d) {
        return xScale(d.label) + xScale.rangeBand() / 2;
      })
      .attr("y", function (d) {
        return yScale(d.value) - 10;
      })
      .attr("opacity", 0)
      .text(function (d) {
        return d.value;
      })
      .transition()
      .duration(settings.animationDuration)
      .delay(function (d, i) {
        return i * 120 + 500;
      })
      .attr("opacity", 1);

    // Percentage labels inside bars
    svg
      .selectAll(".bar-percent-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-percent-label")
      .attr("x", function (d) {
        return xScale(d.label) + xScale.rangeBand() / 2;
      })
      .attr("y", function (d) {
        var barHeight = height - padding.bottom - yScale(d.value);
        return yScale(d.value) + Math.min(barHeight / 2 + 6, barHeight - 10);
      })
      .attr("opacity", 0)
      .text(function (d) {
        return d.percent || "";
      })
      .transition()
      .duration(settings.animationDuration)
      .delay(function (d, i) {
        return i * 120 + 700;
      })
      .attr("opacity", function (d) {
        var barHeight = height - padding.bottom - yScale(d.value);
        return barHeight > 30 ? 1 : 0;
      });

    // Store update function
    $container.data("updateChart", function (newData) {
      // Update scales
      yScale.domain([
        0,
        d3.max(newData, function (d) {
          return d.value;
        }),
      ]);

      // Update Y axis
      svg.select(".yaxis").transition().duration(800).call(yAxis);

      // Update bars
      bars
        .data(newData)
        .transition()
        .duration(800)
        .ease("cubic-in-out")
        .attr("y", function (d) {
          return yScale(d.value);
        })
        .attr("height", function (d) {
          return height - padding.bottom - yScale(d.value);
        });

      // Update value labels
      svg
        .selectAll(".bar-value-label")
        .data(newData)
        .transition()
        .duration(800)
        .attr("y", function (d) {
          return yScale(d.value) - 10;
        })
        .tween("text", function (d) {
          var i = d3.interpolate(+this.textContent || 0, d.value);
          return function (t) {
            this.textContent = Math.round(i(t));
          };
        });

      // Update percentage labels
      svg
        .selectAll(".bar-percent-label")
        .data(newData)
        .transition()
        .duration(800)
        .attr("y", function (d) {
          var barHeight = height - padding.bottom - yScale(d.value);
          return yScale(d.value) + Math.min(barHeight / 2 + 6, barHeight - 10);
        })
        .attr("opacity", function (d) {
          var barHeight = height - padding.bottom - yScale(d.value);
          return barHeight > 30 ? 1 : 0;
        })
        .text(function (d) {
          return d.percent || "";
        });
    });

    return this;
  };
})(jQuery);

// ==========================================
// INITIALIZE PROJECT ANALYSIS WITH BACKEND
// ==========================================
$(function () {
  const API_BASE = "https://www.fist-o.com/fisto_finance_app/api/analysis/project";
  let projectData = {
    donutData: [],
    projectTotal: 0,
    projects: [],
    teamMembers: [],
    dailyReports: []
  };

  // Fetch all projects for dropdown
  async function fetchProjectList() {
    try {
      const response = await fetch(`${API_BASE}/get_projects.php`);
      const result = await response.json();
      if (result.success) {
        projectData.projects = result.projects;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Fetch status counts for donut chart
  async function fetchProjectStatusCounts() {
    try {
      const response = await fetch(`${API_BASE}/project_status_counts.php`);
      const result = await response.json();
      if (result.success) {
        const counts = result.counts;
        const total = result.total;

        const statusOrder = [
          { key: "Completed", label: "Completed", color: "#10B981" },
          { key: "Delayed", label: "Delayed", color: "#eab308" },
          { key: "In Progress", label: "In Progress", color: "#6366F1" },
          { key: "Not Started", label: "Not Started", color: "#CBD5E1" },
          { key: "Hold", label: "Hold", color: "#d09830ff" },
          { key: "Overdue", label: "Overdue", color: "#ef4444" },
        ];

        projectData.donutData = statusOrder.map((item) => ({
          title: item.label,
          value: counts[item.key] || 0,
          color: item.color,
        }));

        projectData.projectTotal = total;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Fetch team members (all or for specific project)
  async function fetchTeamMembers(projectId = null) {
    try {
      const url = projectId
        ? `${API_BASE}/get_team_members.php?project_id=${projectId}`
        : `${API_BASE}/get_team_members.php`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        projectData.teamMembers = result.members;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Fetch daily reports
  async function fetchDailyReports(projectName = null) {
    try {
      const url = projectName && projectName !== 'all'
        ? `${API_BASE}/get_daily_reports.php?project_name=${encodeURIComponent(projectName)}`
        : `${API_BASE}/get_daily_reports.php`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        projectData.dailyReports = result.reports;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Render grid of team members WITHOUT photo
  function renderTeamMembers() {
    const $container = $(".team-members-grid");
    $container.empty();

    if (projectData.teamMembers.length === 0) {
      $container.html('<div class="no-members">No team members found</div>');
      return;
    }

    projectData.teamMembers.forEach((member) => {
      $container.append(`
        <div class="team-member-card">
          <div class="member-name">${member.employee_name || ""}</div>
          <div class="member-id">${member.employee_id || ""}</div>
        </div>
      `);
    });
  }

  // Render daily reports table
  function renderDailyReports() {
    const $container = $(".daily-reports-table");
    $container.empty();

    if (projectData.dailyReports.length === 0) {
      $container.html('<tr><td colspan="7" class="no-data">No daily reports found</td></tr>');
      return;
    }

    projectData.dailyReports.forEach((report) => {
      $container.append(`
        <tr>
          <td>${report.employee_id || ""}</td>
          <td>${report.employee_name || ""}</td>
          <td>${report.project_name || ""}</td>
          <td>${report.today_task || ""}</td>
          <td>${report.completed_task || ""}</td>
          <td>${report.completion_percentage || 0}%</td>
          <td>${report.task_link ? `<a href="${report.task_link}" target="_blank">Link</a>` : ""}</td>
        </tr>
      `);
    });
  }

  // Chart/section rendering
  function renderCharts() {
    var html = `
      <div class="analysis-header">
        <h2 class="analysis-title">Project Status Report</h2>
        <select class="filter-select" id="projectFilter">
          <option value="all">All Project</option>
        </select>
      </div>
      <div class="analysis-main">
        <div id="donutChart" class="donut-container"></div>
        <div class="legend-container"></div>
        <div class="team-section">
          <h3 class="team-title">Team Members</h3>
          <div class="team-members-grid"></div>
        </div>
      </div>
      <div class="daily-reports-section">
        <h3 class="reports-title">Daily Reports</h3>
        <div class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Project Name</th>
                <th>Today's Task</th>
                <th>Completed Task</th>
                <th>Complete %</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody class="daily-reports-table"></tbody>
          </table>
        </div>
      </div>
    `;
    $("#projectAnalysis").html(html);

    // Populate project dropdown
    projectData.projects.forEach((project) => {
      $("#projectFilter").append(
        `<option value="${project.id}" data-name="${project.project_name}">${project.project_name}</option>`
      );
    });

    // Donut chart with correct summary
    $("#donutChart").drawDonutChart(projectData.donutData, {
      summaryTitle: "Projects",
      centerValue: projectData.projectTotal,
    });
    $(".donut-summary-number").text(projectData.projectTotal);

    // Legend
    $(".legend-container").empty();
    projectData.donutData.forEach((item) => {
      $(".legend-container").append(
        `<div class="legend-item">
          <div class="legend-color" style="background:${item.color}"></div>
          <span class="legend-label">${item.title}</span>
        </div>`
      );
    });

    // Initial members and reports
    renderTeamMembers();
    renderDailyReports();

    // Dropdown handler for project/team/reports switch
    $("#projectFilter").on("change", async function () {
      const projectId = $(this).val();
      const projectName = $(this).find(':selected').data('name') || null;
      
      $(".team-members-grid").html('<div class="loading-state">Loading team members...</div>');
      $(".daily-reports-table").html('<tr><td colspan="7" class="loading-state">Loading reports...</td></tr>');

      const teamSuccess = await fetchTeamMembers(projectId === "all" ? null : projectId);
      const reportsSuccess = await fetchDailyReports(projectId === "all" ? null : projectName);
      
      if (teamSuccess) {
        renderTeamMembers();
      } else {
        $(".team-members-grid").html('<div class="error-state">Failed to load team members</div>');
      }

      if (reportsSuccess) {
        renderDailyReports();
      } else {
        $(".daily-reports-table").html('<tr><td colspan="7" class="error-state">Failed to load reports</td></tr>');
      }
    });
  }

  // Initialization
  async function initializeProjectAnalysis() {
    $("#projectAnalysis").html('<div class="loading-state">Loading project data...</div>');
    const statusSuccess = await fetchProjectStatusCounts();
    const projectSuccess = await fetchProjectList();
    const teamSuccess = await fetchTeamMembers();
    const reportsSuccess = await fetchDailyReports();
    
    if (statusSuccess && projectSuccess && teamSuccess && reportsSuccess) {
      renderCharts();
    } else {
      $("#projectAnalysis").html(
        `<div class="error-state">
          <p>Failed to load project data</p>
          <button onclick="location.reload()">Retry</button>
        </div>`
      );
    }
  }

  initializeProjectAnalysis();
});

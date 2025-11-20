$(document).ready(function () {
  // Create tooltip containers if missing
  if ($('#barTooltip').length === 0) {
    $('body').append('<div id="barTooltip" class="bar-tooltip"></div>');
  }
  const $barTooltip = $('#barTooltip');

  if ($('#secondFollowupTooltip').length === 0) {
    $('body').append(`
      <div class="pie-tooltip-small" id="secondFollowupTooltip">
        <div class="tooltip-label-small"></div>
        <div class="tooltip-count-small"></div>
      </div>
    `);
  }
  const $pieTooltip = $('#secondFollowupTooltip');

  // Number animation helper
  function animateValue(el, start, end, duration) {
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      el.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Position tooltip near mouse cursor with boundary check
  function positionTooltip(e, tooltip) {
    const w = tooltip.outerWidth();
    const h = tooltip.outerHeight();
    let left = e.pageX - w / 2;
    let top = e.pageY - h - 15;
    if (left < 0) left = 0;
    if (left + w > $(window).width()) left = $(window).width() - w;
    tooltip.css({ left: left + 'px', top: top + 'px' });
  }

  // Bind tooltips for progress bars
  function bindBarTooltipHandlers() {
    $('.clean-bar-fill').off('mouseenter mousemove mouseleave')
      .on('mouseenter', function (e) {
        const $bar = $(this);
        const count = $bar.find('.bar-value').text();
        const parentWidth = $bar.parent().width();
        const barWidth = $bar.width();
        const percent = parentWidth > 0 ? ((barWidth / parentWidth) * 100).toFixed(1) : 0;
        const label = $bar.closest('.clean-status-row').find('.clean-label').text();

        $barTooltip.html(`<strong>${label}</strong><br>Count: ${count}<br>Percentage: ${percent}%`).addClass('show');
        positionTooltip(e, $barTooltip);
      })
      .on('mousemove', (e) => positionTooltip(e, $barTooltip))
      .on('mouseleave', () => $barTooltip.removeClass('show'));
  }

  // Bind tooltips for pie chart slices
  function bindPieTooltipHandlers() {
    $('.pie-slice-small').off('mouseenter mousemove mouseleave')
      .on('mouseenter', function (e) {
        const $slice = $(this);
        const label = $slice.data('label') || '';
        const count = $slice.data('count') || '0';
        const percent = $slice.data('percent') || '0%';

        $pieTooltip.find('.tooltip-label-small').html(`<strong>${label}</strong>`);
        $pieTooltip.find('.tooltip-count-small').text(`${count} (${percent})`);
        $pieTooltip.addClass('show');
        positionTooltip(e, $pieTooltip);
      })
      .on('mousemove', (e) => positionTooltip(e, $pieTooltip))
      .on('mouseleave', () => $pieTooltip.removeClass('show'));
  }

  // Animate progress bars widths and counts
  function animateBars(counts, total, statusMap) {
    for (const selector of Object.values(statusMap)) {
      $(selector).css('width', '0%').find('.bar-value').text('0');
    }
    setTimeout(() => {
      for (const [status, selector] of Object.entries(statusMap)) {
        const count = counts[status] || 0;
        const percent = (count / total) * 100 || 0;
        const $bar = $(selector);
        $bar.css('width', percent + '%');
        animateValue($bar.find('.bar-value')[0], 0, count, 1200);
        $bar[0].style.setProperty('--bar-width', percent + '%');
      }
      bindBarTooltipHandlers();
    }, 100);
  }

  // Fetch and update First Follow-up Status bars
  function updateFirstFollowupStatusBreakdown() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_first_followup_status_breakdown.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (!res.success) {
          console.error('API error:', res.message);
          return;
        }
        const total = res.totalCount || 1;
        const counts = res.counts || {};
        const statusMap = {
          'Not Picking / Not Reachable': '#barNotPicking',
          'Not Interested / Not Needed': '#barNotInterested',
          'Need To Follow Up': '#barNeedFollowup',
          'Follow Up Later': '#barFollowupLater',
          'Not Available': '#barNotAvailable'
        };
        animateBars(counts, total, statusMap);
      },
      error: function (xhr, status, error) {
        console.error('AJAX error:', error);
      }
    });
  }

  // Update Second Follow-up Pie Chart UI with animation and tooltip binding
  function updateSecondFollowupPieChart() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_second_followup_status_breakdown.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (!res.success) {
          console.error('API error:', res.message);
          return;
        }
        const counts = res.counts || {};
        const total = res.total || 1;
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const minDash = 0.01 * circumference;

        const dropCount = counts['Drop'] || 0;
        const followCount = counts['Follow up'] || 0;

        const dropLength = dropCount > 0 ? (dropCount / total) * circumference : minDash;
        const followLength = followCount > 0 ? (followCount / total) * circumference : minDash;

        $('.slice-drop')
          .attr('stroke-dasharray', `${dropLength} ${circumference}`)
          .attr('stroke-dashoffset', 0)
          .data('count', dropCount)
          .data('percent', ((dropCount / total) * 100).toFixed(1) + '%');

        $('.slice-followup')
          .attr('stroke-dasharray', `${followLength} ${circumference}`)
          .attr('stroke-dashoffset', -dropLength)
          .data('count', followCount)
          .data('percent', ((followCount / total) * 100).toFixed(1) + '%');

        const $pieNumber = $('.pie-number-small');
        if ($pieNumber.length) {
          animateValue($pieNumber[0], 0, total, 1500);
        }

        $('.legend-row-small').eq(0).find('.legend-num-small').text(dropCount);
        $('.legend-row-small').eq(1).find('.legend-num-small').text(followCount);

        bindPieTooltipHandlers();
      },
      error: function (xhr, status, error) {
        console.error('AJAX error:', error);
      }
    });
  }

  // Fetch and animate total customers count
  function fetchTotalCustomers() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_total_customers.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          animateValue($('#totalCustomers')[0], 0, res.totalCustomers, 1500);
        } else {
          console.error('Error fetching total customers:', res.message);
        }
      },
      error: function (xhr, status, error) {
        console.error('AJAX error fetching total customers:', error);
      }
    });
  }

  // Fetch and animate first follow-up count
  function fetchFirstFollowupCount() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_first_followup_count.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          animateValue($('#firstFollowup')[0], 0, res.firstFollowup, 1500);
        } else {
          console.error('Error fetching first follow-up count:', res.message);
        }
      },
      error: function (xhr, status, error) {
        console.error('AJAX error fetching first follow-up count:', error);
      }
    });
  }

  // Fetch and animate second follow-up count
  function fetchSecondFollowupCount() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_second_followup_count.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          animateValue($('#secondFollowup')[0], 0, res.secondFollowup, 1500);
        } else {
          console.error('Error fetching second follow-up count:', res.message);
        }
      },
      error: function (xhr, status, error) {
        console.error('AJAX error fetching second follow-up count:', error);
      }
    });
  }

  // Fetch and animate not interested count
  function fetchNotInterestedCount() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_not_interested_count.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          animateValue($('#notInterested')[0], 0, res.notInterested, 1500);
        } else {
          console.error('Error fetching not interested count:', res.message);
        }
      },
      error: function (xhr, status, error) {
        console.error('AJAX error fetching not interested count:', error);
      }
    });
  }

  // Fetch and animate leads count
  function fetchLeadsCount() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_leads_count.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          animateValue($('#leads')[0], 0, res.leads, 1500);
        } else {
          console.error('Error fetching leads count:', res.message);
        }
      },
      error: function (xhr, status, error) {
        console.error('AJAX error fetching leads count:', error);
      }
    });
  }

  // Fetch latest lead status counts and update bars
  function updateLeadStatusBars() {
    $.ajax({
      url: 'https://www.fist-o.com/fisto_finance_app/api/analysis/marketing/get_lead_latest_status_counts.php',
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        if (!res.success) {
          console.error('API error:', res.message);
          return;
        }
        const counts = res.counts || {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const statusMap = {
          'Proposal': '#barProposal',
          'Quotation': '#barQuotation',
          'Drop': '#barDrop',
          'Follow Up': '#barFollowUp',
          'Lead': '#barLead',
        };
        animateBars(counts, total, statusMap);
      },
      error: function (xhr, status, error) {
        console.error('AJAX error fetching lead status counts:', error);
      }
    });
  }

  // Initialize everything
  fetchTotalCustomers();
  fetchFirstFollowupCount();
  fetchSecondFollowupCount();
  fetchNotInterestedCount();
  fetchLeadsCount();
  updateFirstFollowupStatusBreakdown();
  updateSecondFollowupPieChart();
  updateLeadStatusBars();

  bindBarTooltipHandlers();
  bindPieTooltipHandlers();
});

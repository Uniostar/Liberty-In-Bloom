/* ============================================================
   RESULTS PAGE LOGIC
   ============================================================ */

const QUESTION_TEXTS = [
  "Who is credited as the primary author of the Declaration of Independence?",
  "In what year was the Declaration of Independence signed?",
  "Which city was the Declaration of Independence signed in?",
  "What are the three 'unalienable Rights' listed in the Declaration?",
  "How many colonies signed the Declaration of Independence?",
  "Which country did the colonies declare independence from?",
  "What does 'unalienable' mean?",
  "The Declaration begins its famous second paragraph with which words?",
  "Who was the King of Great Britain when the Declaration was signed?",
  "Approximately how many people signed the Declaration of Independence?"
];

const SURVEY_Q_LABELS = [
  "Confidence in American History",
  "Most Inspiring Part of the Declaration",
  "What Makes July 4th Meaningful",
  "Most Admired Founding Father",
  "Knowledge Change After Website Visit"
];

const SURVEY_Q_KEYS = ['q0', 'q1', 'q2', 'q3', 'q4'];

const SURVEY_Q_OPTIONS = [
  ['Very Confident', 'Somewhat Confident', 'Not Very Confident', 'Not Confident At All'],
  ['The Preamble', 'The List of Grievances', 'The Conclusion', 'The Signatures'],
  ['Fireworks & Celebrations', 'Family Traditions', 'Patriotism & Pride', 'Remembering History', 'Freedom & Liberty'],
  ['Thomas Jefferson', 'John Adams', 'Benjamin Franklin', 'George Washington'],
  ['I learned a lot', 'I learned a few new things', 'I already knew most of this', 'No change']
];

/* Chart.js global defaults (guarded in case CDN is unavailable) */
if (typeof Chart !== 'undefined') {
  Chart.defaults.font.family = "'Lato', 'Georgia', sans-serif";
  Chart.defaults.color       = '#4a3728';
}

const CHART_COLORS_DOUGHNUT = [
  '#8b1a1a', '#c9956a', '#d4af37', '#b8d4e8', '#6b8e8b', '#a890e0', '#e8a4b4'
];

const CHART_COLORS_BAR = [
  '#8b1a1a', '#c9956a', '#d4af37', '#2a6b2a'
];

/* ── Demo data (shown when no real data exists) ── */
const DEMO_QUIZ_RESULTS = [
  { score: 9, missedQuestions: [3],       total: 10, timestamp: '2026-04-10T10:00:00Z' },
  { score: 7, missedQuestions: [3, 6],    total: 10, timestamp: '2026-04-11T11:00:00Z' },
  { score: 8, missedQuestions: [3],       total: 10, timestamp: '2026-04-12T12:00:00Z' },
  { score: 10, missedQuestions: [],       total: 10, timestamp: '2026-04-13T09:00:00Z' },
  { score: 6, missedQuestions: [3, 6, 8], total: 10, timestamp: '2026-04-14T14:00:00Z' },
  { score: 9, missedQuestions: [6],       total: 10, timestamp: '2026-04-15T10:00:00Z' },
  { score: 5, missedQuestions: [0,3,6,9], total: 10, timestamp: '2026-04-16T15:00:00Z' },
  { score: 8, missedQuestions: [3],       total: 10, timestamp: '2026-04-17T11:00:00Z' },
];

const DEMO_SURVEY_RESULTS = [
  { responses: { q0: 'Somewhat Confident',   q1: 'The Preamble',           q2: ['Fireworks & Celebrations','Family Traditions'],              q3: 'Thomas Jefferson',   q4: 'I learned a few new things'   }, timestamp: '2026-04-10T10:05:00Z' },
  { responses: { q0: 'Very Confident',        q1: 'The Preamble',           q2: ['Patriotism & Pride','Freedom & Liberty'],                    q3: 'Benjamin Franklin',  q4: 'I learned a lot'               }, timestamp: '2026-04-11T11:05:00Z' },
  { responses: { q0: 'Not Very Confident',    q1: 'The List of Grievances', q2: ['Remembering History'],                                       q3: 'George Washington',  q4: 'I learned a lot'               }, timestamp: '2026-04-12T12:05:00Z' },
  { responses: { q0: 'Somewhat Confident',    q1: 'The Conclusion',         q2: ['Family Traditions','Freedom & Liberty'],                     q3: 'Thomas Jefferson',   q4: 'I learned a few new things'   }, timestamp: '2026-04-13T09:05:00Z' },
  { responses: { q0: 'Very Confident',        q1: 'The Preamble',           q2: ['Fireworks & Celebrations','Patriotism & Pride','Freedom & Liberty'], q3: 'John Adams', q4: 'I already knew most of this' }, timestamp: '2026-04-14T14:05:00Z' },
  { responses: { q0: 'Somewhat Confident',    q1: 'The Signatures',         q2: ['Fireworks & Celebrations','Family Traditions'],              q3: 'Thomas Jefferson',   q4: 'I learned a few new things'   }, timestamp: '2026-04-15T10:05:00Z' },
  { responses: { q0: 'Not Confident At All',  q1: 'The Preamble',           q2: ['Freedom & Liberty'],                                         q3: 'George Washington',  q4: 'I learned a lot'               }, timestamp: '2026-04-16T15:05:00Z' },
];

/* Aggregate survey results from an array (does not read localStorage) */
function computeAgg(results) {
  const agg = {};
  results.forEach(result => {
    const responses = result.responses;
    Object.keys(responses).forEach(qKey => {
      if (!agg[qKey]) agg[qKey] = {};
      const answers = Array.isArray(responses[qKey]) ? responses[qKey] : [responses[qKey]];
      answers.filter(Boolean).forEach(ans => {
        agg[qKey][ans] = (agg[qKey][ans] || 0) + 1;
      });
    });
  });
  return agg;
}

/* Compute most-missed from a results array (does not read localStorage) */
function computeMostMissed(results, questionTexts) {
  if (!results.length) return null;
  const missCounts = new Array(10).fill(0);
  results.forEach(r => {
    (r.missedQuestions || []).forEach(idx => {
      if (idx >= 0 && idx < 10) missCounts[idx]++;
    });
  });
  const maxMisses = Math.max(...missCounts);
  if (maxMisses === 0) return null;
  const maxIdx = missCounts.indexOf(maxMisses);
  return { index: maxIdx, question: questionTexts ? questionTexts[maxIdx] : `Question ${maxIdx + 1}`, missCount: maxMisses, totalAttempts: results.length };
}

/* ── Load & Render All Data ── */
function renderResults() {
  const realQuiz   = getQuizResults();
  const realSurvey = getSurveyResults();
  const usingDemo  = realQuiz.length === 0 && realSurvey.length === 0;

  const quizResults   = usingDemo ? DEMO_QUIZ_RESULTS   : realQuiz;
  const surveyResults = usingDemo ? DEMO_SURVEY_RESULTS : realSurvey;

  const banner = document.getElementById('demo-banner');
  if (banner) banner.style.display = usingDemo ? 'block' : 'none';

  renderStatCards(quizResults, surveyResults);
  renderScoreDistribution(quizResults);
  renderMostMissed(quizResults);
  renderSurveyCharts(surveyResults);
  renderReportText(quizResults, surveyResults);
}

/* ── Stat Cards ── */
function renderStatCards(quizResults, surveyResults) {
  const quizCount = quizResults.length;
  const surveyCount = surveyResults.length;

  document.getElementById('stat-quiz-count').textContent =
    quizCount > 0 ? quizCount : '—';

  if (quizCount > 0) {
    const avg = quizResults.reduce((s, r) => s + r.score, 0) / quizCount;
    const avgPct = Math.round((avg / 10) * 100);
    document.getElementById('stat-avg-score').textContent = avgPct + '%';

    const topScore = Math.max(...quizResults.map(r => r.score));
    document.getElementById('stat-top-score').textContent = topScore + '/10';
  } else {
    document.getElementById('stat-avg-score').textContent = '—';
    document.getElementById('stat-top-score').textContent  = '—';
  }

  document.getElementById('stat-survey-count').textContent =
    surveyCount > 0 ? surveyCount : '—';
}

/* ── Score Distribution Bar Chart ── */
function renderScoreDistribution(quizResults) {
  const area = document.getElementById('quiz-dist-area');

  if (quizResults.length === 0) {
    area.innerHTML = `
      <div class="no-data-msg">
        <p>No quiz data yet. Be the first to take the quiz!</p>
        <a href="quiz.html" class="btn btn-crimson" style="display:inline-flex;">Take the Quiz &rarr;</a>
      </div>`;
    return;
  }

  const buckets = [0, 0, 0, 0];
  quizResults.forEach(r => {
    const s = r.score;
    if      (s <= 3)  buckets[0]++;
    else if (s <= 6)  buckets[1]++;
    else if (s <= 8)  buckets[2]++;
    else              buckets[3]++;
  });

  const canvas = document.getElementById('score-dist-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['0–3\n(Needs Review)', '4–6\n(Good Try)', '7–8\n(Patriot Scholar)', '9–10\n(Founding Father)'],
      datasets: [{
        label: 'Number of Participants',
        data: buckets,
        backgroundColor: CHART_COLORS_BAR,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} participant${ctx.raw !== 1 ? 's' : ''}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#4a3728' },
          grid: { color: 'rgba(201, 149, 106, 0.15)' }
        },
        x: {
          ticks: { color: '#4a3728', font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

/* ── Most Missed Question ── */
function renderMostMissed(quizResults) {
  const area = document.getElementById('missed-q-area');

  if (quizResults.length === 0) {
    area.innerHTML = `<div class="no-data-msg"><p>No quiz data available yet.</p></div>`;
    return;
  }

  const missed = computeMostMissed(quizResults, QUESTION_TEXTS);

  if (!missed) {
    area.innerHTML = `
      <div class="missed-q-card" style="background: rgba(42,107,42,0.08); border-color: #2a6b2a;">
        <div class="missed-q-title" style="color:#2a6b2a;">Everyone Got It Right!</div>
        <div class="missed-q-text">Impressive — no question was missed by all participants!</div>
      </div>`;
    return;
  }

  const pct = Math.round((missed.missCount / missed.totalAttempts) * 100);

  area.innerHTML = `
    <div class="missed-q-card">
      <div class="missed-q-title">&#128293; Most Commonly Missed Question</div>
      <div class="missed-q-text">"${missed.question}"</div>
      <div class="missed-q-pct">
        Missed by <strong>${missed.missCount}</strong> out of <strong>${missed.totalAttempts}</strong>
        participants (<strong>${pct}%</strong>)
      </div>
      <p style="margin-top:0.8rem; font-size:0.85rem; color:var(--text-mid);">
        Consider revisiting the Declaration section on the <a href="index.html#declaration" style="color:var(--crimson); font-weight:700;">Home page</a> to brush up on this topic!
      </p>
    </div>`;
}

/* ── Survey Charts ── */
function renderSurveyCharts(surveyResults) {
  const area = document.getElementById('survey-charts-area');

  if (surveyResults.length === 0) {
    area.innerHTML = `
      <div class="no-data-msg" style="grid-column: 1 / -1;">
        <p>No survey responses yet. Be the first to share your voice!</p>
        <a href="survey.html" class="btn btn-crimson" style="display:inline-flex;">Take the Survey &rarr;</a>
      </div>`;
    return;
  }

  const aggData = computeAgg(surveyResults);
  area.innerHTML = '';

  SURVEY_Q_KEYS.forEach((key, qi) => {
    const options  = SURVEY_Q_OPTIONS[qi];
    const label    = SURVEY_Q_LABELS[qi];
    const qData    = aggData[key] || {};
    const counts   = options.map(opt => {
      const rawOpt = opt.replace(/&amp;/g, '&');
      return qData[opt] || qData[rawOpt] || 0;
    });
    const total    = counts.reduce((a, b) => a + b, 0);

    if (total === 0) return;

    const chartType = (qi === 2) ? 'bar' : 'doughnut';

    const item = document.createElement('div');
    item.classList.add('chart-item');

    const canvasId = `survey-chart-${qi}`;
    item.innerHTML = `
      <div class="chart-item-title">${qi + 1}. ${label}</div>
      <div class="chart-wrapper-sm">
        <canvas id="${canvasId}" aria-label="Chart for: ${label}"></canvas>
      </div>
      <p style="text-align:center; font-size:0.78rem; color:var(--text-mid); margin-top:0.5rem;">
        ${total} response${total !== 1 ? 's' : ''}
      </p>
    `;

    area.appendChild(item);

    requestAnimationFrame(() => {
      const canvas = document.getElementById(canvasId);
      if (!canvas || typeof Chart === 'undefined') return;

      if (chartType === 'doughnut') {
        new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels: options,
            datasets: [{
              data: counts,
              backgroundColor: CHART_COLORS_DOUGHNUT.slice(0, options.length),
              borderWidth: 2,
              borderColor: '#faf8f4',
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, font: { size: 10 }, padding: 8 }
              },
              tooltip: {
                callbacks: {
                  label: ctx => {
                    const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
                    return ` ${ctx.raw} (${pct}%)`;
                  }
                }
              }
            }
          }
        });
      } else {
        new Chart(canvas, {
          type: 'bar',
          data: {
            labels: options.map(o => o.length > 16 ? o.substring(0, 16) + '…' : o),
            datasets: [{
              label: 'Selections',
              data: counts,
              backgroundColor: CHART_COLORS_DOUGHNUT.slice(0, options.length),
              borderRadius: 6,
              borderSkipped: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (items) => options[items[0].dataIndex],
                  label: ctx => ` ${ctx.raw} selection${ctx.raw !== 1 ? 's' : ''}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#4a3728', font: { size: 10 } },
                grid: { color: 'rgba(201, 149, 106, 0.15)' }
              },
              x: {
                ticks: { color: '#4a3728', font: { size: 9 } },
                grid: { display: false }
              }
            }
          }
        });
      }
    });
  });
}

/* ── Report Text ── */
function renderReportText(quizResults, surveyResults) {
  const el = document.getElementById('report-text');

  const quizCount    = quizResults.length;
  const surveyCount  = surveyResults.length;
  const today        = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (quizCount === 0 && surveyCount === 0) {
    el.innerHTML = `<em style="color:var(--text-mid);">No data collected yet. Complete the quiz and survey to generate a report!</em>`;
    return;
  }

  let avgScore = 'N/A';
  let topScore = 'N/A';
  let foundingFatherLevelPct = 0;

  if (quizCount > 0) {
    const avg = quizResults.reduce((s, r) => s + r.score, 0) / quizCount;
    avgScore = (avg / 10 * 100).toFixed(1) + '%';
    topScore = Math.max(...quizResults.map(r => r.score)) + '/10';

    const foundingFatherLevel = quizResults.filter(r => r.score >= 9).length;
    foundingFatherLevelPct = Math.round((foundingFatherLevel / quizCount) * 100);
  }

  let confidentPct  = 0;
  let topSection    = 'The Preamble';
  let topFounder    = 'Thomas Jefferson';
  let learnedPct    = 0;

  if (surveyCount > 0) {
    const agg = computeAgg(surveyResults);

    if (agg.q0) {
      const conf = (agg.q0['Very Confident'] || 0) + (agg.q0['Somewhat Confident'] || 0);
      confidentPct = Math.round((conf / surveyCount) * 100);
    }

    if (agg.q1) {
      const entries = Object.entries(agg.q1);
      if (entries.length) { entries.sort((a, b) => b[1] - a[1]); topSection = entries[0][0]; }
    }

    if (agg.q3) {
      const entries = Object.entries(agg.q3);
      if (entries.length) { entries.sort((a, b) => b[1] - a[1]); topFounder = entries[0][0]; }
    }

    if (agg.q4) {
      const learned = (agg.q4['I learned a lot'] || 0) + (agg.q4['I learned a few new things'] || 0);
      learnedPct = Math.round((learned / surveyCount) * 100);
    }
  }

  el.innerHTML = `
    As of <strong>${today}</strong>, the Liberty in Bloom website has collected data from
    <strong>${quizCount}</strong> quiz participant${quizCount !== 1 ? 's' : ''} and
    <strong>${surveyCount}</strong> survey respondent${surveyCount !== 1 ? 's' : ''} in preparation
    for America&rsquo;s historic 250th birthday celebration on July 4, 2026.

    ${quizCount > 0 ? `
    <br/><br/>
    Among quiz participants, the average score was <strong>${avgScore}</strong>, with the highest
    score achieved being <strong>${topScore}</strong>. Approximately <strong>${foundingFatherLevelPct}%</strong>
    of participants scored at the &ldquo;Founding Father Level&rdquo; (9 or 10 out of 10 correct),
    demonstrating strong engagement with the historical content presented on this site.
    ` : ''}

    ${surveyCount > 0 ? `
    <br/><br/>
    Survey data reveals that <strong>${confidentPct}%</strong> of respondents feel
    &ldquo;Very Confident&rdquo; or &ldquo;Somewhat Confident&rdquo; in their knowledge of American
    history. When asked which section of the Declaration of Independence they find most inspiring,
    the plurality selected <strong>&ldquo;${topSection}&rdquo;</strong>. The most admired Founding
    Father among survey respondents was <strong>${topFounder}</strong>. Encouragingly,
    <strong>${learnedPct}%</strong> of visitors reported learning something new after visiting this
    website, affirming the educational impact of Liberty in Bloom.
    ` : ''}

    <br/><br/>
    These findings underscore the enduring relevance of the Declaration of Independence and the
    importance of civic education as we approach the nation&rsquo;s 250th birthday. Liberty, like
    a flower, must be tended by each generation anew.
  `;
}


/* ── Initialize ── */
document.addEventListener('DOMContentLoaded', async function() {
  await loadFirebaseData();
  renderResults();
});

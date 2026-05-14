/* ============================================================
   SURVEY LOGIC
   ============================================================ */

// Pre-load Firebase data so the post-submit results bars show all submissions
(async () => { await loadFirebaseData(); })();

const SURVEY_QUESTIONS = [
  {
    key: 'q0',
    label: 'Confidence in American History',
    options: ['Very Confident', 'Somewhat Confident', 'Not Very Confident', 'Not Confident At All'],
    type: 'radio'
  },
  {
    key: 'q1',
    label: 'Most Inspiring Part of the Declaration',
    options: ['The Preamble', 'The List of Grievances', 'The Conclusion', 'The Signatures'],
    type: 'radio'
  },
  {
    key: 'q2',
    label: 'What Makes July 4th Meaningful',
    options: ['Fireworks & Celebrations', 'Family Traditions', 'Patriotism & Pride', 'Remembering History', 'Freedom & Liberty'],
    type: 'checkbox'
  },
  {
    key: 'q3',
    label: 'Most Admired Founding Father',
    options: ['Thomas Jefferson', 'John Adams', 'Benjamin Franklin', 'George Washington'],
    type: 'radio'
  },
  {
    key: 'q4',
    label: 'Knowledge Change After Website Visit',
    options: ['I learned a lot', 'I learned a few new things', 'I already knew most of this', 'No change'],
    type: 'radio'
  }
];

const surveyForm      = document.getElementById('survey-form');
const surveyFormArea  = document.getElementById('survey-form-area');
const surveyThankyou  = document.getElementById('survey-thankyou');
const surveyError     = document.getElementById('survey-error');
const bloomEmoji      = document.getElementById('bloom-emoji');
const aggCharts       = document.getElementById('agg-charts');

// Highlight selected options visually
document.querySelectorAll('.survey-option').forEach(option => {
  const input = option.querySelector('input');
  input.addEventListener('change', () => {
    if (input.type === 'radio') {
      const name = input.name;
      document.querySelectorAll(`input[name="${name}"]`).forEach(i => {
        i.closest('.survey-option').classList.remove('selected');
      });
    }
    if (input.checked) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
});

// Update step dots as user fills in questions
function updateStepDots() {
  SURVEY_QUESTIONS.forEach((q, idx) => {
    const dot = document.getElementById(`dot-${idx}`);
    if (!dot) return;
    const answered = isQuestionAnswered(q);
    if (answered) {
      dot.classList.remove('active');
      dot.classList.add('done');
    }
  });
}

function isQuestionAnswered(q) {
  return !!document.querySelector(`input[name="${q.key}"]:checked`);
}

document.querySelectorAll('.survey-options input').forEach(input => {
  input.addEventListener('change', updateStepDots);
});

// Form submit
surveyForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Validate all required fields (radio only — checkboxes are optional)
  const required = SURVEY_QUESTIONS.filter(q => q.type === 'radio');

  for (const q of required) {
    if (!document.querySelector(`input[name="${q.key}"]:checked`)) {
      surveyError.textContent = 'Please answer all questions before submitting.';
      const firstUnanswered = document.querySelector(`input[name="${q.key}"]`);
      if (firstUnanswered) {
        firstUnanswered.closest('.survey-form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
  }

  surveyError.textContent = '';

  const SURVEY_RATE_KEY = 'libertyBloom_lastSurvey';
  if (isRateLimited(SURVEY_RATE_KEY, 24 * 60 * 60 * 1000)) {
    surveyError.textContent = 'You have already submitted a response today. Please come back tomorrow!';
    return;
  }

  // Collect responses
  const responses = {};

  SURVEY_QUESTIONS.forEach(q => {
    if (q.type === 'radio') {
      const checked = document.querySelector(`input[name="${q.key}"]:checked`);
      responses[q.key] = checked ? checked.value : null;
    } else {
      const checked = Array.from(document.querySelectorAll(`input[name="${q.key}"]:checked`));
      responses[q.key] = checked.map(c => c.value);
    }
  });

  // Save to Firestore (or localStorage fallback)
  saveSurveyResult(responses);
  markSubmission(SURVEY_RATE_KEY);
  // Reload all submissions so the live results bars reflect this new entry
  await loadFirebaseData();

  // Show thank you
  surveyFormArea.classList.add('hidden');
  surveyThankyou.classList.add('show');

  // Trigger bloom animation
  setTimeout(() => {
    bloomEmoji.style.opacity = '0';
    void bloomEmoji.offsetWidth;
    bloomEmoji.style.animation = 'none';
    void bloomEmoji.offsetWidth;
    bloomEmoji.style.animation = 'bloomSpin 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
  }, 100);

  // Render aggregated results
  renderAggregatedResults();

  // Scroll to top of thank you
  surveyThankyou.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function renderAggregatedResults() {
  const allData = getAggregateSurveyData();
  const totalResponses = getSurveyResults().length;

  if (totalResponses === 0) {
    aggCharts.innerHTML = '<p style="color:var(--text-mid); text-align:center; font-style:italic;">No data yet — you might be the first!</p>';
    return;
  }

  aggCharts.innerHTML = '';

  SURVEY_QUESTIONS.forEach(q => {
    const qData = allData[q.key] || {};
    if (Object.keys(qData).length === 0) return;

    const block = document.createElement('div');
    block.classList.add('agg-question-block');

    const label = document.createElement('div');
    label.classList.add('agg-q-label');
    label.textContent = q.label;
    block.appendChild(label);

    const maxCount = Math.max(...Object.values(qData), 1);

    q.options.forEach(option => {
      const rawOption = option.replace(/&amp;/g, '&');
      const count = qData[rawOption] || qData[option] || 0;
      const pct   = Math.round((count / totalResponses) * 100);

      const item = document.createElement('div');
      item.classList.add('agg-bar-item');

      item.innerHTML = `
        <div class="agg-bar-label">${option}</div>
        <div class="agg-bar-track">
          <div class="agg-bar-fill" style="width: 0%;" data-target="${pct}%"></div>
        </div>
        <div class="agg-bar-count">${count}</div>
      `;

      block.appendChild(item);
    });

    aggCharts.appendChild(block);
  });

  // Animate bars after render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.agg-bar-fill[data-target]').forEach(bar => {
        bar.style.width = bar.dataset.target;
      });
    });
  });
}

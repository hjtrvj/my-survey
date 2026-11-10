/*
  수정할 때는 아래 CONFIG와 QUESTIONS를 먼저 바꾸면 됩니다.
  응답을 Google Sheets로 받으려면 APPS_SCRIPT_URL에 배포 URL을 붙여넣으세요.
*/

const CONFIG = {
  // Google Apps Script 웹 앱 배포 URL. 비워 두면 이 기기에서 결과를 복사하는 방식으로 동작합니다.
  APPS_SCRIPT_URL: "",
  // '오늘' 대신 다른 표현으로 바꾸고 싶으면 이 문구를 수정하세요.
  introTitle: "잠깐만 도와줄래? 🎀",
  introText: "간단한 질문 몇 개만!<br>너무 고민하지 말고 마음 가는 대로 골라줘 ㅎㅎ",
  dodgeLimit: 3 // 세 번 도망간 뒤에는 '오늘은 어려워'도 선택할 수 있습니다.
};

const QUESTIONS = {
  dessert: {
    eyebrow: "QUESTION 01",
    title: "요즘 가장 당기는 디저트는?",
    subtitle: "요즘 취향 기준으로 골라줘!",
    options: ["🍓 과일이 들어간 상큼한 맛", "🍫 초콜릿처럼 진하고 달달한 맛", "🧀 치즈처럼 꾸덕하고 고소한 맛", "🍦 부드럽고 가벼운 맛", "🤍 딱히 가리는 건 없어"]
  },
  texture: {
    eyebrow: "QUESTION 02",
    title: "둘 중 더 끌리는 쪽은?",
    subtitle: "그냥 취향대로 골라 보면 돼.",
    options: ["과일이 듬뿍 들어간 쪽 🍓", "크림이 부드럽고 풍부한 쪽 ☁️", "초콜릿이나 장식이 포인트인 쪽 🍫", "둘 다 좋아!"]
  },
  time: {
    eyebrow: "QUESTION 03",
    title: "오늘 잠깐 시간이 생긴다면?",
    subtitle: "가능한 시간대를 골라줘. 어려우면 마지막 선택지도 괜찮아!",
    options: ["오후 5시 이전", "오후 5시~6시", "오후 6시~7시", "오후 7시 이후"]
  }
};

const state = { step: 0, answers: { dessert: "", texture: "", time: "", note: "" }, dodgeCount: 0 };
const app = document.getElementById("app");
const progressBar = document.getElementById("progressBar");

function setProgress(step) {
  const widths = ["0%", "25%", "50%", "75%", "100%"];
  progressBar.style.width = widths[Math.min(step, 4)];
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function renderIntro() {
  setProgress(0);
  app.innerHTML = `
    <div class="emoji">✉️</div>
    <div class="eyebrow">A LITTLE SURVEY</div>
    <h1>${CONFIG.introTitle}</h1>
    <p class="subtitle">${CONFIG.introText}</p>
    <button class="primary" id="startBtn">시작하기 <span aria-hidden="true">→</span></button>
  `;
  document.getElementById("startBtn").addEventListener("click", () => { state.step = 1; renderQuestion("dessert"); });
}
function renderQuestion(key) {
  const q = QUESTIONS[key];
  const selected = state.answers[key];
  setProgress(state.step);
  app.innerHTML = `
    <div class="eyebrow">${q.eyebrow}</div>
    <h1>${q.title}</h1>
    <p class="subtitle">${q.subtitle}</p>
    <div class="choices">${q.options.map((o, i) => `
      <button class="choice ${selected === o ? "selected" : ""}" data-value="${escapeHtml(o)}">${o}</button>
    `).join("")}</div>
    <div class="actions"><button class="secondary" id="backBtn">이전</button><button class="primary" id="nextBtn" ${selected ? "" : "disabled"}>다음 →</button></div>
  `;
  app.querySelectorAll(".choice").forEach(btn => btn.addEventListener("click", () => {
    state.answers[key] = btn.dataset.value;
    renderQuestion(key);
  }));
  document.getElementById("backBtn").addEventListener("click", () => {
    if (key === "dessert") renderIntro();
    else if (key === "texture") { state.step = 1; renderQuestion("dessert"); }
    else { state.step = 2; renderQuestion("texture"); }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!state.answers[key]) return;
    if (key === "dessert") { state.step = 2; renderQuestion("texture"); }
    else if (key === "texture") { state.step = 3; renderTime(); }
    else { state.step = 4; renderNote(); }
  });
}
function renderTime() {
  setProgress(3);
  app.innerHTML = `
    <div class="eyebrow">${QUESTIONS.time.eyebrow}</div>
    <h1>${QUESTIONS.time.title}</h1>
    <p class="subtitle">${QUESTIONS.time.subtitle}</p>
    <div class="time-wrap">
      <div class="choices" id="timeChoices">
        ${QUESTIONS.time.options.map(o => `<button class="choice" data-time="${escapeHtml(o)}">${o}</button>`).join("")}
        <button class="choice dodge" id="dodgeBtn">오늘은 못 만날 것 같아 🥺</button>
      </div>
      <p class="dodge-note" id="dodgeNote">마지막 선택지도 편하게 골라도 돼 :)</p>
    </div>
    <div class="actions"><button class="secondary" id="backBtn">이전</button></div>
  `;
  app.querySelectorAll("[data-time]").forEach(btn => btn.addEventListener("click", () => {
    state.answers.time = btn.dataset.time; state.step = 4; renderNote();
  }));
  document.getElementById("backBtn").addEventListener("click", () => { state.step = 2; renderQuestion("texture"); });
  const dodge = document.getElementById("dodgeBtn");
  dodge.addEventListener("pointerenter", moveDodge);
  dodge.addEventListener("touchstart", moveDodge, { passive: true });
  dodge.addEventListener("click", () => {
    // 도망 기능은 장난 요소이며, 몇 번 뒤에는 실제 선택이 가능하도록 합니다.
    if (state.dodgeCount < CONFIG.dodgeLimit) {
      moveDodge();
    } else {
      state.answers.time = "오늘은 만나기 어려워";
      state.step = 4; renderNote();
    }
  });
}
function moveDodge() {
  const btn = document.getElementById("dodgeBtn");
  const note = document.getElementById("dodgeNote");
  if (!btn || state.dodgeCount >= CONFIG.dodgeLimit) return;
  state.dodgeCount += 1;
  // 버튼이 화면 밖으로 나가지 않도록 작게 좌우로 이동합니다.
  const x = state.dodgeCount % 2 ? 42 : -42;
  const y = state.dodgeCount % 2 ? 5 : -5;
  btn.style.transform = `translate(${x}px, ${y}px)`;
  if (note) note.textContent = ["앗, 잡기 쉽지 않네ㅋㅋ", "한 번 더 도망갔어! 😳", "이제는 선택할 수 있어. 편하게 골라줘!"][state.dodgeCount - 1];
  if (state.dodgeCount >= CONFIG.dodgeLimit) {
    btn.style.transform = "none";
    btn.style.borderStyle = "solid";
    btn.style.borderColor = "#e99ab5";
    btn.style.background = "#fff1f6";
    btn.style.color = "#b85f82";
    btn.textContent = "오늘은 만나기 어려워";
    if (note) note.textContent = "이제 이 선택지도 누를 수 있어!";
  }
}
function renderNote() {
  setProgress(4);
  app.innerHTML = `
    <div class="emoji">💌</div>
    <div class="eyebrow">ONE LAST THING</div>
    <h1>마지막으로 하나만!</h1>
    <p class="subtitle">요즘 먹고 싶은 거나 하고 싶은 말 있으면 적어줘. (선택사항)</p>
    <textarea id="noteInput" placeholder="편하게 적어줘 ㅎㅎ">${escapeHtml(state.answers.note)}</textarea>
    <p class="hint">안 적고 넘어가도 괜찮아.</p>
    <div class="actions"><button class="secondary" id="backBtn">이전</button><button class="primary" id="submitBtn">답변 보내기 ♡</button></div>
  `;
  document.getElementById("noteInput").addEventListener("input", e => state.answers.note = e.target.value);
  document.getElementById("backBtn").addEventListener("click", () => { state.step = 3; renderTime(); });
  document.getElementById("submitBtn").addEventListener("click", submitAnswers);
}
function makeSummary() {
  return [
    "새로운 취향 조사 응답",
    `디저트 취향: ${state.answers.dessert}`,
    `선호하는 스타일: ${state.answers.texture}`,
    `오늘 가능한 시간: ${state.answers.time}`,
    `추가 답변: ${state.answers.note || "(없음)"}`
  ].join("\n");
}
async function submitAnswers() {
  const summary = makeSummary();
  if (CONFIG.APPS_SCRIPT_URL.trim()) {
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state.answers, submittedAt: new Date().toISOString() })
      });
      renderDone("답변을 보냈어! 고마워 ㅎㅎ", "응답이 접수되도록 요청했어.");
    } catch (err) {
      renderDone("답해줘서 고마워 ㅎㅎ", "전송에 실패했을 수 있어. 아래 버튼으로 답변을 복사해 줘!", summary);
    }
  } else {
    renderDone("답해줘서 고마워 ㅎㅎ", "답변 전송 주소가 아직 설정되지 않았어. 테스트할 때는 아래에서 복사할 수 있어!", summary);
  }
}
function renderDone(title, desc, summary = "") {
  setProgress(4);
  app.innerHTML = `
    <div class="emoji">🌷</div>
    <div class="eyebrow">ALL DONE</div>
    <h1>${title}</h1>
    <p class="subtitle">${desc}</p>
    ${summary ? `<div class="summary">${escapeHtml(summary)}</div><div class="actions"><button class="primary" id="copyBtn">내 답변 복사하기</button></div>` : ""}
    <p class="hint">참여해 줘서 고마워. 오늘도 좋은 하루 보내!</p>
  `;
  const copy = document.getElementById("copyBtn");
  if (copy) copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(summary); copy.textContent = "복사했어!"; }
    catch { copy.textContent = "복사할 수 없어. 화면의 답변을 길게 눌러 복사해 줘."; }
  });
}
renderIntro();

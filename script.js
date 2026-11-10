/*
  수정할 때는 아래 CONFIG와 QUESTIONS를 먼저 바꾸면 됩니다.
  응답을 Google Sheets로 받으려면 APPS_SCRIPT_URL에 배포 URL을 붙여넣으세요.
*/

const CONFIG = {
  // Google Apps Script 웹 앱 배포 URL. 비워 두면 이 기기에서 결과를 복사하는 방식으로 동작합니다.
  APPS_SCRIPT_URL: "",
  // '오늘' 대신 다른 표현으로 바꾸고 싶으면 이 문구를 수정하세요.
  introTitle: "너에 대해 알아보는 중...! 🍓",
  introText: "잠깐만! 질문 몇 개만 대답해 줘 ㅎㅎ<br>별거 아니니까 부담 갖지 말고! ♡",
  dodgeLimit: 3 // 비밀 동작: 세 번 이동한 뒤 네 번째 클릭에 선택됩니다.
};

const QUESTIONS = {
  dessert: {
    eyebrow: "QUESTION 01",
    title: "갑자기 궁금한데, 너는 어떤 디저트가 제일 좋아?",
    subtitle: "요즘 취향 기준으로 골라줘!",
    options: ["🍰 생크림 케이크", "🍫 초코 케이크", "🧀 치즈 케이크", "🍓 과일 케이크", "🤍 사실 다 좋아!"]
  },
  texture: {
    eyebrow: "QUESTION 02",
    title: "그럼 달달한 거 중에서는?",
    subtitle: "그냥 취향대로 골라 보면 돼.",
    options: ["많이 달달한 맛 🍭", "적당히 달콤한 맛 ♡", "상큼한 과일 맛 🍋", "꾸덕하고 진한 맛 🍫"]
  },
  time: {
    eyebrow: "QUESTION 03",
    title: "오늘 혹시 잠깐 시간 있어?",
    subtitle: "가능한 시간대를 하나 골라줘!",
    options: ["오후 7시 ~ 8시 🌷", "오후 8시 ~ 9시 🍰", "오후 9시 ~ 9시 30분 🌙"]
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
    <div class="eyebrow">A LITTLE SECRET PROJECT ♡</div>
    <img class="hero-image" src="assets/cake-hero.png" alt="귀여운 딸기 생크림 케이크">
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
    <div class="emoji">⏰</div>
    <div class="eyebrow">${QUESTIONS.time.eyebrow}</div>
    <h1>${QUESTIONS.time.title}</h1>
    <p class="subtitle">${QUESTIONS.time.subtitle}</p>
    <div class="time-wrap">
      <div class="choices" id="timeChoices">
        ${QUESTIONS.time.options.map(o => `<button class="choice" data-time="${escapeHtml(o)}">${o}</button>`).join("")}
        <button class="choice dodge" id="dodgeBtn" type="button">오늘은 어려워 🥹</button>
      </div>
    </div>
    <div class="actions"><button class="secondary" id="backBtn">이전</button></div>
  `;
  app.querySelectorAll("[data-time]").forEach(btn => btn.addEventListener("click", () => {
    state.answers.time = btn.dataset.time;
    state.step = 4;
    renderReaction();
  }));
  document.getElementById("backBtn").addEventListener("click", () => { state.step = 2; renderQuestion("texture"); });
  document.getElementById("dodgeBtn").addEventListener("click", handleDodgeClick);
}
function handleDodgeClick() {
  const btn = document.getElementById("dodgeBtn");
  if (!btn) return;
  if (state.dodgeCount < CONFIG.dodgeLimit) {
    state.dodgeCount += 1;
    const positions = ["translate(48px, -9px)", "translate(-38px, 13px)", "translate(30px, 7px)"];
    btn.style.transform = positions[state.dodgeCount - 1];
    return;
  }
  state.answers.time = "오늘은 만나기 어려워";
  state.step = 4;
  renderNote();
}
function renderReaction() {
  setProgress(3);
  app.innerHTML = `
    <div class="reaction-screen">
      <div class="reaction-emoji">🥹</div>
      <div class="eyebrow">WAIT A SECOND</div>
      <h1>잠시만.. 좋다고?? 😭</h1>
      <p class="subtitle">난 네가 싫다고 할 줄 알았어 ...</p>
      <button class="primary reaction-button" id="reactionNext">응응응</button>
    </div>
  `;
  document.getElementById("reactionNext").addEventListener("click", () => {
    state.step = 4;
    renderNote();
  });
}
function renderNote() {
  setProgress(4);
  app.innerHTML = `
    <div class="emoji">🎀</div>
    <div class="eyebrow">ONE LAST QUESTION</div>
    <h1>마지막으로 하나만 더!</h1>
    <p class="subtitle">요즘 먹고 싶은 거 있어? 아니면 생각나는 거 아무거나! (선택사항)</p>
    <textarea id="noteInput" placeholder="예) 딸기 케이크가 먹고 싶어! ㅎㅎ">${escapeHtml(state.answers.note)}</textarea>
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

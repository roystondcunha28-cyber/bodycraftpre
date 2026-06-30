document.getElementById('year').textContent = new Date().getFullYear();

/* ============ NAV ============ */
const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');
burger.addEventListener('click', () => navMobile.classList.toggle('open'));
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMobile.classList.remove('open')));

/* ============================================
   1. DIET CALCULATOR
   ============================================ */
const calcForm = document.getElementById('calcForm');
const calcResult = document.getElementById('calcResult');

calcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(calcForm);
  const gender = fd.get('gender');
  const age = +fd.get('age');
  const height = +fd.get('height');
  const weight = +fd.get('weight');
  const activity = +fd.get('activity');
  const goal = fd.get('goal');

  // Mifflin-St Jeor BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
  let tdee = bmr * activity;

  let target = tdee;
  if (goal === 'lose') target = tdee - 500;
  if (goal === 'gain') target = tdee + 350;

  // Macro split by goal
  let proteinPerKg = goal === 'gain' ? 2.0 : goal === 'lose' ? 2.2 : 1.8;
  let proteinG = proteinPerKg * weight;
  let proteinKcal = proteinG * 4;

  let fatKcal = target * (goal === 'lose' ? 0.25 : 0.28);
  let fatG = fatKcal / 9;

  let carbKcal = target - proteinKcal - fatKcal;
  let carbG = Math.max(carbKcal, 0) / 4;

  const proteinPct = Math.round((proteinKcal / target) * 100);
  const fatPct = Math.round((fatKcal / target) * 100);
  const carbPct = Math.max(0, 100 - proteinPct - fatPct);

  const water = (weight * 0.035).toFixed(1);
  const fiber = goal === 'lose' ? 32 : 28;

  calcResult.innerHTML = `
    <div class="result__kcal">
      <div class="num">${Math.round(target)}</div>
      <div class="lbl">kcal / day · ${goal === 'lose' ? 'Fat Loss' : goal === 'gain' ? 'Muscle Gain' : 'Maintenance'}</div>
    </div>
    <div class="result__macros">
      <div class="macro protein">
        <div class="bar"><i style="width:${proteinPct}%"></i></div>
        <div class="g">${Math.round(proteinG)}g</div>
        <div class="label">Protein · ${proteinPct}%</div>
      </div>
      <div class="macro carb">
        <div class="bar"><i style="width:${carbPct}%"></i></div>
        <div class="g">${Math.round(carbG)}g</div>
        <div class="label">Carbs · ${carbPct}%</div>
      </div>
      <div class="macro fat">
        <div class="bar"><i style="width:${fatPct}%"></i></div>
        <div class="g">${Math.round(fatG)}g</div>
        <div class="label">Fat · ${fatPct}%</div>
      </div>
    </div>
    <div class="result__extra">
      <span>BMR: <strong>${Math.round(bmr)} kcal</strong></span>
      <span>TDEE: <strong>${Math.round(tdee)} kcal</strong></span>
    </div>
    <div class="result__extra" style="margin-top:.6rem;">
      <span>Water target: <strong>${water} L</strong></span>
      <span>Fibre target: <strong>${fiber} g</strong></span>
    </div>
    <p class="result__note">Calculated via Mifflin–St Jeor BMR × activity multiplier. This is a personal estimate — Mr. Prashanth can fine-tune it during your in-person assessment at Body Craft.</p>
  `;
});
calcForm.dispatchEvent(new Event('submit'));

/* ============================================
   2. FOOD DATABASE
   ============================================ */
const FOODS = [
  {n:"Steamed Rice (Boiled)", cat:"Rice", kcal:130, p:2.7, c:28, f:0.3, fib:0.4, sug:0.1, na:1, k:35, ca:10, fe:0.8, va:0, vc:0, vd:0, b12:0, serving:"100g cooked"},
  {n:"Red/Matta Rice", cat:"Rice", kcal:124, p:2.6, c:26.5, f:0.5, fib:1.4, sug:0.1, na:2, k:78, ca:8, fe:1.0, va:0, vc:0, vd:0, b12:0, serving:"100g cooked"},
  {n:"Ragi (Finger Millet)", cat:"Millets", kcal:336, p:7.3, c:72, f:1.3, fib:11.5, sug:0, na:11, k:408, ca:344, fe:3.9, va:0, vc:0, vd:0, b12:0, serving:"100g raw flour"},
  {n:"Jowar (Sorghum)", cat:"Millets", kcal:349, p:10.4, c:72.6, f:1.9, fib:6.3, sug:0, na:7, k:363, ca:25, fe:4.1, va:0, vc:0, vd:0, b12:0, serving:"100g raw"},
  {n:"Bajra (Pearl Millet)", cat:"Millets", kcal:361, p:11.6, c:67, f:5, fib:8.5, sug:0, na:10, k:307, ca:42, fe:8, va:0, vc:0, vd:0, b12:0, serving:"100g raw"},
  {n:"Toor Dal (cooked)", cat:"Protein Sources", kcal:121, p:7.3, c:20, f:0.6, fib:5, sug:0.5, na:5, k:201, ca:18, fe:1.4, va:1, vc:0, vd:0, b12:0, serving:"100g cooked"},
  {n:"Moong Dal (cooked)", cat:"Protein Sources", kcal:105, p:7.0, c:19, f:0.4, fib:5.2, sug:0.5, na:3, k:266, ca:21, fe:1.3, va:2, vc:1, vd:0, b12:0, serving:"100g cooked"},
  {n:"Rajma (Kidney Beans, cooked)", cat:"Protein Sources", kcal:127, p:8.7, c:22.8, f:0.5, fib:6.4, sug:0.3, na:2, k:405, ca:35, fe:2.2, va:0, vc:1, vd:0, b12:0, serving:"100g cooked"},
  {n:"Chickpeas / Chana (cooked)", cat:"Protein Sources", kcal:164, p:8.9, c:27.4, f:2.6, fib:7.6, sug:4.8, na:7, k:291, ca:49, fe:2.9, va:1, vc:1.3, vd:0, b12:0, serving:"100g cooked"},
  {n:"Paneer", cat:"Dairy", kcal:265, p:18.3, c:1.2, f:20.8, fib:0, sug:1.2, na:18, k:120, ca:208, fe:0.2, va:144, vc:0, vd:0, b12:0.4, serving:"100g"},
  {n:"Curd / Dahi (whole milk)", cat:"Dairy", kcal:60, p:3.5, c:4.7, f:3.3, fib:0, sug:4.7, na:36, k:155, ca:121, fe:0.1, va:27, vc:0.5, vd:0, b12:0.4, serving:"100g"},
  {n:"Milk (toned, 3% fat)", cat:"Dairy", kcal:58, p:3.2, c:4.8, f:3, fib:0, sug:4.8, na:44, k:150, ca:113, fe:0, va:32, vc:0.9, vd:0.05, b12:0.45, serving:"100ml"},
  {n:"Whey Protein (generic)", cat:"Protein Sources", kcal:113, p:24, c:2.5, f:1.3, fib:0, sug:2, na:50, k:170, ca:120, fe:0.2, va:0, vc:0, vd:0, b12:0.3, serving:"30g scoop"},
  {n:"Boiled Egg (whole)", cat:"Eggs", kcal:78, p:6.3, c:0.6, f:5.3, fib:0, sug:0.6, na:62, k:63, ca:25, fe:0.6, va:74, vc:0, vd:0.5, b12:0.6, serving:"1 large egg (50g)"},
  {n:"Egg White (raw)", cat:"Eggs", kcal:17, p:3.6, c:0.2, f:0.06, fib:0, sug:0.2, na:55, k:54, ca:2, fe:0, va:0, vc:0, vd:0, b12:0.04, serving:"1 egg white (33g)"},
  {n:"Chicken Breast (skinless, cooked)", cat:"Chicken", kcal:165, p:31, c:0, f:3.6, fib:0, sug:0, na:74, k:256, ca:15, fe:1, va:6, vc:0, vd:0.1, b12:0.3, serving:"100g"},
  {n:"Chicken Thigh (skinless, cooked)", cat:"Chicken", kcal:209, p:26, c:0, f:10.9, fib:0, sug:0, na:90, k:240, ca:12, fe:1.3, va:9, vc:0, vd:0.1, b12:0.4, serving:"100g"},
  {n:"Mackerel / Bangude (fried)", cat:"Seafood", kcal:205, p:23, c:0, f:12, fib:0, sug:0, na:90, k:314, ca:12, fe:1.6, va:50, vc:0, vd:13.8, b12:8.7, serving:"100g"},
  {n:"Prawns (Sungta, cooked)", cat:"Seafood", kcal:99, p:24, c:0.2, f:0.3, fib:0, sug:0, na:111, k:259, ca:70, fe:0.5, va:25, vc:0, vd:0, b12:1.5, serving:"100g"},
  {n:"Sardines (Bhutai, cooked)", cat:"Seafood", kcal:208, p:24.6, c:0, f:11.5, fib:0, sug:0, na:100, k:397, ca:382, fe:2.9, va:32, vc:0, vd:4.8, b12:8.9, serving:"100g"},
  {n:"Tuna (canned in water)", cat:"Seafood", kcal:116, p:25.5, c:0, f:0.8, fib:0, sug:0, na:247, k:237, ca:11, fe:1.3, va:17, vc:0, vd:1, b12:2.2, serving:"100g"},
  {n:"Banana", cat:"Fruits", kcal:89, p:1.1, c:22.8, f:0.3, fib:2.6, sug:12.2, na:1, k:358, ca:5, fe:0.3, va:3, vc:8.7, vd:0, b12:0, serving:"1 medium (100g)"},
  {n:"Apple", cat:"Fruits", kcal:52, p:0.3, c:13.8, f:0.2, fib:2.4, sug:10.4, na:1, k:107, ca:6, fe:0.1, va:3, vc:4.6, vd:0, b12:0, serving:"1 medium (100g)"},
  {n:"Papaya", cat:"Fruits", kcal:43, p:0.5, c:10.8, f:0.3, fib:1.7, sug:7.8, na:8, k:182, ca:20, fe:0.3, va:47, vc:60.9, vd:0, b12:0, serving:"100g"},
  {n:"Watermelon", cat:"Fruits", kcal:30, p:0.6, c:7.6, f:0.2, fib:0.4, sug:6.2, na:1, k:112, ca:7, fe:0.2, va:28, vc:8.1, vd:0, b12:0, serving:"100g"},
  {n:"Pomegranate", cat:"Fruits", kcal:83, p:1.7, c:18.7, f:1.2, fib:4, sug:13.7, na:3, k:236, ca:10, fe:0.3, va:0, vc:10.2, vd:0, b12:0, serving:"100g"},
  {n:"Spinach / Palak (cooked)", cat:"Vegetables", kcal:23, p:2.9, c:3.6, f:0.4, fib:2.2, sug:0.4, na:79, k:466, ca:99, fe:2.7, va:469, vc:9.8, vd:0, b12:0, serving:"100g"},
  {n:"Sweet Potato (boiled)", cat:"Vegetables", kcal:86, p:1.6, c:20.1, f:0.1, fib:3, sug:4.2, na:6, k:230, ca:30, fe:0.6, va:709, vc:2.4, vd:0, b12:0, serving:"100g"},
  {n:"Broccoli (cooked)", cat:"Vegetables", kcal:35, p:2.4, c:7.2, f:0.4, fib:3.3, sug:1.4, na:41, k:293, ca:40, fe:0.7, va:31, vc:64.9, vd:0, b12:0, serving:"100g"},
  {n:"Potato (boiled)", cat:"Vegetables", kcal:87, p:1.9, c:20.1, f:0.1, fib:1.8, sug:0.9, na:6, k:379, ca:8, fe:0.3, va:0, vc:13, vd:0, b12:0, serving:"100g"},
  {n:"Tomato", cat:"Vegetables", kcal:18, p:0.9, c:3.9, f:0.2, fib:1.2, sug:2.6, na:5, k:237, ca:10, fe:0.3, va:42, vc:13.7, vd:0, b12:0, serving:"100g"},
  {n:"Sambar (typical)", cat:"Indian Foods", kcal:78, p:3.5, c:11, f:2.4, fib:2.7, sug:2.1, na:320, k:210, ca:30, fe:1.1, va:60, vc:5, vd:0, b12:0, serving:"1 cup (200ml)"},
  {n:"Idli (steamed)", cat:"Indian Foods", kcal:58, p:2, c:12, f:0.2, fib:0.5, sug:0.1, na:178, k:30, ca:9, fe:0.4, va:0, vc:0, vd:0, b12:0, serving:"1 piece (~40g)"},
  {n:"Dosa (plain)", cat:"Indian Foods", kcal:133, p:3.2, c:18.5, f:5, fib:0.6, sug:0.2, na:230, k:46, ca:14, fe:0.7, va:0, vc:0, vd:0, b12:0, serving:"1 medium"},
  {n:"Roti / Chapati (wheat)", cat:"Indian Foods", kcal:120, p:3.1, c:18, f:3.7, fib:2.2, sug:0.5, na:130, k:75, ca:10, fe:1.1, va:0, vc:0, vd:0, b12:0, serving:"1 medium (40g)"},
  {n:"Curd Rice", cat:"Indian Foods", kcal:158, p:4.2, c:25, f:4.2, fib:0.6, sug:3, na:90, k:140, ca:80, fe:0.5, va:25, vc:0, vd:0, b12:0.1, serving:"1 cup (200g)"},
  {n:"Almonds", cat:"Protein Sources", kcal:579, p:21.2, c:21.6, f:49.9, fib:12.5, sug:4.4, na:1, k:733, ca:269, fe:3.7, va:0, vc:0, vd:0, b12:0, serving:"100g"},
  {n:"Peanuts (roasted)", cat:"Protein Sources", kcal:567, p:25.8, c:16.1, f:49.2, fib:8.5, sug:4.7, na:18, k:705, ca:92, fe:4.6, va:0, vc:0, vd:0, b12:0, serving:"100g"},
];

const grid = document.getElementById('foodGrid');
const empty = document.getElementById('foodEmpty');
const search = document.getElementById('foodSearch');
const filterBar = document.getElementById('foodFilters');
const cats = ["All", ...new Set(FOODS.map(f => f.cat))];
let activeCat = "All";

filterBar.innerHTML = cats.map(c => `<span class="chip ${c==='All'?'active':''}" data-cat="${c}">${c}</span>`).join('');
filterBar.addEventListener('click', e => {
  if (!e.target.classList.contains('chip')) return;
  filterBar.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');
  activeCat = e.target.dataset.cat;
  renderFoods();
});
search.addEventListener('input', renderFoods);

function renderFoods() {
  const q = search.value.trim().toLowerCase();
  const list = FOODS.filter(f =>
    (activeCat === 'All' || f.cat === activeCat) &&
    (q === '' || f.n.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q))
  );
  empty.hidden = list.length !== 0;
  grid.innerHTML = list.map((f, i) => `
    <div class="food-card" id="fc-${i}">
      <div class="food-card__top">
        <div>
          <div class="food-card__name">${f.n}</div>
          <div class="food-card__cat">${f.cat}</div>
        </div>
        <div class="food-card__kcal"><b>${f.kcal}</b><span>kcal / ${f.serving}</span></div>
      </div>
      <div class="food-card__macros">
        <span>P <b>${f.p}g</b></span><span>C <b>${f.c}g</b></span><span>F <b>${f.f}g</b></span><span>Fibre <b>${f.fib}g</b></span>
      </div>
      <div class="food-card__toggle" onclick="document.getElementById('fc-${i}').classList.toggle('open')">View full nutrient panel ▾</div>
      <div class="food-card__more">
        Sugar: ${f.sug}g · Sodium: ${f.na}mg · Potassium: ${f.k}mg · Calcium: ${f.ca}mg · Iron: ${f.fe}mg<br>
        Vitamin A: ${f.va}µg · Vitamin C: ${f.vc}mg · Vitamin D: ${f.vd}µg · Vitamin B12: ${f.b12}µg
      </div>
    </div>
  `).join('');
}
renderFoods();

/* ============================================
   3. PROGRESS TRACKING (localStorage + canvas charts)
   ============================================ */
const LOG_KEY = 'bc_logs';
const getLogs = () => JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
const setLogs = (l) => localStorage.setItem(LOG_KEY, JSON.stringify(l));

document.getElementById('logForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const habits = fd.getAll('habit');
  const entry = {
    date: new Date().toISOString().slice(0,10),
    weight: +fd.get('weight') || null,
    waist: +fd.get('waist') || null,
    calIn: +fd.get('calIn') || null,
    calOut: +fd.get('calOut') || null,
    water: +fd.get('water') || null,
    sleep: +fd.get('sleep') || null,
    habits
  };
  const logs = getLogs();
  logs.push(entry);
  setLogs(logs);
  e.target.reset();
  renderProgress();
});

document.getElementById('clearLogs').addEventListener('click', () => {
  if (confirm('Clear all saved progress data from this browser?')) {
    localStorage.removeItem(LOG_KEY);
    renderProgress();
  }
});

function drawLineChart(canvas, series, color) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 400, h = canvas.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);
  if (series.length < 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px Inter';
    ctx.fillText('Log a few days to see your trend', 10, h/2);
    return;
  }
  const pad = 20;
  const max = Math.max(...series) * 1.1 || 1;
  const min = Math.min(...series) * 0.9;
  const range = (max - min) || 1;
  const stepX = (w - pad*2) / Math.max(series.length - 1, 1);

  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
  series.forEach((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad*2);
    i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.fillStyle = color;
  series.forEach((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad*2);
    ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fill();
  });
}

function renderProgress() {
  const logs = getLogs();
  const weights = logs.filter(l => l.weight).map(l => l.weight);
  drawLineChart(document.getElementById('chartWeight'), weights, '#e74c3c');

  const calIns = logs.filter(l => l.calIn).map(l => l.calIn);
  drawLineChart(document.getElementById('chartCal'), calIns, '#c7ccd1');

  const last7 = logs.slice(-7);
  const avg = (arr) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
  const totalHabits = last7.reduce((a,l) => a + (l.habits ? l.habits.length : 0), 0);

  document.getElementById('weeklyDash').innerHTML = `
    <div class="dash-stat"><div class="num">${avg(last7.filter(l=>l.calIn).map(l=>l.calIn)).toFixed(0)}</div><div class="lbl">Avg Cal In</div></div>
    <div class="dash-stat"><div class="num">${avg(last7.filter(l=>l.calOut).map(l=>l.calOut)).toFixed(0)}</div><div class="lbl">Avg Cal Burned</div></div>
    <div class="dash-stat"><div class="num">${avg(last7.filter(l=>l.water).map(l=>l.water)).toFixed(1)}L</div><div class="lbl">Avg Water</div></div>
    <div class="dash-stat"><div class="num">${avg(last7.filter(l=>l.sleep).map(l=>l.sleep)).toFixed(1)}h</div><div class="lbl">Avg Sleep</div></div>
  `;
}
renderProgress();
window.addEventListener('resize', renderProgress);

/* ============================================
   4. STUDENT BUDGET PLANS
   ============================================ */
const BUDGET_PLANS = {
  "₹2000 / month": {
    total: "≈ ₹2,000 / month · ~1850 kcal, 85g protein/day",
    meals: [
      {time:"Breakfast", item:"Ragi malt + 2 boiled eggs", macro:"P 22g · C 38g · F 11g", price:"₹15/day"},
      {time:"Lunch", item:"Rice + dal + seasonal sabzi", macro:"P 18g · C 70g · F 10g", price:"₹25/day"},
      {time:"Snack", item:"Banana + roasted chana", macro:"P 14g · C 40g · F 6g", price:"₹10/day"},
      {time:"Dinner", item:"Chapati + curd + vegetable curry", macro:"P 16g · C 45g · F 12g", price:"₹20/day"},
    ]
  },
  "₹3500 / month": {
    total: "≈ ₹3,500 / month · ~2200 kcal, 120g protein/day",
    meals: [
      {time:"Breakfast", item:"4 egg whites + 1 whole egg + oats", macro:"P 32g · C 40g · F 12g", price:"₹25/day"},
      {time:"Lunch", item:"Rice + sambar + paneer/chicken curry", macro:"P 28g · C 75g · F 14g", price:"₹40/day"},
      {time:"Pre-workout", item:"Banana + peanut chikki", macro:"P 10g · C 45g · F 14g", price:"₹12/day"},
      {time:"Dinner", item:"Chapati + dal + sardines/mackerel (2x/wk)", macro:"P 26g · C 50g · F 16g", price:"₹38/day"},
    ]
  },
  "₹5000+ / month": {
    total: "≈ ₹5,000+ / month · ~2600 kcal, 150g protein/day",
    meals: [
      {time:"Breakfast", item:"Whey shake + 3 eggs + oats", macro:"P 45g · C 45g · F 18g", price:"₹45/day"},
      {time:"Lunch", item:"Rice + chicken breast + dal + salad", macro:"P 40g · C 80g · F 16g", price:"₹55/day"},
      {time:"Snack", item:"Curd + almonds + fruit", macro:"P 14g · C 30g · F 16g", price:"₹25/day"},
      {time:"Dinner", item:"Chapati + paneer/fish + vegetables", macro:"P 35g · C 55g · F 18g", price:"₹50/day"},
    ]
  }
};

const budgetTabs = document.getElementById('budgetTabs');
const budgetContent = document.getElementById('budgetContent');
budgetTabs.innerHTML = Object.keys(BUDGET_PLANS).map((k,i) => `<span class="chip ${i===0?'active':''}" data-plan="${k}">${k}</span>`).join('');

function renderBudget(planKey) {
  const plan = BUDGET_PLANS[planKey];
  budgetContent.innerHTML = plan.meals.map(m => `
    <div class="meal-card">
      <div class="meal-card__time">${m.time}</div>
      <div class="meal-card__item">${m.item}</div>
      <div class="meal-card__macro">${m.macro}</div>
      <div class="meal-card__price">Approx. <b>${m.price}</b></div>
    </div>
  `).join('') + `<div class="budget__total">${plan.total}</div>`;
}
budgetTabs.addEventListener('click', e => {
  if (!e.target.classList.contains('chip')) return;
  budgetTabs.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  e.target.classList.add('active');
  renderBudget(e.target.dataset.plan);
});
renderBudget(Object.keys(BUDGET_PLANS)[0]);

/* ============================================
   5. GYM — WORKOUT PLANS, PRs, CALENDAR
   ============================================ */
const PLANS = [
  {title:"Fat Loss — 5 Day Split", desc:"High-volume circuits with cardio finishers, calorie-deficit paired.", items:["Day 1: Full body circuit","Day 2: Upper push + core","Day 3: HIIT cardio","Day 4: Lower body + core","Day 5: Upper pull + cardio"]},
  {title:"Muscle Gain — Push/Pull/Legs", desc:"Classic PPL split for hypertrophy, 6 days/week.", items:["Push: Chest, Shoulders, Triceps","Pull: Back, Biceps","Legs: Quads, Hams, Glutes","Repeat cycle ×2/week"]},
  {title:"Strength — 4 Day Upper/Lower", desc:"Heavy compound focus: squat, bench, deadlift, press.", items:["Upper A: Bench + Row focus","Lower A: Squat focus","Upper B: Press + Pull-up focus","Lower B: Deadlift focus"]},
  {title:"Beginner — Foundation 3 Day", desc:"Full body, form-first program for first 8 weeks.", items:["Day 1: Full body A","Day 2: Rest / mobility","Day 3: Full body B","Day 4: Rest","Day 5: Full body C"]},
];
document.getElementById('gymPlans').innerHTML = PLANS.map(p => `
  <div class="plan-card">
    <h3>${p.title}</h3>
    <p>${p.desc}</p>
    <ul>${p.items.map(i => `<li>${i}</li>`).join('')}</ul>
  </div>
`).join('');

// Personal Records
const PR_KEY = 'bc_prs';
const getPRs = () => JSON.parse(localStorage.getItem(PR_KEY) || '[]');
const setPRs = (p) => localStorage.setItem(PR_KEY, JSON.stringify(p));
function renderPRs() {
  const prs = getPRs();
  document.getElementById('prList').innerHTML = prs.length
    ? prs.map((p,i) => `<li>${p.lift} <b>${p.kg} kg</b></li>`).join('')
    : `<li style="color:var(--steel-dim); border:none;">No PRs logged yet.</li>`;
}
document.getElementById('prForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const prs = getPRs();
  prs.push({lift: fd.get('lift'), kg: fd.get('kg')});
  setPRs(prs);
  e.target.reset();
  renderPRs();
});
renderPRs();

// Training calendar (current month toggle)
const CAL_KEY = 'bc_calendar';
const getCal = () => JSON.parse(localStorage.getItem(CAL_KEY) || '[]');
const setCal = (c) => localStorage.setItem(CAL_KEY, JSON.stringify(c));
function renderCalendar() {
  const days = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
  const active = getCal();
  const grid = document.getElementById('calGrid');
  grid.innerHTML = Array.from({length: days}, (_, i) => i+1).map(d =>
    `<div class="cal-day ${active.includes(d) ? 'active' : ''}" data-day="${d}">${d}</div>`
  ).join('');
}
document.getElementById('calGrid').addEventListener('click', e => {
  if (!e.target.classList.contains('cal-day')) return;
  const d = +e.target.dataset.day;
  let active = getCal();
  active = active.includes(d) ? active.filter(x => x !== d) : [...active, d];
  setCal(active);
  renderCalendar();
});
renderCalendar();

/* ============================================
   6. AI ROADMAP CARDS
   ============================================ */
const ROADMAP = [
  {tag:"AI", title:"AI Diet Recommendation", desc:"Personalised diet plans generated from your logged progress and goals."},
  {tag:"AI", title:"AI Nutrition Chat Assistant", desc:"Ask questions about meals, swaps and macros in plain language."},
  {tag:"AI", title:"Smart Meal Suggestions", desc:"Suggests next meals based on what you've already eaten today."},
  {tag:"AI", title:"Goal Prediction", desc:"Projects your weight/strength trajectory from logged history."},
  {tag:"Premium", title:"Barcode Food Scanner", desc:"Scan packaged food barcodes for instant nutrition facts."},
  {tag:"Premium", title:"Meal Photo Estimator", desc:"Upload a meal photo, get an estimated nutrition breakdown."},
  {tag:"Premium", title:"PDF Diet Report Generator", desc:"Export your plan and progress as a shareable PDF report."},
  {tag:"Premium", title:"Email &amp; Push Reports", desc:"Weekly progress summaries delivered automatically."},
  {tag:"Platform", title:"Offline Mode", desc:"Log workouts and meals without signal, sync once connected."},
  {tag:"Platform", title:"Multi-language Support", desc:"Kannada, Tulu, Hindi &amp; English interface options."},
];
document.getElementById('roadmap').innerHTML = ROADMAP.map(r => `
  <div class="road-card">
    <span class="tag">${r.tag}</span>
    <h4>${r.title}</h4>
    <p>${r.desc}</p>
  </div>
`).join('');

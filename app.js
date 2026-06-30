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
   0. SINGLE FOOD NUTRITION CHECKER (any food, by name)
   ============================================ */
(function(){
  const input = document.getElementById('fcheckInput');
  const qtyInput = document.getElementById('fcheckQty');
  const unitInput = document.getElementById('fcheckUnit');
  const suggestBox = document.getElementById('fcheckSuggest');
  const resultBox = document.getElementById('fcheckResult');
  const form = document.getElementById('fcheckForm');

  let activeIndex = -1;
  let currentMatches = [];
  let selectedFood = null;

  function matchFoods(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return FOODS.filter(f => f.n.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q)).slice(0, 8);
  }

  function showSuggestions(list) {
    currentMatches = list;
    activeIndex = -1;
    if (!list.length) { suggestBox.classList.remove('open'); suggestBox.innerHTML=''; return; }
    suggestBox.innerHTML = list.map((f,i) =>
      `<div data-i="${i}"><span>${f.n}</span><small>${f.cat}</small></div>`
    ).join('');
    suggestBox.classList.add('open');
  }

  input.addEventListener('input', () => {
    selectedFood = null;
    showSuggestions(matchFoods(input.value));
  });

  input.addEventListener('keydown', (e) => {
    if (!suggestBox.classList.contains('open')) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex+1, currentMatches.length-1); highlight(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); highlight(); }
    if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); pick(currentMatches[activeIndex]); }
    if (e.key === 'Escape') { suggestBox.classList.remove('open'); }
  });

  function highlight() {
    [...suggestBox.children].forEach((el,i) => el.classList.toggle('active', i === activeIndex));
  }

  suggestBox.addEventListener('click', (e) => {
    const row = e.target.closest('div[data-i]');
    if (!row) return;
    pick(currentMatches[+row.dataset.i]);
  });

  function pick(food) {
    selectedFood = food;
    input.value = food.n;
    suggestBox.classList.remove('open');
  }

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) suggestBox.classList.remove('open');
  });

  function findFood(name) {
    const q = name.trim().toLowerCase();
    if (!q) return null;
    // exact match first, then "starts with", then "includes"
    return FOODS.find(f => f.n.toLowerCase() === q)
        || FOODS.find(f => f.n.toLowerCase().startsWith(q))
        || FOODS.find(f => f.n.toLowerCase().includes(q))
        || null;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const food = selectedFood || findFood(input.value);
    const qty = +qtyInput.value || 100;
    const unit = unitInput.value;

   if (!food) {
  resultBox.innerHTML = `<p>Searching worldwide food database...</p>`;

  searchWorldwideFood(input.value);
  return;
}

    // scale: serving size is per-100g for most items unless "serving" text says otherwise.
    // We treat the stored values as "per serving" qty=1, and as "per 100g" when unit=grams.
    let factor;
    if (unit === 'serving') {
      factor = qty; // qty servings, each = food.serving amount
    } else {
      // grams entered, food values are per 100g (serving labelled as "100g..." for most) -
      // for items whose serving isn't 100g (egg, idli, dosa, roti, almonds@100g, etc.) we still scale linearly per gram using kcal/100g basis where stated, else per the unit count.
      const per100 = food.serving.toLowerCase().includes('100g') || food.serving.toLowerCase().includes('100ml');
      factor = per100 ? (qty / 100) : (qty / 100); // fallback: treat all numeric values as "per 100g equivalent" for gram input
    }

    const r = (v) => Math.round(v * factor * 10) / 10;
    const qtyLabel = unit === 'serving' ? `${qty} × ${food.serving}` : `${qty} g`;

    resultBox.innerHTML = `
      <div class="fcheck__head">
        <div>
          <h3>${food.n}</h3>
          <span>${food.cat} · ${qtyLabel}</span>
        </div>
        <div class="fcheck__kcal">
          <b>${r(food.kcal)}</b>
          <span>kcal</span>
        </div>
      </div>
      <div class="fcheck__macros">
        <div class="m"><b>${r(food.p)}g</b><span>Protein</span></div>
        <div class="m"><b>${r(food.c)}g</b><span>Carbs</span></div>
        <div class="m"><b>${r(food.f)}g</b><span>Fat</span></div>
        <div class="m"><b>${r(food.fib)}g</b><span>Fibre</span></div>
      </div>
      <div class="fcheck__micro">
        <div><span>Sugar</span><b>${r(food.sug)} g</b></div>
        <div><span>Sodium</span><b>${r(food.na)} mg</b></div>
        <div><span>Potassium</span><b>${r(food.k)} mg</b></div>
        <div><span>Calcium</span><b>${r(food.ca)} mg</b></div>
        <div><span>Iron</span><b>${r(food.fe)} mg</b></div>
        <div><span>Vitamin A</span><b>${r(food.va)} µg</b></div>
        <div><span>Vitamin C</span><b>${r(food.vc)} mg</b></div>
        <div><span>Vitamin D</span><b>${r(food.vd)} µg</b></div>
        <div><span>Vitamin B12</span><b>${r(food.b12)} µg</b></div>
      </div>
    `;
  });
})();
const USDA_API_KEY = "fzjGdwzTlXUAyv694c75YG84fWRcfuyX8EpXUFgT";

async function searchWorldwideFood(foodName) {
  const resultBox = document.getElementById("fcheckResult");

  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodName}&api_key=${USDA_API_KEY}`
    );

    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      resultBox.innerHTML =
        `<p>No nutrition information found for "${foodName}".</p>`;
      return;
    }

    const food = data.foods[0];

    function getNutrient(name) {
      const n = food.foodNutrients.find(
        x => x.nutrientName === name
      );
      return n ? n.value : 0;
    }

    resultBox.innerHTML = `
      <div class="fcheck__head">
        <div>
          <h3>${food.description}</h3>
          <span>Worldwide Food Database</span>
        </div>
        <div class="fcheck__kcal">
          <b>${getNutrient("Energy")}</b>
          <span>kcal</span>
        </div>
      </div>

      <div class="fcheck__macros">
        <div class="m">
          <b>${getNutrient("Protein")}g</b>
          <span>Protein</span>
        </div>

        <div class="m">
          <b>${getNutrient("Carbohydrate, by difference")}g</b>
          <span>Carbs</span>
        </div>

        <div class="m">
          <b>${getNutrient("Total lipid (fat)")}g</b>
          <span>Fat</span>
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);

    resultBox.innerHTML =
      `<p>Unable to fetch nutrition data.</p>`;
  }
}

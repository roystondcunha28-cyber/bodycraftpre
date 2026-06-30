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
   SINGLE FOOD NUTRITION CHECKER
============================================ */

(function () {
  const input = document.getElementById("fcheckInput");
  const qtyInput = document.getElementById("fcheckQty");
  const unitInput = document.getElementById("fcheckUnit");
  const resultBox = document.getElementById("fcheckResult");
  const form = document.getElementById("fcheckForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const foodName = input.value.trim();
   const qty =
Number(qtyInput.value) || 100;

const unit =
unitInput.value;

    if (!foodName) {
      resultBox.innerHTML =
        "<p>Please enter a food name.</p>";
      return;
    }

  const searchMsg = document.getElementById("searchMsg");

if (searchMsg) {
  searchMsg.textContent = "Searching...";
}
    searchWorldwideFood(foodName, qty, unit);
  });
})();
let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFat = 0;
const USDA_API_KEY =
"fzjGdwzTlXUAyv694c75YG84fWRcfuyX8EpXUFgT";

async function searchWorldwideFood(
  foodName,
  qty = 100,
  unit = "g"
)
{
  const resultBox = document.getElementById("fcheckResult");

  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${USDA_API_KEY}`
    );

    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
     const searchMsg = document.getElementById("searchMsg");
searchMsg.textContent =
  `No nutrition information found for "${foodName}".`;
return;
    }
    const food = data.foods[0];

    function getNutrient(name) {
      const nutrient = food.foodNutrients.find(
        n => n.nutrientName === name
      );
      return nutrient ? nutrient.value : 0;
    }

    let factor;

if (unit === "g") {
  factor = qty / 100;
} else {
  factor = qty;
}
    const calories =
      (getNutrient("Energy") * factor).toFixed(1);

    const protein =
      (getNutrient("Protein") * factor).toFixed(1);

    const carbs =
      (getNutrient("Carbohydrate, by difference") * factor).toFixed(1);

    const fat =
      (getNutrient("Total lipid (fat)") * factor).toFixed(1);

    const fiber =
      (getNutrient("Fiber, total dietary") * factor).toFixed(1);

   const tbody =
document.getElementById("foodTableBody");

const row = document.createElement("tr");

row.innerHTML = `
<td>${food.description}</td>
<td>${qty} ${unit}</td>
<td>${calories}</td>
<td>${protein} g</td>
<td>${carbs} g</td>
<td>${fat} g</td>
<td>
<button class="remove-btn">
❌
</button>
</td>
`;

tbody.appendChild(row);

totalCalories += Number(calories);
totalProtein += Number(protein);
totalCarbs += Number(carbs);
totalFat += Number(fat);

document.getElementById("totalCalories").textContent =
  totalCalories.toFixed(1);

document.getElementById("totalProtein").textContent =
  totalProtein.toFixed(1);

document.getElementById("totalCarbs").textContent =
  totalCarbs.toFixed(1);

document.getElementById("totalFat").textContent =
  totalFat.toFixed(1);

row.querySelector(".remove-btn")
.addEventListener("click", () => {

  totalCalories -= Number(calories);
  totalProtein -= Number(protein);
  totalCarbs -= Number(carbs);
  totalFat -= Number(fat);

  document.getElementById("totalCalories").textContent =
    totalCalories.toFixed(1);

  document.getElementById("totalProtein").textContent =
    totalProtein.toFixed(1);

  document.getElementById("totalCarbs").textContent =
    totalCarbs.toFixed(1);

  document.getElementById("totalFat").textContent =
    totalFat.toFixed(1);

  row.remove();
});
     document.getElementById("fcheckInput").value = "";
document.getElementById("fcheckQty").value = 100;
document.getElementById("fcheckUnit").value = "g";
const searchMsg =
document.getElementById("searchMsg");

if (searchMsg) {
  searchMsg.textContent = "";
}
  } catch (error) {
    console.error(error);

    const searchMsg = document.getElementById("searchMsg");
searchMsg.textContent =
  "Unable to fetch nutrition data.";
return;
  }
}
const bmiForm =
document.getElementById("bmiForm");

const bmiResult =
document.getElementById("bmiResult");

if (bmiForm) {
  bmiForm.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();

      const h =
        Number(
          document.getElementById(
            "bmiHeight"
          ).value
        );

      const w =
        Number(
          document.getElementById(
            "bmiWeight"
          ).value
        );

      const bmi =
        w / ((h / 100) ** 2);

      let status = "";

      if (bmi < 18.5)
        status = "Underweight";
      else if (bmi < 25)
        status = "Normal";
      else if (bmi < 30)
        status = "Overweight";
      else
        status = "Obese";

      bmiResult.innerHTML = `
        <div class="bmi-card">
          <h3>Your BMI</h3>

          <div class="bmi-number">
            ${bmi.toFixed(1)}
          </div>

          <div class="bmi-status">
            ${status}
          </div>
        </div>
      `;
    }
  );
}

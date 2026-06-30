// ==========================
// USDA API KEY
// ==========================
const API_KEY = "fzjGdwzTlXUAyv694c75YG84fWRcfuyX8EpXUFgT";

// ==========================
// DAILY TOTALS
// ==========================
let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFat = 0;

// ==========================
// LOAD SAVED DATA
// ==========================
window.onload = () => {
  loadTotals();
};

// ==========================
// BMI CALCULATOR
// ==========================
function calculateBMI() {
  const height =
    parseFloat(
      document.getElementById("height").value
    );

  const weight =
    parseFloat(
      document.getElementById("weight").value
    );

  if (!height || !weight) {
    alert("Please enter height and weight.");
    return;
  }

  const bmi =
    weight / ((height / 100) ** 2);

  let category = "";
  let color = "";

  if (bmi < 18.5) {
    category = "Underweight";
    color = "#f59e0b";
  }
  else if (bmi < 25) {
    category = "Normal";
    color = "#22c55e";
  }
  else if (bmi < 30) {
    category = "Overweight";
    color = "#f97316";
  }
  else {
    category = "Obese";
    color = "#ef4444";
  }

  document.getElementById(
    "bmiResult"
  ).innerHTML = `
      <div class="result">
          <h2 style="color:${color}">
              BMI: ${bmi.toFixed(1)}
          </h2>

          <p>${category}</p>
      </div>
  `;
}

// ==========================
// SEARCH FOOD
// ==========================
async function searchFood() {
  const food =
    document.getElementById(
      "foodName"
    ).value.trim();

  if (!food) {
    alert("Enter a food name.");
    return;
  }

  document.getElementById(
    "foodResult"
  ).innerHTML =
    "<p>Searching...</p>";

  try {
    const response =
      await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(food)}&pageSize=10&api_key=${API_KEY}`
      );

    const data =
      await response.json();

    if (
      !data.foods ||
      data.foods.length === 0
    ) {
      document.getElementById(
        "foodResult"
      ).innerHTML =
        "<div class='result'>No food found.</div>";
      return;
    }

    displayFoods(data.foods);
  }
  catch (error) {
    console.error(error);

    document.getElementById(
      "foodResult"
    ).innerHTML =
      "<div class='result'>Error fetching nutrition data.</div>";
  }
}

// ==========================
// DISPLAY MULTIPLE FOODS
// ==========================
function displayFoods(foods) {
  let html = "";

  foods.forEach((food, index) => {

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    food.foodNutrients.forEach(n => {

      if (n.nutrientName === "Energy")
        calories = n.value;

      if (n.nutrientName === "Protein")
        protein = n.value;

      if (
        n.nutrientName ===
        "Carbohydrate, by difference"
      )
        carbs = n.value;

      if (
        n.nutrientName ===
        "Total lipid (fat)"
      )
        fat = n.value;
    });

    html += `
      <div class="food-card">

          <h3>${food.description}</h3>

          <p><strong>Calories:</strong>
          ${calories || 0} kcal</p>

          <p><strong>Protein:</strong>
          ${protein || 0} g</p>

          <p><strong>Carbs:</strong>
          ${carbs || 0} g</p>

          <p><strong>Fat:</strong>
          ${fat || 0} g</p>

          <input
            type="number"
            min="1"
            value="1"
            id="qty-${index}"
            placeholder="Servings">

          <button
            onclick="addFood(
            ${calories || 0},
            ${protein || 0},
            ${carbs || 0},
            ${fat || 0},
            document.getElementById('qty-${index}').value
            )">

            Add To Daily Intake

          </button>

      </div>
    `;
  });

  document.getElementById(
    "foodResult"
  ).innerHTML = html;
}

// ==========================
// ADD FOOD
// ==========================
function addFood(
  calories,
  protein,
  carbs,
  fat,
  quantity
) {
  quantity = Number(quantity);

  totalCalories +=
    calories * quantity;

  totalProtein +=
    protein * quantity;

  totalCarbs +=
    carbs * quantity;

  totalFat +=
    fat * quantity;

  updateDashboard();
  saveTotals();

  alert("Food added successfully.");
}

// ==========================
// UPDATE DASHBOARD
// ==========================
function updateDashboard() {

  document.getElementById(
    "totalCalories"
  ).innerText =
    totalCalories.toFixed(0);

  document.getElementById(
    "totalProtein"
  ).innerText =
    totalProtein.toFixed(1) + "g";

  document.getElementById(
    "totalCarbs"
  ).innerText =
    totalCarbs.toFixed(1) + "g";

  document.getElementById(
    "totalFat"
  ).innerText =
    totalFat.toFixed(1) + "g";
}

// ==========================
// SAVE TO LOCAL STORAGE
// ==========================
function saveTotals() {

  const nutrition = {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat
  };

  localStorage.setItem(
    "nutritionTotals",
    JSON.stringify(nutrition)
  );
}

// ==========================
// LOAD FROM LOCAL STORAGE
// ==========================
function loadTotals() {

  const saved =
    JSON.parse(
      localStorage.getItem(
        "nutritionTotals"
      )
    );

  if (!saved)
    return;

  totalCalories =
    saved.calories || 0;

  totalProtein =
    saved.protein || 0;

  totalCarbs =
    saved.carbs || 0;

  totalFat =
    saved.fat || 0;

  updateDashboard();
}

// ==========================
// RESET DAILY INTAKE
// ==========================
function resetNutrition() {

  if (
    !confirm(
      "Clear today's nutrition data?"
    )
  )
    return;

  totalCalories = 0;
  totalProtein = 0;
  totalCarbs = 0;
  totalFat = 0;

  updateDashboard();

  localStorage.removeItem(
    "nutritionTotals"
  );
}

// ==========================
// ENTER KEY SEARCH
// ==========================
document
  .getElementById("foodName")
  .addEventListener(
    "keypress",
    function (e) {
      if (e.key === "Enter") {
        searchFood();
      }
    }
  );

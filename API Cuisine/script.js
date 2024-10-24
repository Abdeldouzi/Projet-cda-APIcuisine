const apiKey = "791d7f182578452a9389432c0ac692dc";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("get-recipe");
  const ingredientInput = document.getElementById("ingredient-input");
  const searchByIngredientsBtn = document.getElementById("search-by-ingredients");
  const recipeContainer = document.getElementById("recipe-container");
  const suggestionsContainer = document.getElementById("suggestions");

  btn.addEventListener("click", getRandomRecipe);
  searchByIngredientsBtn.addEventListener("click", searchRecipesByIngredients);

  ingredientInput.addEventListener("input", async () => {
    const query = ingredientInput.value.trim();
    if (query.length < 1) {
      suggestionsContainer.style.display = "none";
      return;
    }

    try {
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(query)}&apiKey=${apiKey}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const suggestions = await response.json();
      displaySuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching ingredient suggestions", error);
    }
  });

  function displaySuggestions(suggestions) {
    if (suggestions.length === 0) {
      suggestionsContainer.style.display = "none";
      return;
    }

    suggestionsContainer.innerHTML = suggestions
      .map(ing => `<div class="suggestion-item">${ing.name}</div>`)
      .join("");
    suggestionsContainer.style.display = "block";

    document.querySelectorAll(".suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        ingredientInput.value = item.textContent;
        suggestionsContainer.style.display = "none";
      });
    });
  }

  document.addEventListener("click", event => {
    if (!suggestionsContainer.contains(event.target) && event.target !== ingredientInput) {
      suggestionsContainer.style.display = "none";
    }
  });

  async function getRandomRecipe() {
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const recipe = data.recipes[0];
      displayRecipe(recipe);
      await displayTaste(recipe.id);
    } catch (error) {
      console.error("Error fetching random recipe", error);
      recipeContainer.innerHTML = "<p>Error fetching the recipe.</p>";
    }
  }

  async function searchRecipesByIngredients() {
    const ingredients = ingredientInput.value.trim();
    if (!ingredients) {
      alert("Please enter at least one ingredient.");
      return;
    }

    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&apiKey=${apiKey}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const recipes = await response.json();
      displayRecipes(recipes);
    } catch (error) {
      console.error("Error fetching recipes by ingredients", error);
      recipeContainer.innerHTML = "<p>Error fetching recipes.</p>";
    }
  }

  function displayRecipe(recipe) {
    recipeContainer.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
      <p><strong>Preparation time:</strong> ${recipe.readyInMinutes} minutes</p>
      <p><strong>Instructions:</strong> ${recipe.instructions || "Instructions not available."}</p>
    `;
  }

  async function displayRecipes(recipes) {
    if (recipes.length === 0) {
      recipeContainer.innerHTML = "<p>No recipes found with these ingredients.</p>";
      return;
    }

    recipeContainer.innerHTML = recipes
      .map(recipe => `
        <div class="recipe" data-id="${recipe.id}">
          <h3>${recipe.title}</h3>
          <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
          <p><strong>Used ingredients:</strong> ${recipe.usedIngredients.map(ing => ing.name).join(", ")}</p>
          <p><strong>Missing ingredients:</strong> ${recipe.missedIngredients.map(ing => ing.name).join(", ")}</p>
        </div>
      `)
      .join("");

    document.querySelectorAll(".recipe").forEach(element => {
      element.addEventListener("click", () => {
        const recipeId = element.getAttribute("data-id");
        RecipeDetails(recipeId);
      });
    });
  }

  async function RecipeDetails(recipeId) {
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const recipe = await response.json();
      displayRecipe(recipe);
      await displayTaste(recipeId);
    } catch (error) {
      console.error("Error fetching recipe details", error);
      recipeContainer.innerHTML = "<p>Error fetching recipe details.</p>";
    }
  }

  async function displayTaste(recipeId) {
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/tasteWidget.json?apiKey=${apiKey}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const tasteData = await response.json();
      const tasteContainer = document.createElement("div");
      tasteContainer.innerHTML = `
        <h4>Taste Profile</h4>
        <ul>
          <li><strong>Sweet:</strong> ${tasteData.sweetness}</li>
          <li><strong>Salty:</strong> ${tasteData.saltiness}</li>
          <li><strong>Sour:</strong> ${tasteData.sourness}</li>
          <li><strong>Bitter:</strong> ${tasteData.bitterness}</li>
          <li><strong>Fatty:</strong> ${tasteData.fattiness}</li>
          <li><strong>Spicy:</strong> ${tasteData.spiciness}</li>
        </ul>
      `;
      recipeContainer.appendChild(tasteContainer);
    } catch (error) {
      console.error("Error fetching taste data", error);
    }
  }
});

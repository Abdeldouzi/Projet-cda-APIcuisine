const apiKey = "791d7f182578452a9389432c0ac692dc";
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("get-recipe");
  const ingredientInput = document.getElementById("ingredient-input");
  const searchByIngredientsBtn = document.getElementById(
    "search-by-ingredients"
  );
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
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(
          query
        )}&apiKey=${apiKey}`
      );
      const suggestions = await response.json();
      displaySuggestions(suggestions);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des suggestions d'ingrédients",
        error
      );
    }
  });

  function displaySuggestions(suggestions) {
    if (suggestions.length === 0) {
      suggestionsContainer.style.display = "none";
      return;
    }

    suggestionsContainer.innerHTML = suggestions
      .map((ing) => `<div class="suggestion-item">${ing.name}</div>`)
      .join("");
    suggestionsContainer.style.display = "block";

    const suggestionItems = document.querySelectorAll(".suggestion-item");
    suggestionItems.forEach((item) => {
      item.addEventListener("click", () => {
        ingredientInput.value = item.textContent;
        suggestionsContainer.style.display = "none";
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (
      !suggestionsContainer.contains(event.target) &&
      event.target !== ingredientInput
    ) {
      suggestionsContainer.style.display = "none";
    }
  });

  async function getRandomRecipe() {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}`
      );
      const data = await response.json();
      const recipe = data.recipes[0];
      displayRecipe(recipe);

      const tasteResponse = await fetch(
        `https://api.spoonacular.com/recipes/${recipe.id}/tasteWidget.json?apiKey=${apiKey}`
      );
      const tasteData = await tasteResponse.json();
      displayTaste(tasteData);
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette", error);
      recipeContainer.innerHTML =
        "<p>Erreur lors de la récupération de la recette.</p>";
    }
  }

  async function searchRecipesByIngredients() {
    const ingredients = ingredientInput.value.trim();
    if (!ingredients) {
      alert("Veuillez entrer au moins un ingrédient.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
          ingredients
        )}&apiKey=${apiKey}`
      );
      const recipes = await response.json();
      displayRecipes(recipes);
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes", error);
      recipeContainer.innerHTML =
        "<p>Erreur lors de la récupération des recettes.</p>";
    }
  }

  function displayRecipe(recipe) {
    recipeContainer.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
      <p><strong>Temps de préparation :</strong> ${recipe.readyInMinutes} minutes</p>
      <p><strong>Instructions :</strong> ${recipe.instructions}</p>
    `;
  }

  async function displayRecipes(recipes) {
    if (recipes.length === 0) {
      recipeContainer.innerHTML =
        "<p>Aucune recette trouvée avec ces ingrédients.</p>";
      return;
    }

    recipeContainer.innerHTML = recipes
      .map(
        (recipe) => `
      <div class="recipe" data-id="${recipe.id}">
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${
          recipe.title
        }" style="max-width: 100%; height: auto;">
        <p><strong>Ingrédients :</strong> ${recipe.usedIngredients
          .map((ing) => ing.name)
          .join(", ")}</p>
        <p><strong>Ingrédients manquants :</strong> ${recipe.missedIngredients
          .map((ing) => ing.name)
          .join(", ")}</p>
      </div>
    `
      )
      .join("");

    const recipeElements = document.querySelectorAll(".recipe");
    recipeElements.forEach((element) => {
      element.addEventListener("click", () => {
        const recipeId = element.getAttribute("data-id");
        RecipeDetails(recipeId);
      });
    });
  }

  async function RecipeDetails(recipeId) {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`
      );
      const recipe = await response.json();
      displayRecipe(recipe);

      const tasteResponse = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/tasteWidget.json?apiKey=${apiKey}`
      );
      const tasteData = await tasteResponse.json();
      displayTaste(tasteData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails de la recette",
        error
      );
      recipeContainer.innerHTML =
        "<p>Erreur lors de la récupération des détails de la recette.</p>";
    }
  }

  function displayTaste(tasteData) {
    const tasteContainer = document.createElement("div");
    tasteContainer.innerHTML = `
      <h4>Profil de goût</h4>
      <ul>
        <li><strong>Sucré :</strong> ${tasteData.sweetness}</li>
        <li><strong>Salé :</strong> ${tasteData.saltiness}</li>
        <li><strong>Acide :</strong> ${tasteData.sourness}</li>
        <li><strong>Amer :</strong> ${tasteData.bitterness}</li>
        <li><strong>Gras :</strong> ${tasteData.fattiness}</li>
        <li><strong>Piquant :</strong> ${tasteData.spiciness}</li>
      </ul>
    `;
    recipeContainer.appendChild(tasteContainer);
    console.log(tasteData);
  }
});

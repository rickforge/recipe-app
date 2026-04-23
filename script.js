// RICKARD ENGSTRÖM
// Examinationsprojekt - Receptapp med filtrering

// OBS: Testrecept är bortkommenterade längst ned i filen som använts vid test.
// Kommentera bort för att slippa skriva in många egna recept.

// =====================================================================
//                             VARIABLAR
// =====================================================================

// Receptlista hämtas från localStorage eller skapas som tom array
let recipes = JSON.parse(localStorage.getItem("recipes")) || [];

// Håller reda på det aktiva receptet (detaljvyn)
let activeRecipe = null;

// Variablar för "lägg till ett recept" boxen
const recipeButton = document.getElementById("add-recipe-button");
const box = document.getElementById("add-recipe-box");
const closeForm = document.getElementById("close-form");

// Variablar för det aktiva recept fönstret
const recipeBox = document.getElementById("recipe-content-box");
const closeRecipe = document.getElementById("close-recipe");

// Hämtar formuläret för att lägga till ett nytt recept
const form = document.getElementById("add-recipe-form");

// Översätter filtervärden till svenska
const categoryTranslate = {
  starter: "Förrätt",
  "main-course": "Huvudrätt",
  dessert: "Dessert",
};
const difficultyTranslate = {
  easy: "Lätt",
  medium: "Medel",
  hard: "Svår",
};

// =====================================================================
//                Klass som representerar ett recept
// =====================================================================
class Recipe {
  constructor(name, ingredients, instructions, category, difficulty, image) {
    this.name = name;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.category = category;
    this.difficulty = difficulty;
    this.image = image || "./images/default.jpg"; // Bild som väljs om ingen bild valts i formuläret https://unsplash.com/photos/red-cherry-fruits-on-pink-surface-3T4rfR_XZf0
  }
}

// =====================================================================
//                             FUNKTIONER
// =====================================================================

// Uppdaterar listan med receptkort
function updateRecipeList() {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";

  // Letar igenom alla recept som finns i receptlistan, går igenom filter och skapar all data för att skapa receptkort
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];

    // Skippar recept som ej matchar valt filter
    if (recipeFilter(recipe) === false) {
      continue;
    }

    // Grund div element för receptkort
    const article = document.createElement("article");
    article.className = "recipe-card";

    // Bild
    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.name;
    img.className = "recipe-card-image";

    // Info box
    const info = document.createElement("div");
    info.className = "recipe-card-info";

    // Kategori
    const category = document.createElement("p");
    category.textContent = categoryTranslate[recipe.category];
    category.className = "recipe-card-category";

    // Titel
    const title = document.createElement("h3");
    title.textContent = recipe.name;

    // Svårighetsgrad
    const difficulty = document.createElement("p");
    difficulty.textContent = difficultyTranslate[recipe.difficulty];
    difficulty.className = "recipe-card-difficulty";

    // Vid klick på ett receptkort visas en detaljvy
    article.onclick = () => {
      activeRecipe = recipe;
      updateRecipeDetails();
      recipeBox.style.display = "block";
    };

    // Lägger till element i DOM
    info.appendChild(category);
    info.appendChild(title);
    info.appendChild(difficulty);

    article.appendChild(img);
    article.appendChild(info);

    container.appendChild(article);
  }
}

// Kollar om ett recept matchar valt filter
function recipeFilter(recipe) {
  const category = document.getElementById("filter-category").value;
  const difficulty = document.getElementById("filter-difficulty").value;
  const search = document.getElementById("search").value.toLowerCase();

  // Visar bara recept som matchar vald kategori om inte "Alla" är vald
  if (category !== "all") {
    if (recipe.category !== category) {
      return false;
    }
  }

  // Visar bara recept som matchar vald svårighetsgrad om inte "Alla" är vald
  if (difficulty !== "all") {
    if (recipe.difficulty !== difficulty) {
      return false;
    }
  }

  // Sökning med namn. Om input matchar namnet visas receptet
  if (recipe.name.toLowerCase().includes(search) === true) {
    return true;
  }

  // Sökning med ingredienser. Om input matchar en ingrediens visas receptet
  for (let i = 0; i < recipe.ingredients.length; i++) {
    if (recipe.ingredients[i].toLowerCase().includes(search)) {
      return true;
    }
  }

  // Om inget matchas så visas inget recept
  return false;
}

// Skapar/uppdaterar detaljvyn för det aktiva recept fönstret
function updateRecipeDetails() {
  const container = document.getElementById("recipe-details");
  container.innerHTML = "";

  // Rubrik
  const title = document.createElement("h2");
  title.textContent = activeRecipe.name;

  // Bild
  const img = document.createElement("img");
  img.src = activeRecipe.image;
  img.className = "recipe-image";

  // Meta data (kategori + svårighetsgrad)
  const meta = document.createElement("div");
  meta.className = "active-recipe-meta";

  const categoryText = document.createElement("span");
  categoryText.textContent = categoryTranslate[activeRecipe.category];
  categoryText.className = "active-recipe-category";

  const difficultyText = document.createElement("span");
  difficultyText.textContent = difficultyTranslate[activeRecipe.difficulty];
  difficultyText.className = "active-recipe-difficulty";

  // Ingredienser
  const ingredientsTitle = document.createElement("h3");
  ingredientsTitle.textContent = "Ingredienser";

  const ingredientsList = document.createElement("ul");
  for (let i = 0; i < activeRecipe.ingredients.length; i++) {
    const li = document.createElement("li");
    li.textContent = activeRecipe.ingredients[i];
    ingredientsList.appendChild(li);
  }

  // Instruktioner
  const instructionsTitle = document.createElement("h3");
  instructionsTitle.textContent = "Instruktioner";

  const instructionsText = document.createElement("p");
  instructionsText.textContent = activeRecipe.instructions;
  instructionsText.id = "instructions-text";

  // Radera knapp
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Radera";
  deleteButton.id = "deleteButton";

  // Vid klick på Radera knappen så tas det aktiva receptet bort, även från localstorage
  deleteButton.onclick = () => {
    // Bekräftelse meddelande
    const confirmDelete = confirm(
      "Är du säker på att du vill radera receptet?",
    );

    if (confirmDelete === false) {
      return;
    }

    // Tar bort ett recept
    const index = recipes.indexOf(activeRecipe);
    recipes.splice(index, 1);

    localStorage.setItem("recipes", JSON.stringify(recipes));
    activeRecipe = null;
    recipeBox.style.display = "none";
    updateRecipeList();
  };

  // Lägger till alla element i DOM
  meta.appendChild(categoryText);
  meta.appendChild(difficultyText);

  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(img);
  container.appendChild(ingredientsTitle);
  container.appendChild(ingredientsList);
  container.appendChild(instructionsTitle);
  container.appendChild(instructionsText);
  container.appendChild(deleteButton);
}

// Hämtar data från formuläret och lägger till ett nytt recept
function addRecipe() {
  const name = document.getElementById("recipe-name").value;
  const ingredientsText = document.getElementById("ingredients").value;
  const instructions = document.getElementById("instructions").value;
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;
  const image = document.getElementById("image-url").value;

  // Skapar en array med ingredienser genom att dela texten vid varje radbryt
  const ingredients = ingredientsText.split("\n");

  // Skapar ett nytt recept och lägger till i listan
  const recipe = new Recipe(
    name,
    ingredients,
    instructions,
    category,
    difficulty,
    image,
  );

  recipes.push(recipe);

  // Sparar receptet i "local storage"
  localStorage.setItem("recipes", JSON.stringify(recipes));

  // Uppdaterar listan och rensar formuläret
  updateRecipeList();
  form.reset();

  // Stänger/döljer formulär fönstret när receptet sparas via knappen
  box.style.display = "none";
}

// =====================================================================
//                           EVENTHANTERARE
// =====================================================================

// Hindrar formulärets knapp att ladda om sidan och lägger till receptet
form.onsubmit = (event) => {
  event.preventDefault();
  addRecipe();
};

// Uppdaterar receptlistan när användaren ändrar filter
document.getElementById("filter-category").onchange = () => {
  updateRecipeList();
};
document.getElementById("filter-difficulty").onchange = () => {
  updateRecipeList();
};

// Sökfunktion. Uppdaterar receptlistan när användaren söker.
document.getElementById("search").oninput = () => {
  updateRecipeList();
};

// Öppnar "lägg till ett recept" popupen
recipeButton.onclick = () => {
  box.style.display = "block";
};

// Stänger "lägg till ett recept" popupen
closeForm.onclick = () => {
  box.style.display = "none";
};

// Stänger den aktiva receptboxen
closeRecipe.onclick = () => {
  recipeBox.style.display = "none";
};

// Raderar all data från localStorage och receptlistan samt laddar om receptlistan
document.getElementById("delete-data").onclick = () => {
  const confirmDelete = confirm("Vill du verkligen radera all data?");

  if (confirmDelete === false) {
    return;
  }

  localStorage.removeItem("recipes");
  recipes = [];
  updateRecipeList();
};

// =====================================================================
//                              TEST RECEPT 
// =====================================================================
// Ta bort vid faktisk användning av applikationen
// OBS: Läggs ej till om inte receptlistan i appen är tom

const testRecipes = [
  new Recipe(
    "Spaghetti Carbonara",
    [
      "Spaghetti",
      "150g Bacon",
      "4 Ägg",
      "1d Vispgrädde",
      "2dl Parmesan",
      "2krm Svartpeppar",
      "1/2tsk Salt",
      "65g Rucola",
    ],
    "1. Koka spaghettin.\n2. Stek bacon.\n3. Vispa ihop ägg, grädde, parmesan och kryddor.\n4. Häll ned blandningen och bacon i pastan och rör runt på svag värme.\n5. Servera med rucola",
    "main-course",
    "easy",
    "https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Chokladmousse",
    ["200g Choklad", "2 dl Vispgrädde", "1msk Florsocker", "3 Ägg"],
    "1. Hacka choklad fint.\n2. Koka grädde och häll på chokladen. Rör om tills chokladen smält. Rör i äggulorna och florsocker.\n3. Vispa äggvitorna till ett hårt skum och vänd i.\n4. Fyll upp i små glas och låt stelna i kyl i 2 timmar",
    "dessert",
    "medium",
    "https://images.unsplash.com/photo-1673551494277-92204546b504?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Pannkakor",
    ["2 1/2dl Vetemjöl", "6dl Mjölk", "3 Ägg", "Smör", "1/2tsk Salt"],
    "1. Blanda mjöl och salt i en bunke.\n2. Vispa i hälften av mjölken till en slät smet och vispa sedan i resten av mjölken och äggen.\n3. Stek tunna pannkakor i lite smör i en stekpanna.",
    "dessert",
    "easy",
    "https://images.unsplash.com/photo-1597524305544-cd821476715f?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Tomatsoppa",
    [
      "4 Tomater",
      "1 Gul lök",
      "1 Vitlöksklyfta",
      "1msk Smör",
      "1förp Krossade tomater",
      "2msk tomatpuré",
      "2tsk Oregano",
      "1 Grönsaksbuljong",
      "5dl Vatten",
      "Salt",
      "Svartpeppar",
      "1dl Vispgrädde",
    ],
    "1. Skala och hacka lök och vitlök. Fräs dem i smör.\n2. Skär tomater. Blanda ner lök, krossade tomater, färska tomater, tomatpuré, oregano, grönsaksbuljong och vatten. Koka i 10min och smaka av med salt och peppar.\n3. Mixa allt med stavmixer och späd med grädde",
    "starter",
    "easy",
    "https://images.unsplash.com/photo-1629978444632-9f63ba0eff47?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Kycklingwok",
    [
      "500g Kyckling",
      "3dl Ris",
      "2msk Olja",
      "1tsk Salt",
      "250g Broccoli",
      "1 Morot",
      "1 Gul lök",
      "2dl Hoisinsås",
      "1/2dl Rostade sesamfrön",
      "2 Salladslökar",
    ],
    "1. Koka ris. Stek kycklingen i olja och salta.\n2. Tillsätt broccoli, morot, lök och stek hastigt på hög värme. Häll i hoisinsåsen och låt puttra ett par minuter.\n3. Strö över salladslök och sesamfrön.\n4. Servera med ris",
    "main-course",
    "hard",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Lax i ugn",
    [
      "1kg Laxfilé",
      "2msk Olja",
      "1msk Citronskal",
      "2tsk Salt",
      "1 tsk Svartpeppar",
    ],
    "1. Sätt ugnen på 175°C.\n2. Lägg laxen i en smord ugnsform. Ringla över olja och strö över salt, peppar och citronskal.\n3. Ställ i mitten av ugnen ca 25min eller tills laxen har en innertemperatur på 52-56°C",
    "main-course",
    "easy",
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Bruschetta",
    [
      "4 Tomater",
      "1 Vitlöksklyfta",
      "1/2 Kruka basilika",
      "1/2dl Olivolja",
      "Salt",
      "Svartpeppar",
      "4 Skivor lantbröd",
    ],
    "1. Sätt ugnen på 250°C.\n2. Skär tomater. Strimla basilika och blanda. Ringla över hälften av olivoljan och smaksätt med kryddor.\n3. Grilla brödet på ett galler i övre delen av ugnen.\n4. Skala vitlök och grind in ena sidan av brödet med vitlök. Ringa över restan av olivoljan. Fördela tomaterna på bröden",
    "starter",
    "easy",
    "https://images.unsplash.com/photo-1506280754576-f6fa8a873550?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
  new Recipe(
    "Rickard's fantastiska pizzadeg",
    ["1kg Tipo 00 mjöl", "6dl Vatten", "30g salt", "1g Färsk jäst"],
    "1. Blanda vatten, salt i en bunke och få saltet att lösas upp med fingrarna.\n2. Häll i 1/3 av mjölet och blanda till en fin smet. Blanda sedan i jästen jämnt i smeten.\n3. Häll i resten av mjölet och knåda i ca 15-20min. Är degen alldeles för torr eller kladdig så kan man addera lite vatten eller mjöl.\n4. Låt jäsa ca 2 timmar i rumstemperatur och dela sedan upp degen i 6 bollar(ca 280g st).\n5. Lägg varje boll i en egen lufttät låda och kalljäs i kylen minst 24 timmar. 48 timmar går också bra.\n6. Lägg lite mjöl på bordet och lägg bollen på. Forma till en cirkel och börja sedan stretcha degen försiktigt med händerna(kavel är olagligt).\n7. När degens form är klar lägger du på alla ingredienser som du vill.\n8. Förvärm en plåt i ugnen eller pizzasten på max värme och lägg sedan in pizzan i ca 7-8min beroende på ugn (Ännu bättre om du har en ordentlig pizzaugn!)",
    "main-course",
    "hard",
    "https://images.unsplash.com/photo-1537734796389-e1fc293cf856?q=80&w=685&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ),
];

// Förhindrar att testrecepten dubbleras efter man lagt till eget recept
if (recipes.length === 0) {
  recipes = testRecipes;
  localStorage.setItem("recipes", JSON.stringify(recipes));
}


// Uppdaterar receptlistan direkt vid sidladdning.
// Behövs för att localStorage ska fungera korrekt.
updateRecipeList();

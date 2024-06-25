const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const jeopardyBoard = $("#jeopardy");
let categories = [];

// Get ids from categories used in the game
function getCategoryIds(catIds) {
  let randomIds = _.sampleSize(catIds.data, NUM_CATEGORIES);
  return randomIds.map(cat => cat.id);
}

// Get data from each id provided
function getCategory(catData) {
  let clues = _.sampleSize(catData.data, NUM_QUESTIONS_PER_CAT);
  return {
    title: catData.data[0].category.title,
    clues: clues.map(clue => ({
      question: clue.question,
      answer: clue.answer,
      showing: null
    }))
  };
}

// Fill Jeopardy table with data
function fillTable() {
  console.log('Filling table with categories:', categories);
  let thead = $("thead");
  let tbody = $("tbody");

  // Create headers
  let headerRow = $("<tr>");
  categories.forEach(cat => {
    headerRow.append($("<th>").text(cat.title));
  });
  thead.empty().append(headerRow);

  // Create rows and cells
  tbody.empty();
  for (let y = 0; y < NUM_QUESTIONS_PER_CAT; y++) {
    let row = $("<tr>");
    for (let x = 0; x < NUM_CATEGORIES; x++) {
      let cell = $("<td>").html(`<div id="${x}-${y}">?</div>`);
      row.append(cell);
    }
    tbody.append(row);
  }
}

function handleClick(e) {
  let [x, y] = e.target.id.split('-').map(Number);
  let clue = categories[x].clues[y];
  let $cell = $(e.target);

  if ($cell.hasClass("answer")) {
    return;
  } else if ($cell.hasClass("question")) {
    $cell.text(clue.answer).removeClass("question").addClass("answer");
  } else {
    $cell.text(clue.question).addClass("question");
  }
}

async function setupAndStart() {
  try {
    console.log('Starting setup...');
    const resCategories = await axios.get("https://jservice.io/api/categories", { params: { count: 100 } });
    let catIds = getCategoryIds(resCategories);
    console.log('Category IDs:', catIds);

    let categoryPromises = catIds.map(id => axios.get("https://jservice.io/api/clues", { params: { category: id } }));
    let categoryData = await Promise.all(categoryPromises);
    console.log('Category Data:', categoryData);

    categories = categoryData.map(getCategory);
    console.log('Categories:', categories);

    fillTable();
  } catch (error) {
    console.error('Error setting up game:', error);
  }
}

// Reload page when restart button is pushed
$("#restart").on("click", () => location.reload());

// Start game and add event listener for Jeopardy board
$(document).ready(() => {
  setupAndStart();
  $("#jeopardy").on("click", "div", handleClick);
});

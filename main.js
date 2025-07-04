const linkOnCloseModal = document.querySelector(".close-button");
const linkOnThebackgdrop = document.querySelector(".backgdrop");
const linkOnTheModal = document.querySelector(".modal");
const linkOntheButtonOpenModal = document.querySelector(".create-block");
const linkOnInputName = document.querySelector(".input_name");
const linkOnButtonSaveName = document.querySelector(".name_block-button");
const linkOnTheList = document.querySelector(".bloks_list");

let blockCounter = 0;

linkOntheButtonOpenModal.addEventListener("click", () => {
  linkOnThebackgdrop.style.display = "block";
  linkOnTheModal.style.display = "block";
});

linkOnCloseModal.addEventListener("click", () => {
  linkOnThebackgdrop.style.display = "none";
  linkOnTheModal.style.display = "none";
});

linkOnButtonSaveName.addEventListener("click", () => {
  const inputValue = linkOnInputName.value.trim();
  blockCounter++;

  const blockData = {
    id: blockCounter,
    title: inputValue || `Блок №${blockCounter}`,
    trips: [""],
    result: 0
  };

  addBlockToDOM(blockData);
  saveAllBlocksToStorage();

  linkOnThebackgdrop.style.display = "none";
  linkOnTheModal.style.display = "none";
  linkOnInputName.value = "";
});

function addBlockToDOM(block) {
  const newLi = document.createElement("li");
  newLi.classList.add("bloks-item");
  newLi.setAttribute("data-block-id", block.id);

  const inputsHTML = block.trips
    .map(
      (value, index) =>
        `<input class="input-km" type="number" value="${value}" data-input-index="${index}">`
    )
    .join("");

  newLi.innerHTML = `
    <h2 class="name_block">${block.title}</h2>
    <div class="inputs-container">${inputsHTML}</div>
    <button type="button" class="add_travel">Нова поїздка</button>
    <button type="button" class="remove_travel">Видалити поїздку</button>
    <button type="button" class="calculate_sum">Результати</button>
    <h3 class="result_km">Разом: ${block.result} км</h3>
  `;

  newLi.querySelector(".add_travel").addEventListener("click", () => {
    const inputsContainer = newLi.querySelector(".inputs-container");
    const newInput = document.createElement("input");
    newInput.type = "number";
    newInput.classList.add("input-km");
    newInput.setAttribute("data-input-index", inputsContainer.children.length);
    inputsContainer.appendChild(newInput);
    updateBlockFromDOM(newLi);
  });

  newLi.querySelector(".remove_travel").addEventListener("click", () => {
    const inputsContainer = newLi.querySelector(".inputs-container");
    if (inputsContainer.children.length > 1) {
      inputsContainer.lastElementChild.remove();
      updateBlockFromDOM(newLi);
    }
  });

  newLi.querySelector(".calculate_sum").addEventListener("click", () => {
    const inputs = newLi.querySelectorAll(".input-km");
    let sum = 0;
    inputs.forEach((input) => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) sum += val;
    });

    const result = newLi.querySelector(".result_km");
    result.textContent = `Разом: ${sum} км`;

    updateBlockFromDOM(newLi, sum);
  });

  newLi.querySelectorAll(".input-km").forEach((input) => {
    input.addEventListener("input", () => updateBlockFromDOM(newLi));
  });

  linkOnTheList.appendChild(newLi);
  toggleClearAllButtonVisibility(); // ✅ перевірити видимість кнопки після додавання
}

function updateBlockFromDOM(liElement, resultOverride = null) {
  const id = parseInt(liElement.getAttribute("data-block-id"));
  const title = liElement.querySelector(".name_block").textContent;
  const inputs = liElement.querySelectorAll(".input-km");

  const trips = Array.from(inputs).map((inp) => inp.value);
  const result =
    resultOverride !== null
      ? resultOverride
      : liElement.querySelector(".result_km").textContent.match(/\d+/g)?.[0] || 0;

  const savedBlocks = JSON.parse(localStorage.getItem("blocks")) || [];

  const updatedBlocks = savedBlocks.map((block) => {
    if (block.id === id) {
      return {
        ...block,
        title,
        trips,
        result: parseInt(result)
      };
    }
    return block;
  });

  localStorage.setItem("blocks", JSON.stringify(updatedBlocks));
}

function saveAllBlocksToStorage() {
  const allLi = document.querySelectorAll(".bloks-item");
  const allBlocks = Array.from(allLi).map((li) => {
    const id = parseInt(li.getAttribute("data-block-id"));
    const title = li.querySelector(".name_block").textContent;
    const trips = Array.from(li.querySelectorAll(".input-km")).map((input) => input.value);
    const result = parseInt(li.querySelector(".result_km").textContent.match(/\d+/g)?.[0] || 0);

    return { id, title, trips, result };
  });

  localStorage.setItem("blocks", JSON.stringify(allBlocks));
}

// ✅ ДОДАНА КНОПКА ОЧИЩЕННЯ ВСІХ БЛОКІВ
const clearAllButton = document.createElement("button");
clearAllButton.textContent = "Очистити всі блоки";
clearAllButton.classList.add("clear-all-btn");
clearAllButton.style.marginTop = "20px";
clearAllButton.style.display = "none"; // Початково прихована

linkOnTheList.parentNode.insertBefore(clearAllButton, linkOnTheList.nextSibling);

clearAllButton.addEventListener("click", () => {
  if (confirm("Ви впевнені, що хочете видалити всі блоки?")) {
    localStorage.removeItem("blocks");
    linkOnTheList.innerHTML = "";
    blockCounter = 0;
    toggleClearAllButtonVisibility(); // ✅ ховаємо кнопку
  }
});

// ✅ Показувати/ховати кнопку
function toggleClearAllButtonVisibility() {
  const hasBlocks = linkOnTheList.querySelectorAll(".bloks-item").length > 0;
  clearAllButton.style.display = hasBlocks ? "block" : "none";
}

window.addEventListener("load", () => {
  const savedBlocks = JSON.parse(localStorage.getItem("blocks")) || [];
  savedBlocks.forEach((block) => {
    if (block.id > blockCounter) blockCounter = block.id;
    addBlockToDOM(block);
  });
  toggleClearAllButtonVisibility(); // ✅ перевірка після завантаження
});

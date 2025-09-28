const PLANTS = {
  sunflower: { cost: 50, emoji: "🌻", type: "sun", health: 60, interval: 5000 },
  shooter:   { cost: 100, emoji: "🌱", type: "shooter", health: 80, interval: 1500 },
  wallnut:   { cost: 50, emoji: "🥥", type: "wall", health: 200 }
};
const ZOMBIE = { emoji: "🧟", health: 100, speed: 0.05, spawnInterval: 4000 };


let state = {
  grid: [],
  plants: [],
  zombies: [],
  bullets: [],
  suns: 50,
  running: false,
  selectedPlant: null
};

function init() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  state.grid = [];

  for (let r = 0; r < 5; r++) {
    let row = [];
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => placePlant(r, c));
      grid.appendChild(cell);
      row.push(null);
    }
    state.grid.push(row);
  }

  buildShop();
}

function buildShop() {
  const shop = document.getElementById("shop");
  shop.innerHTML = "";
  Object.keys(PLANTS).forEach(key => {
    const item = PLANTS[key];
    const div = document.createElement("div");
    div.className = "shop-item";
    div.innerHTML = `${item.emoji}<br>☀${item.cost}`;
    div.addEventListener("click", () => {
      state.selectedPlant = key;
    });
    shop.appendChild(div);
  });
}

function placePlant(r, c) {
  if (!state.selectedPlant) return;
  if (state.grid[r][c]) return;

  const plant = PLANTS[state.selectedPlant];
  if (state.suns < plant.cost) return;

  state.suns -= plant.cost;
  updateSunCounter();

  const p = { ...plant, row: r, col: c, health: plant.health, lastAction: Date.now() };
  state.plants.push(p);
  state.grid[r][c] = p;

  const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
  const div = document.createElement("div");
  div.className = "plant";
  div.textContent = plant.emoji;
  cell.appendChild(div);
}

function spawnZombie() {
  const row = Math.floor(Math.random() * 5);
  const z = { emoji: ZOMBIE.emoji, row, x: 8, health: ZOMBIE.health };
  state.zombies.push(z);
}

function updateSunCounter() {
  document.getElementById("sunCounter").textContent = "☀ " + state.suns;
}

function gameLoop() {
  if (!state.running) return;
  const now = Date.now();

  state.plants.forEach(p => {
    if (p.type === "sun" && now - p.lastAction > p.interval) {
      state.suns += 25;
      updateSunCounter();
      p.lastAction = now;
    }
    if (p.type === "shooter" && now - p.lastAction > p.interval) {
      state.bullets.push({ row: p.row, x: p.col + 0.5 });
      p.lastAction = now;
    }
  });

  state.bullets.forEach(b => {
    b.x += 0.2;
    state.zombies.forEach(z => {
      if (z.row === b.row && Math.abs(z.x - b.x) < 0.5) {
        z.health -= 20;
        b.dead = true;
      }
    });
  });
  state.bullets = state.bullets.filter(b => !b.dead);

  state.zombies.forEach(z => {
    z.x -= ZOMBIE.speed;
    if (z.x < 0) {
      alert("Зомби съели твой мозг! 💀");
      resetGame();
    }
  });
  state.zombies = state.zombies.filter(z => z.health > 0);

  render();
}

function render() {
  document.querySelectorAll(".cell").forEach(cell => cell.innerHTML = "");

  state.plants.forEach(p => {
    const cell = document.querySelector(`.cell[data-row="${p.row}"][data-col="${p.col}"]`);
    const div = document.createElement("div");
    div.className = "plant";
    div.textContent = p.emoji;
    cell.appendChild(div);
  });

  state.zombies.forEach(z => {
    const rowCells = document.querySelectorAll(`.cell[data-row="${z.row}"]`);
    if (rowCells.length > 0) {
      const div = document.createElement("div");
      div.className = "zombie";
      div.style.left = (z.x * 70) + "px";
      div.textContent = z.emoji;
      rowCells[0].appendChild(div);
    }
  });

  state.bullets.forEach(b => {
    const rowCells = document.querySelectorAll(`.cell[data-row="${b.row}"]`);
    if (rowCells.length > 0) {
      const div = document.createElement("div");
      div.className = "bullet";
      div.style.left = (b.x * 70) + "px";
      div.textContent = "•";
      rowCells[0].appendChild(div);
    }
  });
}

function startGame() {
  if (!state.running) {
    state.running = true;
    state.interval = setInterval(gameLoop, 100);
    // задержка 30 секунд перед появлением первого зомби
    setTimeout(() => {
      if (state.running) {
        state.zombieTimer = setInterval(spawnZombie, ZOMBIE.spawnInterval);
      }
    }, 30000); // 30000 мс = 30 секунд
  }
}

function pauseGame() {
  state.running = false;
  clearInterval(state.interval);
  clearInterval(state.zombieTimer);
}

function resetGame() {
  pauseGame();
  state = { grid: [], plants: [], zombies: [], bullets: [], suns: 50, running: false, selectedPlant: null };
  updateSunCounter();
  init();
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);

init();
updateSunCounter();

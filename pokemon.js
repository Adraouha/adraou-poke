const STORAGE_KEY = 'pokeAventuraSave';
const CAPTURE_CHANCE = 0.7;

const starters = [
  {
    id: 1,
    name: 'Bulbasaur',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif',
    bonus: 10
  },
  {
    id: 4,
    name: 'Charmander',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/4.gif',
    bonus: 10
  },
  {
    id: 7,
    name: 'Squirtle',
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/7.gif',
    bonus: 10
  }
];

const gameState = {
  scene: 'pueblo',
  points: 0,
  coins: 10,
  potions: 0,
  starter: null,
  capturedPokemon: [],
  wildEncounter: null
};

const dom = {
  statusScene: document.getElementById('status-scene'),
  statusPoints: document.getElementById('status-points'),
  statusCoins: document.getElementById('status-coins'),
  statusPotions: document.getElementById('status-potions'),
  message: document.getElementById('message'),
  starterOptions: document.getElementById('starter-options'),
  wildText: document.getElementById('wild-text'),
  wildDetails: document.getElementById('wild-details'),
  bosqueActions: document.getElementById('bosque-actions'),
  ciudadActions: document.getElementById('ciudad-actions'),
  finalBox: document.getElementById('final-box'),
  capturedList: document.getElementById('captured-list'),
  searchInput: document.getElementById('search-input'),
  searchButton: document.getElementById('search-button'),
  searchResult: document.getElementById('search-result'),
  restartButton: document.getElementById('restart-button'),
  animation: document.getElementById('animation')
};

const sceneTitles = {
  pueblo: 'Pueblo Paleta',
  bosque: 'Bosque',
  ciudad: 'Ciudad',
  cueva: 'Cueva final',
  batalla: 'Arena de Batalla'
};

const scenes = {
  pueblo: document.getElementById('scene-pueblo'),
  bosque: document.getElementById('scene-bosque'),
  ciudad: document.getElementById('scene-ciudad'),
  cueva: document.getElementById('scene-cueva'),
  batalla: document.getElementById('scene-batalla')
};

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      Object.assign(gameState, parsed);
    }
  } catch (error) {
    console.warn('No se pudo cargar la partida:', error);
  }
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  gameState.scene = 'pueblo';
  gameState.points = 0;
  gameState.coins = 10;
  gameState.potions = 0;
  gameState.starter = null;
  gameState.capturedPokemon = [];
  gameState.wildEncounter = null;
  showScene('pueblo');
  setMessage('Bienvenido a tu aventura Pokémon. Elige tu inicial para comenzar.');
  renderCaptured();
  renderScene();
  saveGame();
}

function showScene(sceneKey) {
  Object.values(scenes).forEach((section) => section.classList.remove('active'));
  const next = scenes[sceneKey];
  if (next) next.classList.add('active');
  dom.statusScene.textContent = `Escena: ${sceneTitles[sceneKey]}`;
  gameState.scene = sceneKey;
  saveGame();
  renderScene();
}

function setMessage(text) {
  dom.message.textContent = text;
}

function updateStatusBar() {
  dom.statusPoints.textContent = `Puntos: ${gameState.points}`;
  dom.statusCoins.textContent = `Monedas: ${gameState.coins}`;
  dom.statusPotions.textContent = `Pociones: ${gameState.potions}`;
}

function renderStarterOptions() {
  dom.starterOptions.innerHTML = '';
  starters.forEach((starter) => {
    const card = document.createElement('button');
    card.className = 'starter-card control-button';
    card.innerHTML = `
      <img src="${starter.image}" alt="${starter.name}" />
      <strong>${starter.name}</strong>
      <span>+${starter.bonus} puntos iniciales</span>
    `;
    card.addEventListener('click', () => chooseStarter(starter.id));
    dom.starterOptions.appendChild(card);
  });
}

function chooseStarter(starterId) {
  const starter = starters.find((item) => item.id === starterId);
  if (!starter) return;

  gameState.starter = starter;
  gameState.capturedPokemon.push({
    id: starter.id,
    name: starter.name,
    image: starter.image
  });
  gameState.points += starter.bonus;
  gameState.coins += 5;
  setMessage(`Has elegido a ${starter.name}. Obtienes ${starter.bonus} puntos y 5 monedas.`);
  triggerAnimation();
  saveGame();
  renderCaptured();
  showScene('bosque');
}

async function fetchPokemonData(value) {
  const url = `https://pokeapi.co/api/v2/pokemon/${value.toString().toLowerCase()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Pokémon no encontrado');
  const pokemon = await response.json();
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.versions['generation-v']['black-white'].animated.front_default || pokemon.sprites.front_default,
    types: pokemon.types.map((item) => item.type.name).join(', ')
  };
}

async function fetchRandomPokemon() {
  const id = Math.floor(Math.random() * 151) + 1;
  const pokemon = await fetchPokemonData(id);
  gameState.wildEncounter = pokemon;
  saveGame();
  renderScene();
}

function renderWildEncounter() {
  if (!gameState.wildEncounter) {
    dom.wildText.textContent = '¡Busca un Pokémon salvaje en el bosque!';
    dom.wildDetails.innerHTML = '';
    dom.bosqueActions.innerHTML = '<button class="control-button" id="button-search">Buscar Pokémon salvaje</button>';
    document.getElementById('button-search').addEventListener('click', async () => {
      setMessage('Buscando un Pokémon salvaje...');
      try {
        await fetchRandomPokemon();
        setMessage('¡Encontraste un Pokémon salvaje! Intenta capturarlo o huye.');
      } catch (error) {
        setMessage('No se pudo conectar con la PokéAPI. Intenta de nuevo.');
      }
    });
    dom.bosqueActions.insertAdjacentHTML('beforeend', '<button class="control-button" id="button-next-city">Ir a Ciudad</button>');
    document.getElementById('button-next-city').addEventListener('click', () => showScene('ciudad'));
  } else {
    const wild = gameState.wildEncounter;
    dom.wildText.textContent = `¡Apareció un ${capitalize(wild.name)} salvaje!`;
    dom.wildDetails.innerHTML = `
      <div class="captured-item">
        <img src="${wild.image}" alt="${wild.name}" />
        <strong>${capitalize(wild.name)}</strong>
        <p>ID: ${wild.id}</p>
      </div>
    `;
    dom.bosqueActions.innerHTML = `
      <button class="control-button" id="button-catch">Capturar</button>
      <button class="control-button" id="button-run">Huir</button>
      <button class="control-button" id="button-next-city">Avanzar a Ciudad</button>
    `;

    document.getElementById('button-catch').addEventListener('click', attemptCatch);
    document.getElementById('button-run').addEventListener('click', () => {
      gameState.wildEncounter = null;
      saveGame();
      setMessage('Huiste del encuentro. Sigue explorando o avanza a Ciudad.');
      renderScene();
    });
    document.getElementById('button-next-city').addEventListener('click', () => showScene('ciudad'));
  }
}

function attemptCatch() {
  const success = Math.random() < CAPTURE_CHANCE;
  const wild = gameState.wildEncounter;

  if (!wild) return;

  if (success) {
    const exists = gameState.capturedPokemon.some((poke) => poke.id === wild.id);
    if (!exists) {
      gameState.capturedPokemon.push(wild);
      gameState.points += 10;
      gameState.coins += 5;
      setMessage(`¡Capturaste a ${capitalize(wild.name)}! Obtienes +10 puntos y +5 monedas.`);
      triggerAnimation();
    } else {
      setMessage(`Ya tenías a ${capitalize(wild.name)} en tu colección.`);
    }
  } else {
    setMessage(`No lograste capturar a ${capitalize(wild.name)}. Intenta de nuevo o huye.`);
  }

  gameState.wildEncounter = null;
  saveGame();
  renderCaptured();
  renderScene();
}

function renderCityActions() {
  dom.ciudadActions.innerHTML = `
    <button class="control-button" id="button-buy-potion">Comprar poción (5 monedas)</button>
    <button class="control-button" id="button-use-potion">Usar poción</button>
    <button class="control-button" id="button-next-cave">Ir a la Cueva</button>
  `;

  document.getElementById('button-buy-potion').addEventListener('click', buyPotion);
  document.getElementById('button-use-potion').addEventListener('click', usePotion);
  document.getElementById('button-next-cave').addEventListener('click', () => showScene('cueva'));
}

function buyPotion() {
  if (gameState.coins < 5) {
    setMessage('No tienes monedas suficientes para comprar una poción.');
    return;
  }

  gameState.coins -= 5;
  gameState.potions += 1;
  setMessage('Compraste una poción. ¡Úsala para ganar puntos extra!');
  triggerAnimation();
  saveGame();
  updateStatusBar();
}

function usePotion() {
  if (gameState.potions <= 0) {
    setMessage('No tienes pociones disponibles. Compra una en Ciudad.');
    return;
  }

  gameState.potions -= 1;
  gameState.points += 8;
  setMessage('Usaste una poción y recuperaste energía. +8 puntos.');
  triggerAnimation();
  saveGame();
  updateStatusBar();
}

function renderCave() {
  const capturedCount = gameState.capturedPokemon.length;
  let resultText = '';

  if (gameState.points >= 30 && capturedCount >= 3) {
    resultText = '¡Victoria total! Tu habilidad y tus capturas te llevaron al triunfo en la cueva final.';
  } else if (gameState.points >= 20 || capturedCount >= 2) {
    resultText = 'Buen final. Lograste una aventura sólida, pero aún puedes mejorar en la próxima partida.';
  } else {
    resultText = 'Final correcto. Sigue explorando, capturando más y usando pociones para dominar la siguiente aventura.';
  }

  dom.finalBox.innerHTML = `
    <p>${resultText}</p>
    <p>Tu puntaje total es <strong>${gameState.points}</strong> con <strong>${capturedCount}</strong> Pokémon capturados.</p>
    <button class="control-button" id="button-restart-end">Reiniciar partida</button>
  `;

  document.getElementById('button-restart-end').addEventListener('click', resetGame);
}

function renderScene() {
  updateStatusBar();
  switch (gameState.scene) {
    case 'pueblo':
      renderStarterOptions();
      break;
    case 'bosque':
      renderWildEncounter();
      break;
    case 'ciudad':
      renderCityActions();
      break;
    case 'cueva':
      renderCave();
      break;
  }
}

function renderCaptured() {
  dom.capturedList.innerHTML = '';
  if (gameState.capturedPokemon.length === 0) {
    dom.capturedList.textContent = 'No hay Pokémon aún.';
    return;
  }

  gameState.capturedPokemon.forEach((poke) => {
    const item = document.createElement('div');
    item.className = 'captured-item';
    item.innerHTML = `
      <img src="${poke.image}" alt="${poke.name}" />
      <strong>${capitalize(poke.name)}</strong>
      <p>ID: ${poke.id}</p>
    `;
    dom.capturedList.appendChild(item);
  });
}

async function searchPokemon() {
  const query = dom.searchInput.value.trim();
  if (!query) {
    setMessage('Ingresa un nombre o ID para buscar en la Pokédex externa.');
    return;
  }

  dom.searchResult.innerHTML = '<p>Buscando Pokémon...</p>';
  try {
    const pokemon = await fetchPokemonData(query);
    const alreadyCaptured = gameState.capturedPokemon.some((poke) => poke.id === pokemon.id);
    const buttonHtml = alreadyCaptured
      ? '<button class="control-button" disabled>Ya capturado</button>'
      : '<button class="control-button" id="button-add-collection">Añadir a la colección</button>';

    dom.searchResult.innerHTML = `
      <div class="captured-item">
        <img src="${pokemon.image}" alt="${pokemon.name}" />
        <strong>${capitalize(pokemon.name)}</strong>
        <p>ID: ${pokemon.id}</p>
        <p>Tipos: ${pokemon.types}</p>
        ${buttonHtml}
      </div>
    `;

    if (!alreadyCaptured) {
      document.getElementById('button-add-collection').addEventListener('click', () => {
        gameState.capturedPokemon.push(pokemon);
        gameState.points += 5;
        setMessage(`Añadiste ${capitalize(pokemon.name)} a la colección desde la Pokédex externa. +5 puntos.`);
        triggerAnimation();
        saveGame();
        renderCaptured();
        searchPokemon();
      });
    }
  } catch (error) {
    dom.searchResult.innerHTML = `<p>No se encontró el Pokémon. Verifica el nombre o número.</p>`;
  }
}

function triggerAnimation() {
  dom.animation.classList.remove('pokeball-animate');
  void dom.animation.offsetWidth;
  dom.animation.classList.add('pokeball-animate');
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* ------------------ Batalla: estado, controles y audio ------------------ */
const battleState = {
  player: null,
  enemy: null,
  playerHP: 100,
  enemyHP: 100,
  maxHP: 100,
  selectedMove: null,
  busy: false
};

const battleMoves = [
  { name: 'Ataque Rápido', dmg: 8 },
  { name: 'Chispazo', dmg: 12 },
  { name: 'Placaje', dmg: 6 },
  { name: 'Ataque Fuerte', dmg: 18 }
];

let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playBeep(freq = 440, time = 0.06, type = 'sine') {
  try {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.01);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
    o.stop(audioCtx.currentTime + time + 0.02);
  } catch (e) {
    // fall back silently if audio blocked
  }
}

function logBattle(text) {
  const el = document.getElementById('battle-log');
  if (!el) return;
  const p = document.createElement('div');
  p.textContent = text;
  el.prepend(p);
}

function startBattle() {
  if (battleState.busy) return;
  // choose player: first captured or starter
  const playerPoke = gameState.capturedPokemon[0] || gameState.starter;
  if (!playerPoke) {
    setMessage('No tienes Pokémon para combatir. Captura alguno primero.');
    return;
  }

  // choose enemy random (fetchRandomPokemon)
  battleState.busy = true;
  setMessage('Preparando combate...');
  fetchRandomPokemon().then(() => {
    const enemy = gameState.wildEncounter;
    // deep copy to avoid mutating saved wild
    battleState.player = Object.assign({}, playerPoke);
    battleState.enemy = Object.assign({}, enemy);
    battleState.maxHP = 100;
    battleState.playerHP = 100;
    battleState.enemyHP = 100;
    battleState.selectedMove = null;
    battleState.busy = false;
    showScene('batalla');
    renderBattle();
    setMessage('¡Combate iniciado! Usa 1-4 y Enter para atacar.');
  }).catch((err) => {
    battleState.busy = false;
    setMessage('No se pudo iniciar combate: ' + err.message);
  });
}

function renderBattle() {
  const playerImg = document.getElementById('battle-player-img');
  const enemyImg = document.getElementById('battle-enemy-img');
  const playerName = document.getElementById('player-name');
  const enemyName = document.getElementById('enemy-name');
  const playerHpInner = document.getElementById('player-hp-inner');
  const enemyHpInner = document.getElementById('enemy-hp-inner');
  const moveList = document.getElementById('move-list');

  if (!battleState.player || !battleState.enemy) return;

  playerImg.src = battleState.player.image;
  enemyImg.src = battleState.enemy.image;
  playerName.textContent = capitalize(battleState.player.name || 'Tu Pokémon');
  enemyName.textContent = capitalize(battleState.enemy.name || 'Enemigo');

  playerHpInner.style.width = (battleState.playerHP / battleState.maxHP * 100) + '%';
  enemyHpInner.style.width = (battleState.enemyHP / battleState.maxHP * 100) + '%';

  moveList.innerHTML = '';
  battleMoves.forEach((m, idx) => {
    const btn = document.createElement('button');
    btn.className = 'move-button';
    btn.id = 'move-' + idx;
    btn.textContent = `${idx+1}. ${m.name} (${m.dmg})`;
    if (battleState.selectedMove === idx) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      battleState.selectedMove = idx;
      renderBattle();
      playerConfirmMove();
    });
    moveList.appendChild(btn);
  });

  // bind keyboard for battle
  document.removeEventListener('keydown', battleKeyHandler);
  document.addEventListener('keydown', battleKeyHandler);
}

function battleKeyHandler(e) {
  if (gameState.scene !== 'batalla') return;
  if (battleState.busy) return;
  if (['1','2','3','4'].includes(e.key)) {
    battleState.selectedMove = parseInt(e.key,10) - 1;
    renderBattle();
    e.preventDefault();
  } else if (e.key === 'Enter') {
    playerConfirmMove();
    e.preventDefault();
  } else if (e.key === 'Escape') {
    // exit battle
    gameState.wildEncounter = null;
    showScene('bosque');
    setMessage('Has salido del combate.');
  }
}

function playerConfirmMove() {
  if (battleState.selectedMove == null) {
    setMessage('Selecciona un movimiento 1-4 antes de confirmar.');
    return;
  }
  if (battleState.busy) return;
  performPlayerAttack(battleState.selectedMove);
}

function performPlayerAttack(moveIdx) {
  battleState.busy = true;
  const move = battleMoves[moveIdx];
  const dmg = move.dmg + Math.floor(Math.random()*4) - 1; // slight variance

  // animate player attack
  const playerImg = document.getElementById('battle-player-img');
  playerImg.classList.add('attack-move');
  playBeep(700, 0.07, 'sawtooth');
  logBattle(`Tu Pokémon usa ${move.name} y causa ${dmg} daño.`);

  setTimeout(() => {
    playerImg.classList.remove('attack-move');
    // reduce enemy HP
    battleState.enemyHP = Math.max(0, battleState.enemyHP - dmg);
    document.getElementById('enemy-hp-inner').style.width = (battleState.enemyHP / battleState.maxHP * 100) + '%';
    document.getElementById('battle-enemy-img').classList.add('shake');
    playBeep(320, 0.08, 'square');

    setTimeout(() => {
      document.getElementById('battle-enemy-img').classList.remove('shake');
      if (battleState.enemyHP <= 0) {
        endBattle(true);
      } else {
        // enemy turn
        setTimeout(() => performEnemyAttack(), 700);
      }
    }, 250);

  }, 350);
}

function performEnemyAttack() {
  const enemyMove = battleMoves[Math.floor(Math.random() * battleMoves.length)];
  const dmg = enemyMove.dmg + Math.floor(Math.random()*3) - 1;
  logBattle(`Enemigo usa ${enemyMove.name} y causa ${dmg} daño.`);
  const enemyImg = document.getElementById('battle-enemy-img');
  enemyImg.classList.add('attack-move');
  playBeep(380, 0.06, 'sine');

  setTimeout(() => {
    enemyImg.classList.remove('attack-move');
    battleState.playerHP = Math.max(0, battleState.playerHP - dmg);
    document.getElementById('player-hp-inner').style.width = (battleState.playerHP / battleState.maxHP * 100) + '%';
    document.getElementById('battle-player-img').classList.add('shake');
    playBeep(220, 0.08, 'square');

    setTimeout(() => {
      document.getElementById('battle-player-img').classList.remove('shake');
      if (battleState.playerHP <= 0) {
        endBattle(false);
      } else {
        battleState.busy = false;
        setMessage('Tu turno: selecciona un movimiento (1-4) y pulsa Enter.');
      }
    }, 250);
  }, 300);
}

function endBattle(playerWon) {
  battleState.busy = true;
  if (playerWon) {
    logBattle('¡Has vencido al Pokémon enemigo!');
    setMessage('Victoria en combate. Recibes +12 puntos y +6 monedas.');
    gameState.points += 12;
    gameState.coins += 6;
    // add enemy to collection
    const enemy = battleState.enemy;
    const exists = gameState.capturedPokemon.some(p => p.id === enemy.id);
    if (!exists) gameState.capturedPokemon.push(enemy);
  } else {
    logBattle('Has sido derrotado en combate. Vuelve a intentarlo.');
    setMessage('Has perdido el combate. Regresas al bosque para recuperarte.');
    // small penalty
    gameState.points = Math.max(0, gameState.points - 4);
  }
  saveGame();
  renderCaptured();
  // after short delay, return to bosque
  setTimeout(() => {
    gameState.wildEncounter = null;
    showScene('bosque');
    battleState.busy = false;
  }, 1200);
}


function bindEvents() {
  dom.searchButton.addEventListener('click', searchPokemon);
  dom.searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') searchPokemon();
  });
  dom.restartButton.addEventListener('click', resetGame);
  const startBattleBtn = document.getElementById('start-battle-button');
  if (startBattleBtn) startBattleBtn.addEventListener('click', startBattle);
}

function initializeGame() {
  loadGame();
  bindEvents();

  if (!gameState.starter) {
    gameState.scene = 'pueblo';
    gameState.wildEncounter = null;
  }

  showScene(gameState.scene);
  renderCaptured();
}

initializeGame();

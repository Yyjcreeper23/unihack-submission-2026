const habitat = document.getElementById("habitat")

const rows = 8
const cols = 12
const tileSize = 80

const decorations = ["flower", "mushroom", "rock", "none", "none", "none"]

// generate tiles
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {

    const tile = document.createElement("div")

    const grassVariant = Math.floor(Math.random() * 3) + 1
    const deco = decorations[Math.floor(Math.random() * decorations.length)]

    tile.className = `tile grass-${grassVariant}`

    if (deco !== "none") {
      tile.classList.add(deco)
    }

    habitat.appendChild(tile)
  }
}

// monster roaming

const monsters = document.querySelectorAll(".monster")

function moveMonster(monster) {

  const row = Math.floor(Math.random() * rows)
  const col = Math.floor(Math.random() * cols)

  const offset = 16

  monster.style.left = `${col * tileSize + offset}px`
  monster.style.top = `${row * tileSize + offset}px`
}

monsters.forEach(monster => {

  moveMonster(monster)

  setInterval(() => {
    moveMonster(monster)
  }, 3000 + Math.random() * 2000)

})
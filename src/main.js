import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { EffectComposer } from 'three/examples/jsm/Addons.js'
import { RenderPass } from 'three/examples/jsm/Addons.js'
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x161225)

const camera = new THREE.PerspectiveCamera(
  120,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  100
)
bloomPass.threshold = 0
bloomPass.strength = 0.2
bloomPass.radius = 0
const composer = new EffectComposer(renderer)
composer.addPass(renderScene)
composer.addPass(bloomPass)

// const orbitControls = new OrbitControls(camera, renderer.domElement)

// Menu UI Logic//
function resetParams() {
  velocity = 1
  velocityRamp = 1
  ship.position.set(0, 0, 1)
  shipTurnSpeed = 0
  ship.rotation.z = 0
  camera.position.set(1, 3, 10)
  shipBB.copy(ship.geometry.boundingBox).applyMatrix4(ship.matrixWorld)
  ship.material.color = new THREE.Color(0xeeeeee)
}

function startGame() {
  resetParams()
  velocityRamp = 1.0003
  setTimeout(() => {
    ;(gameStart = true), (timer = 0), (timerId = setInterval(addTime, 100))
  }, 100)
}

const gameMenu = document.getElementById('menu')
const gameOver = document.getElementById('gameOver')

const startButton = document.getElementById('startButton')
startButton.addEventListener('click', function () {
  gameMenu.classList.add('hide')

  startGame()
})

const tryAgainButton = document.getElementById('tryAgain')
tryAgainButton.addEventListener('click', function () {
  const gameOver = document.getElementById('gameOver')
  gameOver.classList.add('hide')
  startGame()
})

const exitResult = document.getElementById('exitResult')
exitResult.addEventListener('click', function () {
  resetParams()
  gameMenu.classList.remove('hide')
  gameOver.classList.add('hide')
})

const aboutMe = document.getElementById('aboutMe')
const showAboutMe = document.getElementById('showAboutMe')
showAboutMe.addEventListener('click', function () {
  gameMenu.classList.add('hide')
  aboutMe.classList.remove('hide')
})

const exitAbout = document.getElementById('exitAbout')
exitAbout.addEventListener('click', function () {
  resetParams()
  gameMenu.classList.remove('hide')
  aboutMe.classList.add('hide')
})

// Music //

function setVolume() {
  const bgm = document.getElementById('bgm')
  bgm.volume = 0.15
}
setVolume()

window.addEventListener('click', () => {
  bgm.play()
})

// Sound Effect //
const explodeSFX1 = new Audio('/8-bit-explosion-3-340456.mp3')
const explodeSFX2 = new Audio('/8-bit-explosion-10-340462.mp3')
const explodeSFX3 = new Audio('/explosion-9-340460.mp3')

const explosions = [explodeSFX1, explodeSFX2, explodeSFX3]
explosions.forEach((sfx) => (sfx.volume = 0.15))

// Field //
const fieldGeometry = new THREE.PlaneGeometry(1000, 1000)
const fieldMaterial = new THREE.MeshBasicMaterial({
  // color: 0xd2bca5,
  color: 0x20293e,
})

const field = new THREE.Mesh(fieldGeometry, fieldMaterial)
field.rotation.x = -Math.PI / 2
field.position.y = -4
field.receiveShadow = true
scene.add(field)

// Ship Body //
const length = 2,
  width = 0.1

const shape = new THREE.Shape()
shape.moveTo(0, 0)
shape.lineTo(0, width)
shape.lineTo(length, width)
shape.lineTo(length, 0)
shape.lineTo(0, 0)

const extrudeSettings = {
  steps: 2,
  depth: 3,
  bevelEnabled: true,
  bevelThickness: 1.2,
  bevelSize: 1,
  bevelOffset: 0.5,
  bevelSegments: 1,
}

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
const material = new THREE.MeshStandardMaterial({
  color: 0xeeeeee,
  flatShading: true,
})

const ship = new THREE.Mesh(geometry, material)
ship.castShadow = true
ship.receiveShadow = true

ship.position.set(0, 0, 1)

scene.add(ship)

// Ship Bounding Box //
const shipBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
shipBB.setFromObject(ship)

// Game Logic //
let gameStart = false
let highScore = 0
const displayHighScore = document.getElementById('highScore')

// Timer //
let timer = 0
let timerId = null

function addTime() {
  const displayTime = document.getElementById('timer')
  timer += 0.5
  displayTime.innerText = timer.toFixed(0)
}

// Collision Logic //

function collision() {
  explosions[randomNumber(0, 2)].play()
  gameStart = false
  ship.material.color = new THREE.Color(0xec0000)
  velocity = 0
  velocityRamp = 1
  clearInterval(timerId)
  if (timer > highScore) {
    highScore = timer.toFixed(0)
    displayHighScore.innerText = `High Score: ${highScore}`
  }

  gameOver.classList.remove('hide')
}

function checkCollision() {
  allBuildingsBB.forEach((buildings) => {
    if (shipBB.intersectsBox(buildings)) collision()
  })
  allBoundariesBB.forEach((boundary) => {
    if (shipBB.intersectsBox(boundary)) collision()
  })
}

// Buildings //
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

function createBuilding() {
  // Building Dimensions //
  const buildingWidth = Math.round(randomNumber(10, 20))
  const buildingHeight = Math.round(randomNumber(20, 100))
  const buildingDepth = Math.round(randomNumber(10, 20))

  // Building Spawn Points //
  const beforeGamePos = [
    Math.round(randomNumber(-110, -20)),
    Math.round(randomNumber(110, 20)),
  ]
  const buildingPosX = beforeGamePos[randomNumber(0, 1)]
  const buildingPosY = -5
  const buildingPosZ = Math.round(randomNumber(0, -1000)) - 100

  const buildingGeometry = new THREE.BoxGeometry(
    buildingWidth,
    buildingHeight,
    buildingDepth
  )
  const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xd5d5d5 })

  const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial)
  buildingMesh.position.set(buildingPosX, buildingPosY, buildingPosZ)

  return buildingMesh
}

const numOfBuildings = 15
const allBuildings = Array(numOfBuildings).fill().map(createBuilding)

allBuildings.forEach((mesh) => scene.add(mesh))

// Buildings Bounding Box //
function createBoundingBox(targetMesh) {
  const newBoundingBox = new THREE.Box3(
    new THREE.Vector3(),
    new THREE.Vector3()
  )
  newBoundingBox.setFromObject(targetMesh)

  return newBoundingBox
}

const allBuildingsBB = allBuildings.map((mesh) => createBoundingBox(mesh))

// Side Boundaries //
function createBoundary(minX, maxX, axisZ) {
  const boundaryWidth = 20
  const boundaryHeight = Math.round(randomNumber(40, 60))
  const boundaryDepth = 400

  // Building Spawn Points //
  const boundaryPosX = Math.round(randomNumber(minX, maxX))
  const boundaryPosY = -5
  const boundaryPosZ = axisZ

  const boundaryGeometry = new THREE.BoxGeometry(
    boundaryWidth,
    boundaryHeight,
    boundaryDepth
  )
  const boundaryMaterial = new THREE.MeshStandardMaterial({ color: 0xd5d5d5 })

  const boundaryMesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial)
  boundaryMesh.position.set(boundaryPosX, boundaryPosY, boundaryPosZ)

  return boundaryMesh
}

const allBoundaries = [
  createBoundary(-130, -140, 0),
  createBoundary(-130, -140, -400),
  createBoundary(-130, -140, -800),
  createBoundary(-130, -140, -1200),
  createBoundary(130, 140, 0),
  createBoundary(130, 140, -400),
  createBoundary(130, 140, -800),
  createBoundary(130, 140, -1200),
]

allBoundaries.forEach((boundary) => scene.add(boundary))
const allBoundariesBB = allBoundaries.map((mesh) => createBoundingBox(mesh))

// Axes Helper //
// const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

// camera.position.set(1, 3, 10)

// Light //
const light = new THREE.DirectionalLight(0xffffff, 3)
light.position.set(0, 10, 10)
scene.add(light)

// PC Controls //
const keyPress = {}

document.addEventListener('keydown', function (event) {
  switch (event.key) {
    case 'a':
    case 'ArrowLeft':
      keyPress.left = true
      break
    case 'd':
    case 'ArrowRight':
      keyPress.right = true
      break
  }
})

document.addEventListener('keyup', function (event) {
  switch (event.key) {
    case 'a':
    case 'ArrowLeft':
      keyPress.left = false
      break
    case 'd':
    case 'ArrowRight':
      keyPress.right = false
      break
  }
})

// Mobile Controls //

document.addEventListener('touchstart', function (event) {
  const touch = event.touches[0]
  if (touch.clientX < window.innerWidth / 2) {
    keyPress.left = true
    keyPress.right = false
  }
  if (touch.clientX > window.innerWidth / 2) {
    keyPress.left = false
    keyPress.right = true
  }
})

document.addEventListener('touchend', function (event) {
  keyPress.left = false
  keyPress.right = false
})

// Animation //
let velocity = 1
let velocityRamp = 1
let shipTurnSpeed = 0
const shipMaxTurnSpeed = 0.8
const acceleration = 0.02
const forceFeedback = 0.04

const camAcceleration = 0.8
const camReadjust = 0.08

function animate() {
  velocity *= velocityRamp

  // Controls //
  if (!gameStart) {
  }
  if (gameStart) {
    if (keyPress.left) {
      if (shipTurnSpeed > -shipMaxTurnSpeed) shipTurnSpeed -= acceleration
      if (ship.rotation.z < shipMaxTurnSpeed) ship.rotation.z += acceleration
      if (camera.position.x > -100) camera.position.x -= camAcceleration
    }
    if (keyPress.right) {
      if (shipTurnSpeed < shipMaxTurnSpeed) shipTurnSpeed += acceleration
      if (ship.rotation.z > -shipMaxTurnSpeed) ship.rotation.z -= acceleration
      if (camera.position.x - 1 < 100) camera.position.x += camAcceleration
    }
    if (!keyPress.left) {
      if (shipTurnSpeed < 0) {
        shipTurnSpeed += forceFeedback
      }
      if (ship.rotation.z > 0) ship.rotation.z -= acceleration
      if (camera.position.x - 1 > ship.position.x)
        camera.position.x -= camReadjust
    }
    if (!keyPress.right) {
      if (shipTurnSpeed > 0) {
        shipTurnSpeed -= forceFeedback
      }
      if (ship.rotation.z < 0) ship.rotation.z += acceleration
    }
    if (camera.position.x < ship.position.x) camera.position.x += camReadjust

    if (shipTurnSpeed < 0.01 && shipTurnSpeed > -0.01) shipTurnSpeed = 0
    ship.position.x += shipTurnSpeed
  }

  allBuildings.forEach((building, i) => {
    building.position.z += velocity
    // Relocation and Remorph Logic //
    if (building.position.z > 200) {
      building.position.z = Math.round(randomNumber(-900, -1000)) - 100
      if (!gameStart) {
        const beforeGamePos = [
          Math.round(randomNumber(-110, -40)),
          Math.round(randomNumber(110, 40)),
        ]
        building.position.x = beforeGamePos[randomNumber(0, 1)]
      }
      if (gameStart) {
        building.position.x = Math.round(randomNumber(-110, 110))
      }
      building.position.y = -5

      building.geometry.dispose()

      const buildingWidth = Math.round(randomNumber(10, 20))
      const buildingHeight = Math.round(randomNumber(20, 100))
      const buildingDepth = Math.round(randomNumber(10, 20))

      building.geometry = new THREE.BoxGeometry(
        buildingWidth,
        buildingHeight,
        buildingDepth
      )
      building.geometry.computeBoundingBox()
    }

    building.updateMatrixWorld()

    allBuildingsBB[i]
      .copy(building.geometry.boundingBox)
      .applyMatrix4(building.matrixWorld)
  })

  allBoundaries.map((boundary) => {
    boundary.position.z += velocity
    if (boundary.position.z > 200) {
      boundary.position.z = -1200
    }
  })

  shipBB.copy(ship.geometry.boundingBox).applyMatrix4(ship.matrixWorld)

  if (gameStart) checkCollision()
  // renderer.render(scene, camera)
  composer.render()
}
renderer.setAnimationLoop(animate)

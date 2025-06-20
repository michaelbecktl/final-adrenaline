import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { EffectComposer } from 'three/examples/jsm/Addons.js'
import { RenderPass } from 'three/examples/jsm/Addons.js'
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x161225)

const camera = new THREE.PerspectiveCamera(
  75,
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
bloomPass.threshold = 0.0
bloomPass.strength = 3.0
bloomPass.radius = 0
const composer = new EffectComposer(renderer)
composer.addPass(renderScene)
composer.addPass(bloomPass)

// Controls //
const controls = new OrbitControls(camera, renderer.domElement)

// Field //
const fieldGeometry = new THREE.PlaneGeometry(1000, 1000)
const fieldMaterial = new THREE.MeshBasicMaterial({
  color: 0xd2bca5,
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

ship.position.set(0, 0, -5)

scene.add(ship)

// Ship Bounding Box //
const shipBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
shipBB.setFromObject(ship)

function collision() {
  ship.material.color = new THREE.Color(0xec0000)
}

function checkCollision() {
  allBuildingsBB.forEach((buildings) => {
    if (shipBB.intersectsBox(buildings)) collision()
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
  const buildingPosX = Math.round(randomNumber(-110, 110))
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

const numOfBuildings = 12
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
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

camera.position.z = 10
camera.position.y = 5
camera.position.x = 1

// Light //
const light = new THREE.DirectionalLight(0xffffff, 3)
light.position.set(0, 10, 10)
scene.add(light)

// Animation //
let velocity = 0.5
const velocityRamp = 1.000001

function animate() {
  allBuildings.forEach(
    (building) => (building.position.z += velocity *= velocityRamp)
  )

  allBoundaries.forEach((building) => {
    building.position.z += velocity *= velocityRamp
    if (building.position.z > 200) {
      building.position.z = -1200
    }
  })

  allBuildingsBB.map((bb, i) => {
    bb.copy(allBuildings[i].geometry.boundingBox).applyMatrix4(
      allBuildings[i].matrixWorld
    )
  })

  allBoundariesBB.map((bb, i) => {
    bb.copy(allBoundaries[i].geometry.boundingBox).applyMatrix4(
      allBoundaries[i].matrixWorld
    )
  })

  checkCollision()
  renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)

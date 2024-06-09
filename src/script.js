import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { Group } from 'three/examples/jsm/libs/tween.module.js';
//

// Event Handlers
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement){
        canvas.requestFullscreen()
    } else{
        document.exitFullscreen()
    }
});
window.addEventListener('keydown', function(event){
    if (event.key == 'h'){
        gui.show( gui._hidden ) // toggling
    }
});

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// Environments:
const rgbeLoader = new RGBELoader()
rgbeLoader.load("/environment/quarry_cloudy_2k.hdr", (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    environmentMap.minFilter = THREE.LinearFilter // <<How the Texture is sampled when a texel covers less than one pixel.>>
    environmentMap.magFilter = THREE.LinearFilter // <<How the Texture is sampled when a texel covers more than one pixel.>>

    scene.background = environmentMap
    scene.environment = environmentMap
})

// Textures:
// THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader()
const roofAmbientOcclusionTexture = textureLoader.load("/roof/textures/grey_roof_tiles_02_ao_1k.jpg")


/**
 * House
 */
const houseMeasurements = {
    width: 4,
    height: 2.5,
    depth: 4,
}
// House Group:
const house = new THREE.Group()

// Floor:
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ roughness: 0.7 })
)
floor.rotation.x = -(1/2)*Math.PI
house.add(floor)

// Walls:
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial()
)
walls.position.y += 2.5 / 2
house.add(walls)

// Roof:
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4, 2),
    new THREE.MeshStandardMaterial()
)
roof.position.y += 2.5 + .75
roof.rotation.y = (1/4)*Math.PI

roof.material.aoMap = roofAmbientOcclusionTexture
house.add(roof)

// Door:
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshStandardMaterial({ color: 'black' })
)
door.position.y = 1
door.position.z = 2 +.005 // depth / 2
// avoiding .001 <- z-fighting... (GPU -> 🫠)
house.add(door)

// Bushes:
const bushGeometry = new THREE.SphereGeometry(1, 32, 32)
const bushMaterial = new THREE.MeshStandardMaterial()
// let bush;
// for (let i = 0; i < 25; i++){
//     bush = new THREE.Mesh(
//         bushGeometry,
//         bushMaterial
//     )
// }
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.setScalar(.5)
bush1.position.set(.8, .2, 2.2)
// house.add(bush1)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.setScalar(.25)
bush2.position.set(1.4, .1, 2.1)
// house.add(bush2)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.setScalar(.4)
bush3.position.set(-.8, .1, 2.2)
// house.add(bush3)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.setScalar(.15)
bush4.position.set(-1, .05, 2.6)
// house.add(bush4)
house.add(bush1, bush2, bush3, bush4)

// Graves Group:
const heightGrave = 2
const graveGroup = new THREE.Group()
const gravesGroup = new THREE.Group()

const graveXGeometry = new THREE.BoxGeometry(.5, .25, .25, 2, 2, 2)
const graveYGeometry = new THREE.BoxGeometry(.25, heightGrave, .25, 2, 2, 2)
const graveMaterial = new THREE.MeshStandardMaterial()

const graveX = new THREE.Mesh(graveXGeometry, graveMaterial)
const graveY = new THREE.Mesh(graveYGeometry, graveMaterial)
graveY.position.y = heightGrave / 2 - .25
graveX.position.y = heightGrave - (heightGrave / 4)
// graveX.position.y = (heightGrave / 2) - (0.25 / 2);
graveGroup.add(graveX, graveY)
// graveGroup.add(graveY)
// graveGroup.add(graveX)
graveGroup.position.x = 5

// Graves
// for (let i = 0; i < 25; i++){
//     gravesGroup.add(graveGroup)
// }
// house.add(gravesGroup)
function createGrave() {
    const newGrave = graveGroup.clone();
    // Returns a clone of this object and optionally all descendants.
    // @param recursive — If true, descendants of the object are also cloned. Default true
    const radius = 3 + Math.random() * 4
    const angle = Math.random() * 2*Math.PI

    // Position
    newGrave.position.set(
        radius * Math.sin(angle),  // Random x position
        -Math.random() * .2,       // Ground level y position
        radius * Math.cos(angle)   // Random z position
    );

    const angleRotation = (Math.random() - .5) * (1/8)*Math.PI
    // Rotation
    newGrave.rotation.set(
        angleRotation,  // Random x position
        0,              // Ground level y position
        angleRotation   // Random z position
    );
    return newGrave;
}

// Creating and positioning multiple 'cross graves'
for (let i = 0; i < 10; i++) {
    const grave = createGrave();
    gravesGroup.add(grave);
}
house.add(gravesGroup);








scene.add(house)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const timer = new Timer() // a new version of Clock
// Fixes bug (getElapsedTime() multiple times on the same frame).
// Needs to be updated manually with 'timer.update()'.
// Tests if the tab is inactive and prevents large weird time values.
// Needs to be imported manually:
// import { Timer } from 'three/addons/misc/Timer.js'
const frame = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // ...


    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // calling frame again on the next frame
    window.requestAnimationFrame(frame)
}
frame()
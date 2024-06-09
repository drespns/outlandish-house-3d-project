import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
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
        canvas.requestFullscreen();
    } else{
        document.exitFullscreen();
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



// Textures:

/**
 * House
 */
// House Group:
const houseGroup = new THREE.Group()
// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ roughness: 0.7 })
)
floor.rotation.x = -(1/2)*Math.PI
houseGroup.add(floor)


scene.add(houseGroup)

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
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
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
    // calling frame again on the next frame
    window.requestAnimationFrame(frame)
}
frame()
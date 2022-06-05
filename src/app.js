import './style.scss'
import * as THREE from 'three'

import { gsap } from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const textureLoader = new THREE.TextureLoader()

const canvas = document.querySelector('canvas.webgl')
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'


const scene = new THREE.Scene()
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0) // m/s²
})

const gtlfLoader = new GLTFLoader()

let darkMode = false



const bakedTexture = textureLoader.load('bake1.jpg')

bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture,
  side: THREE.DoubleSide})

  const invisibleMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false})



let sceneGroup, mixer, gltfVar, train, bit, shell, floor, cargo, bird, blood
gtlfLoader.load(
  'trainScene1.glb',
  (gltf) => {

    gltfVar = gltf
    // gltf.scene.scale.set(.5,.5,.5)
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true

    scene.add(sceneGroup)


    train = gltf.scene.children.find((child) => {
    return child.name === 'train'
  })
  train.material = bakedMaterial


  bird = gltf.scene.children.find((child) => {
  return child.name === 'bird'
})
bird.material = bakedMaterial

placeBird(1,1,1, {x: -40, y: 0, z: -0})

blood = gltf.scene.children.find((child) => {
return child.name === 'blood'
})


blood.material = invisibleMaterial


    objectsToUpdate.push({
      mesh: train,
      body: chassisBody
    })


  }
)




const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
})

groundBody.position.y -=1.5
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
world.addBody(groundBody)


let ready = true



const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{



  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))


})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = -6.2
camera.position.y = 85
camera.position.z = 50
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.1
// controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor( 0x000000, 1)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const light = new THREE.AmbientLight( 0x404040 )
scene.add( light )
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 )
scene.add( directionalLight )

let objectsToUpdate = []

let whiteMaterial = new THREE.MeshBasicMaterial({color: 'white'})
let yellowMaterial = new THREE.MeshBasicMaterial({color: 'yellow'})
let redMaterial = new THREE.MeshBasicMaterial({color: 'red'})
let blueMaterial = new THREE.MeshBasicMaterial({color: 'blue'})

const floorCMaterial = new CANNON.Material('floor')
   floorCMaterial.friction = 0.0
    floorCMaterial.restitution = 0.0


const playerMaterial = new CANNON.Material('player')

  playerMaterial.friction = 10.0
  playerMaterial.restitution = 0

const createFloor = (width, height, depth, position, material) =>{

  const floorGeometry = new THREE.BoxGeometry(width,height, depth)

  const mesh = new THREE.Mesh(floorGeometry, material)


  mesh.position.copy(position)

  scene.add(mesh)

  //Cannon.js Body
  const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
  const body = new CANNON.Body({
    mass: 0,
    positon: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: floorCMaterial
  })
  body.position.copy(position)
  // body.position.y-=.5
  world.addBody(body)

  objectsToUpdate.push({
    mesh: mesh,
    body: body
  })



}


 createFloor(10,3,20, {x: 1,y: 0,z: 15}, redMaterial)
 createFloor(10,3,20, {x: 20,y: 0,z: 5}, blueMaterial)
 createFloor(20,3,10, {x: 31,y: 0,z: 25}, yellowMaterial)
 createFloor(20,3,10, {x: 41,y: 0,z: 40}, whiteMaterial)

 createFloor(10,3,20, {x: -1,y: 0,z: -15}, redMaterial)
 createFloor(10,3,20, {x: -20,y: 0,z: -55}, blueMaterial)
 createFloor(20,3,10, {x: -31,y: 0,z: -25}, yellowMaterial)
 createFloor(20,3,10, {x: -41,y: 0,z: -40}, whiteMaterial)

 createFloor(10,3,10, {x: 70,y: 0,z: 15}, redMaterial)
 createFloor(10,3,10, {x: 60,y: 0,z: 5}, blueMaterial)
 createFloor(10,3,10, {x: 81,y: 0,z: 25}, yellowMaterial)
 createFloor(10,3,10, {x: 91,y: 0,z: 40}, whiteMaterial)


 // createFloor(3,3,3, {x: 1,y: -1.5,z: 5}, redMaterial)



let playerBody

let birdPositionsNu = 0

let birdPositions = [{x: 1,y: 0, z: -50}, {x: 40,y: 0, z: 50}, {x: 80,y: 0, z: 0}, {x: 180,y: 0, z: 0}]





const placeBird = (width, height, depth, position) =>{


  //Cannon.js Body
  const playerShape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

  playerBody = new CANNON.Body({
    mass: 0,
    positon: new CANNON.Vec3(0, 1,1),
    material: playerMaterial,
    shape: playerShape,
    name: 'player',
    allowSleep: false,
    collisionResponse: false

  })
  playerBody.position.copy(position)
  bird.position.copy(position)
  world.addBody(playerBody)


  objectsToUpdate.push({
    body: playerBody,
    mesh: bird
  })


}


let hit = true

// Build the car chassis
       const chassisShape = new CANNON.Box(new CANNON.Vec3(13, 0.5, 1))
       const chassisBody = new CANNON.Body({ mass: 1 })
       const centerOfMassAdjust = new CANNON.Vec3(0, -1, 0)
       chassisBody.addShape(chassisShape, centerOfMassAdjust)


       // Create the vehicle
       const vehicle = new CANNON.RigidVehicle({
         chassisBody,
       })

       const mass = 6
       const axisWidth = 5
       const wheelShape = new CANNON.Sphere(.75)
       const wheelMaterial = new CANNON.Material('wheel')
       wheelMaterial.friction = 0
       const down = new CANNON.Vec3(0, -1, 0)

       const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
       wheelBody1.addShape(wheelShape)
       vehicle.addWheel({
         body: wheelBody1,
         position: new CANNON.Vec3(-13, 0, axisWidth / 2).vadd(centerOfMassAdjust),
         axis: new CANNON.Vec3(0, 0, 1),
         direction: down,
       })

       const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
       wheelBody2.addShape(wheelShape)
       vehicle.addWheel({
         body: wheelBody2,
         position: new CANNON.Vec3(-13, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
         axis: new CANNON.Vec3(0, 0, -1),
         direction: down,
       })

       const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
       wheelBody3.addShape(wheelShape)
       vehicle.addWheel({
         body: wheelBody3,
         position: new CANNON.Vec3(13, 0, axisWidth / 2).vadd(centerOfMassAdjust),
         axis: new CANNON.Vec3(0, 0, 1),
         direction: down,
       })

       const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
       wheelBody4.addShape(wheelShape)
       vehicle.addWheel({
         body: wheelBody4,
         position: new CANNON.Vec3(13, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
         axis: new CANNON.Vec3(0, 0, -1),
         direction: down,
       })



       chassisBody.addEventListener("collide",function(e){

                    objectsToUpdate.map(x=> {
                    if(x.mesh.name === 'bird' && e.body === x.body ){
                      playerBody.position.copy(birdPositions[birdPositionsNu])
                      blood.position.copy(bird.position)

                      if(darkMode){
                      blood.material = bakedMaterial
                    }



                    console.log(123)
                    console.log(birdPositionsNu)









                      if(birdPositionsNu < birdPositions.length -1){
                        birdPositionsNu++

                      }
                      if(birdPositionsNu >= birdPositions.length -1){
                        birdPositionsNu = 0
                      }


                    }
                    })
                 });


       vehicle.wheelBodies.forEach((wheelBody) => {
         // Some damping to not spin wheels too fast
         wheelBody.angularDamping = 0.1

         // Add visuals

       })




       vehicle.addToWorld(world)


       document.addEventListener('keydown', (event) => {
                 const maxSteerVal = Math.PI / 8
                 const maxSpeed = 100
                 const maxForce = 100

                 switch (event.key) {
                   case 'w':
                   case 'ArrowUp':
                     vehicle.setWheelForce(maxForce, 2)
                     vehicle.setWheelForce(-maxForce, 3)
                     break

                   case 's':
                   case 'ArrowDown':
                     vehicle.setWheelForce(-maxForce , 2)
                     vehicle.setWheelForce(maxForce , 3)
                     break

                   case 'a':
                   case 'ArrowLeft':
                     vehicle.setSteeringValue(maxSteerVal, 0)
                     vehicle.setSteeringValue(maxSteerVal, 1)
                     break

                   case 'd':
                   case 'ArrowRight':
                     vehicle.setSteeringValue(-maxSteerVal, 0)
                     vehicle.setSteeringValue(-maxSteerVal, 1)
                     break
                 }
               })

               // Reset force on keyup
               document.addEventListener('keyup', (event) => {
                 switch (event.key) {
                   case 'w':
                   case 'ArrowUp':
                     vehicle.setWheelForce(0, 2)
                     vehicle.setWheelForce(0, 3)
                     break

                   case 's':
                   case 'ArrowDown':
                     vehicle.setWheelForce(0, 2)
                     vehicle.setWheelForce(0, 3)
                     break

                   case 'a':
                   case 'ArrowLeft':
                     vehicle.setSteeringValue(0, 0)
                     vehicle.setSteeringValue(0, 1)
                     break

                   case 'd':
                   case 'ArrowRight':
                     vehicle.setSteeringValue(0, 0)
                     vehicle.setSteeringValue(0, 1)
                     break
                 }
               })



        const worldContactMaterial = new CANNON.ContactMaterial(
        floorCMaterial,
          playerMaterial,
          {
            friction: 1.000,
            restitution: 0.0
          }
        )


        world.addContactMaterial(worldContactMaterial)
        // world.defaultContactMaterial = worldContactMaterial
let titular = document.getElementById('titular')
let cannonMesh = false
const cannonDebugger = new CannonDebugger(scene, world, {
  onInit(body, mesh) {
    mesh.visible = false
    //        // Toggle visibiliy on "d" press
    //        titular.addEventListener('click', function (e) {
    //          mesh.visible = !mesh.visible
    //          // console.log(cannonMesh)
    //        });
         },
})
chassisBody.allowSleep = false

let expl = document.getElementById('expl')

titular.addEventListener('click', function(e){
  darkMode = !darkMode
  if(darkMode){
    expl.innerHTML = 'ESCORT THE BIRBS TO THEIR FINAL DESTINATION'
    expl.style.fontFamily ='Art'


  }
  if(!darkMode){
    expl.innerHTML = 'Pick up the cheery little Birb Buddies'
    expl.style.fontFamily ='Basement'
    blood.material = invisibleMaterial


  }
})




const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>{


  const elapsedTime = clock.getElapsedTime()



  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime
  world.step(1/60, deltaTime, 3)

  // Update controls


  for(const object of objectsToUpdate){
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
  }

  if(chassisBody && train){

  train.quaternion.copy(chassisBody.quaternion)
  camera.position.z = train.position.z + 50
  camera.lookAt(train.position)
  train.rotation.z -= 5.65;
    train.position.copy(chassisBody.position)

}
// controls.update()

   cannonDebugger.update()


  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

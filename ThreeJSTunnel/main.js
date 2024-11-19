import * as THREE from 'three';
import { LoadGLTFByPath } from './ModelHelper.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

// Relevant variables
let cameraSpeed = 10;
// Renderer
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas
});

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
// Renderer Settings
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights  = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace 

// Scene, Objects and Camera Instantiation
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0x000000, 0.05 );
scene.environment = new THREE.Color(0xac76b5);
scene.environmentIntensity = 100;
const cam = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
cam.position.set(0.3,0.6,1);
cam.setRotationFromEuler(new THREE.Euler(0,0.15,0));
const light = new THREE.PointLight(0xff82f3,10, 600);
light.position.set(0.3,.6,1);
light.parent = cam;
scene.add( light );

let cameraList = [];

let camera;
let groundMirror;

let geometry, material;
geometry = new THREE.CircleGeometry( 40, 64 );
groundMirror = new Reflector( geometry, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: 0xb5b5b5
} );
groundMirror.position.y = 0.5;
groundMirror.rotateX( - Math.PI / 2 );
scene.add( groundMirror );

// Change Camera Position on scroll
let scrollPosY = 0;
window.addEventListener("scroll", () => {
  // Get Scroll percentage
  scrollPosY = (window.scrollY / document.body.clientHeight);
  console.log(scrollPosY);
});
cam.position.z = -1.5 + window.scrollY / 250.0;
// PostProcessing
//const composer = new EffectComposer.EffectComposer(this.renderer);
//composer.addPass(new RenderPass.RenderPass(this.scene, this.camera));
//composer.addPass(new SMAAPass.SMAAPass(this.canvas.clientWidth,this.canvas.clientHeight));
const renderScene = new RenderPass(scene, cam);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.03, 0.8
);
composer.addPass(bloomPass);

// Load GLTF model
LoadGLTFByPath(scene)
  .then(() => {
    retrieveListOfCameras(scene);
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
  });

//retrieve list of all cameras
function retrieveListOfCameras(scene){
  // Get a list of all cameras in the scene
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });

  //Set the camera to the first value in the list of cameras
  camera = cameraList[0];
  updateCamera(cam);
  updateCameraAspect(cam);
  

  // Start the animation loop after the model and cameras are loaded
  animate();
}


// Set the camera aspect ratio to match the browser window dimensions
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
function updateCamera(ev) {
  let div1 = document.getElementById("div1");
camera.position.z = -1.5 + window.scrollY / 250.0;
}

//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);
  //playScrollAnimations();
  //renderer.render(scene, camera);
  cam.position.z = cameraSpeed *-scrollPosY;
  composer.render();
};

    
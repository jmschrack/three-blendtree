import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import { BlendTree1D } from './src/BlendTree';
import { BlendTree1D } from './dist/BlendTree.js';
import GUI from 'lil-gui'; 

const gui = new GUI();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const light=new THREE.AmbientLight( 0xf0f0f0 ); // soft white light
const dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( light,dirLight );

const loader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );
/**@type {THREE.AnimationMixer} */
let mixer;
/**@type {BlendTree1D} */
let blendTree;
const animations={}
loader.load( 'ybot_rifle.glb', function ( gltf ) {
    scene.add( gltf.scene );
    mixer = new THREE.AnimationMixer( gltf.scene );
    gltf.animations.forEach(clip => {
        const action = mixer.clipAction(clip);
       // action.play();
        
        animations[clip.name] = action;
        console.log(clip.name  );
    });

   blendTree= new BlendTree1D([animations['idle'],animations['walking'],animations['run']],[0,1.21,2.8]);
});

camera.position.z = 5;
const myObject={
    speed:2,
    idleWeight:0,
    walkingWeight:0,
    runWeight:0,
    t:0,
    overdive:false
}

gui.add( myObject, 'speed' ,0,5); 
gui.add( myObject, 'overdive' );
gui.add( myObject, 'idleWeight' );
gui.add( myObject, 'walkingWeight' );
gui.add( myObject, 'runWeight' );


const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame( animate );
    const dt = clock.getDelta();
	if(mixer) mixer.update( dt );
    blendTree.overdrive=myObject.overdive;
    blendTree.updateWeights(myObject.speed);
    
    myObject.idleWeight = animations['idle'].getEffectiveWeight();
    myObject.walkingWeight = animations['walking'].getEffectiveWeight();
    myObject.runWeight = animations['run'].getEffectiveWeight();
    myObject.t = blendTree.t;
    gui.controllers.forEach(controller => controller.updateDisplay());
	renderer.render( scene, camera );
}

animate();


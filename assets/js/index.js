var Colors = {
    white:0xd8d0d1,
    blue:0x68c3c0,
};

var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container;

var HEIGHT, WIDTH, mousePos = { x: 0, y: 0 };

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  scene.fog = new THREE.Fog(0xffff, 200,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

var ambientLight, hemisphereLight, shadowLight;

function createLights() {
  hemisphereLight = new THREE.HemisphereLight(0x68c3c0,0x59332e, .5)
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.nStars = 300;
  this.stars = [];
  var stepAngleStars = Math.PI*2 / this.nStars;
  for(var i=0; i<this.nStars; i++){
    var c = new Star();
    this.stars.push(c);;
    var a = stepAngleStars*i;
    var h = 750 + Math.random()*200;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -400-Math.random()*400;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

Star = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "star";
  var geom = new THREE.SphereGeometry(0.5, 32, 32);
  var mat = new THREE.MeshBasicMaterial({
    color : Colors.blue
  });

  var nBlocs = Math.random();
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = Math.random()*500;
    m.position.y = Math.random()*100;
    m.position.z = Math.random()*100;
    m.scale.x = m.scale.y = 3;
    this.mesh.add(m);
  }
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -500;
  scene.add(sky.mesh);
}

function loop(){
  sky.mesh.rotation.z += .01;
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function init(event){
  createScene();
  createLights();
  createSky();
  loop();
}

window.addEventListener('load', init, false);

var Colors = {
    white:0xd8d0d1,
    blue:0x68c3c0,
    orange:0xFBA440,
};
let ColorsRocket = {
  white: 0xffffff,
  black: 0x000000,
  red1: 0xd25138,
  red2: 0xc2533b,
  red3: 0xbf5139,
  grey: 0xd9d1b9,
  darkGrey: 0x4d4b54,
  windowBlue: 0xaabbe3,
  windowDarkBlue: 0x4a6e8a,
  thrusterOrange: 0xfea036
};

///////////////

// VARIABEL GAME
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var poolAsteroid = [], poolScaler = [];
var particlesPool = [];
var particlesInUse = [];

function resetGame(){
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          incrementSpeedBylevel:.000005,
          jarakForSpeedUpdate:100,
          speedLastUpdate:0,

          score:0,
          jarak:0,
          ratioSpeedjarak:50,
          health:100,
          ratioSpeedhealth:3,

          level:1,
          levelLastUpdate:0,
          jarakForlevelUpdate:1000,

          planeDefaultHeight:100,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1.2,
          planeMaxSpeed:1.6,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:600,
          seaLength:800,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          coinjarakTolerance:15,
          coinValue:1,
          starsSpeed:.5,
          coinLastSpawn:0,
          jarakForStarsSpawn:100,

          asteroidjarakTolerance:10,
          asteroidValue:10,
          asteroidsSpeed:.6,
          asteroidLastSpawn:0,
          jarakForAsteroidsSpawn:50,

          scalerjarakTolerance:10,
          scalerValue:10,
          scalersSpeed:.6,
          scalerLastSpawn:0,
          jarakForScalersSpawn:203,

          status : "playing",
         };
  // fieldlevel.innerHTML = Math.floor(game.level);
}
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

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

function handleTouchMove(event) {
    event.preventDefault();
    var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
    var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

function handleMouseUp(event){
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}

function handleTouchEnd(event){
  if (game.status == "waitingReplay"){
    resetGame();
    hideReplay();
  }
}

// PENCAHAYAAN

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

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);
  scene.add(ambientLight);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

var Pilot = function(){
	this.mesh = new THREE.Object3D();
	this.mesh.name = "pilot";
	
	// angleHairs is a property used to animate the hair later 
	this.angleHairs=0;

	// Body of the pilot
	var bodyGeom = new THREE.BoxGeometry(15,15,15);
	var bodyMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	var body = new THREE.Mesh(bodyGeom, bodyMat);
	body.position.set(2,-12,0);
	this.mesh.add(body);

	// Face of the pilot
	var faceGeom = new THREE.BoxGeometry(10,10,10);
	var faceMat = new THREE.MeshLambertMaterial({color:Colors.pink});
	var face = new THREE.Mesh(faceGeom, faceMat);
	this.mesh.add(face);

	// Hair element
	var hairGeom = new THREE.BoxGeometry(4,4,4);
	var hairMat = new THREE.MeshLambertMaterial({color:Colors.brown});
	var hair = new THREE.Mesh(hairGeom, hairMat);
	// Align the shape of the hair to its bottom boundary, that will make it easier to scale.
	hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));
	
	// create a container for the hair
	var hairs = new THREE.Object3D();

	this.hairsTop = new THREE.Object3D();
	for (var i=0; i<12; i++){
		var h = hair.clone();
		var col = i%3;
		var row = Math.floor(i/3);
		var startPosZ = -4;
		var startPosX = -4;
		h.position.set(startPosX + row*4, 0, startPosZ + col*4);
		this.hairsTop.add(h);
	}
	hairs.add(this.hairsTop);

	// create the hairs at the side of the face
	var hairSideGeom = new THREE.BoxGeometry(12,4,2);
	hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
	var hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
	var hairSideL = hairSideR.clone();
	hairSideR.position.set(8,-2,6);
	hairSideL.position.set(8,-2,-6);
	hairs.add(hairSideR);
	hairs.add(hairSideL);

	var hairBackGeom = new THREE.BoxGeometry(2,8,10);
	var hairBack = new THREE.Mesh(hairBackGeom, hairMat);
	hairBack.position.set(-1,-4,0)
	hairs.add(hairBack);
	hairs.position.set(-5,5,0);

	this.mesh.add(hairs);

	var glassGeom = new THREE.BoxGeometry(5,5,5);
	var glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
	var glassR = new THREE.Mesh(glassGeom,glassMat);
	glassR.position.set(6,0,3);
	var glassL = glassR.clone();
	glassL.position.z = -glassR.position.z

	var glassAGeom = new THREE.BoxGeometry(11,1,11);
	var glassA = new THREE.Mesh(glassAGeom, glassMat);
	this.mesh.add(glassR);
	this.mesh.add(glassL);
	this.mesh.add(glassA);

	var earGeom = new THREE.BoxGeometry(2,3,2);
	var earL = new THREE.Mesh(earGeom,faceMat);
	earL.position.set(0,0,-6);
	var earR = earL.clone();
	earR.position.set(0,0,6);
	this.mesh.add(earL);
	this.mesh.add(earR);
}

// move the hair
Pilot.prototype.updateHairs = function(){
	var hairs = this.hairsTop.children;
	var l = hairs.length;
	for (var i=0; i<l; i++){
		var h = hairs[i];
		h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
	}
	this.angleHairs += 0.16;
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

Sea = function(){
	var geom = new THREE.CylinderGeometry(600,600,800,40,10);
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

	geom.mergeVertices();
	var l = geom.vertices.length;
	this.waves = [];

	for (var i=0; i<l; i++){
		var v = geom.vertices[i];
		this.waves.push({y:v.y,
										 x:v.x,
										 z:v.z,
										 ang:Math.random()*Math.PI*2,
										 amp:5 + Math.random()*15,
										 speed:0.016 + Math.random()*0.032
										});
	};
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:.8,
		shading:THREE.FlatShading,
	});
	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
}


Sea.prototype.moveWaves = function (){
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	for (var i=0; i<l; i++){
		var v = verts[i];
		var vprops = this.waves[i];
		v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
		vprops.ang += vprops.speed;
	}
	this.mesh.geometry.verticesNeedUpdate=true;
	sea.mesh.rotation.z += .005;
}

function createSea(){
	sea = new Sea();
	sea.mesh.position.y = -600;
	scene.add(sea.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -500;
  scene.add(sky.mesh);
}

// Contoh FBX Loader ya ges ya

// const loader = new THREE.FBXLoader();
// loader.load('../3d/earth/source/Earth_Final.fbx', function ( object ) {
//   console.log(object)
// 	object.traverse(function(child) {
// 		if(child.isMesh) {
//       textureLoader.load('../3d/earth/textures/Earth2_Land_BaseColor.png', ( texture ) => {
//           child.material.map = texture;
//           child.material.needsupdate = true;
//           console.log(texture)
//           // render(); // only if there is no render loop
//       });
//       console.log( child.geometry.attributes.uv );
// 			child.castShadow = true;
// 			child.receiveShadow = true;
// 		}
// 	});
//   object.scale.set(0.01,0.01,0.01)
// 	scene.add( object );
// });

Sea = function(){
  var geom = new THREE.CylinderGeometry(game.seaRadius,game.seaRadius,game.seaLength,40,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;
  this.waves = [];
  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*2,
                     amp:game.wavesMinAmp + Math.random()*(game.wavesMaxAmp-game.wavesMinAmp),
                     speed:game.wavesMinSpeed + Math.random()*(game.wavesMaxSpeed - game.wavesMinSpeed)
                    });
  };
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,
  });
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;
}

Sea.prototype.moveWaves = function (){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed*deltaTime;
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geom = new THREE.CubeGeometry(20,20,20);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,
  });

  //*
  var nBlocs = 3+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
  //*/
}

Cloud.prototype.rotate = function(){
  var l = this.mesh.children.length;
  for(var i=0; i<l; i++){
    var m = this.mesh.children[i];
    m.rotation.z+= Math.random()*.005*(i+1);
    m.rotation.y+= Math.random()*.002*(i+1);
  }
}

Scaler = function(){
  var geom = new THREE.TetrahedronGeometry(8,2);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.skor = 0;
  // const loader = new THREE.FontLoader();
  // loader.load('../fonts/codropsicons_Regular.json', function (font) {
  //   const geometry = new THREE.TextGeometry('AYAM', {
  //       font: font,
  //       size: 80,
  //       height: 2,
  //       height: 5,
  //       curveSegments: 12,
  //       bevelEnabled: true,
  //       bevelThickness: 10,
  //       bevelSize: 8,
  //       bevelOffset: 0,
  //       bevelSegments: 5
  //   });
  //   // const materials = [
  //   //     new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
  //   //     new THREE.MeshPhongMaterial({ color: 0x999999 }) // side
  //   // ];
  //   const material = new THREE.MeshBasicMaterial({color: 'red'});
  //   this.mesh = new THREE.Mesh(geometry, material);
  //   console.log(this.mesh);
  //   console.log("anj");
  //   this.angle = 0;
  //   this.skor = 0;
  //   this.mesh.castShadow = true;
  //   // this.mesh.position.z = -50;
  //   // this.mesh.position.y = -10;
  //   // this.mesh.position.x = -35;
  //   // this.mesh.rotation.x = - Math.PI / 4;
  // });
}

ScalersHolder = function (){
  this.mesh = new THREE.Object3D();
  this.scalersInUse = [];
}

ScalersHolder.prototype.spawnScalers = function(){
  var nScalers = game.level;

  for (var i=0; i<nScalers; i++){
    var scaler;
    if (poolScaler.length) {
      scaler = poolScaler.pop();
    }else{
      scaler = new Scaler();
    }

    console.log(scaler);
    scaler.angle = - (i*0.1);
    scaler.jarak = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
    scaler.mesh.position.y = -game.seaRadius + Math.sin(scaler.angle)*scaler.jarak;
    scaler.mesh.position.x = Math.cos(scaler.angle)*scaler.jarak;

    this.mesh.add(scaler.mesh);
    this.scalersInUse.push(scaler);
  }
}

ScalersHolder.prototype.rotateScalers = function(){
  for (var i=0; i<this.scalersInUse.length; i++){
    var scaler = this.scalersInUse[i];
    scaler.angle += game.speed*deltaTime*game.scalersSpeed;

    if (scaler.angle > Math.PI*2) scaler.angle -= Math.PI*2;

    scaler.mesh.position.y = -game.seaRadius + Math.sin(scaler.angle)*scaler.jarak;
    scaler.mesh.position.x = Math.cos(scaler.angle)*scaler.jarak;
    scaler.mesh.rotation.z += Math.random()*.1;
    scaler.mesh.rotation.y += Math.random()*.1;

    var diffPos = rocket.mesh.position.clone().sub(scaler.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.scalerjarakTolerance){
      particlesHolder.spawnParticles(scaler.mesh.position.clone(), 15, Colors.blue, 3);

      poolScaler.unshift(this.scalersInUse.splice(i,1)[0]);
      this.mesh.remove(scaler.mesh);
      game.planeCollisionSpeedX = 50 * diffPos.x / d;
      game.planeCollisionSpeedY = 50 * diffPos.y / d;
      ambientLight.intensity = 2;

      multiplySize();
      i--;
    }else if (scaler.angle > Math.PI){
      poolScaler.unshift(this.scalersInUse.splice(i,1)[0]);
      this.mesh.remove(scaler.mesh);
      i--;
    }
  }
}

Asteroid = function(){
  var geom = new THREE.TetrahedronGeometry(8,2);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.red,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.skor = 0;
}

AsteroidsHolder = function (){
  this.mesh = new THREE.Object3D();
  this.asteroidsInUse = [];
}

AsteroidsHolder.prototype.spawnAsteroids = function(){
  var nAsteroids = game.level;

  for (var i=0; i<nAsteroids; i++){
    var asteroid;
    if (poolAsteroid.length) {
      asteroid = poolAsteroid.pop();
    }else{
      asteroid = new Asteroid();
    }
    console.log(asteroid);
    asteroid.angle = - (i*0.1);
    asteroid.jarak = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
    asteroid.mesh.position.y = -game.seaRadius + Math.sin(asteroid.angle)*asteroid.jarak;
    asteroid.mesh.position.x = Math.cos(asteroid.angle)*asteroid.jarak;

    this.mesh.add(asteroid.mesh);
    this.asteroidsInUse.push(asteroid);
  }
}

AsteroidsHolder.prototype.rotateAsteroids = function(){
  for (var i=0; i<this.asteroidsInUse.length; i++){
    var asteroid = this.asteroidsInUse[i];
    asteroid.angle += game.speed*deltaTime*game.asteroidsSpeed;

    if (asteroid.angle > Math.PI*2) asteroid.angle -= Math.PI*2;

    asteroid.mesh.position.y = -game.seaRadius + Math.sin(asteroid.angle)*asteroid.jarak;
    asteroid.mesh.position.x = Math.cos(asteroid.angle)*asteroid.jarak;
    asteroid.mesh.rotation.z += Math.random()*.1;
    asteroid.mesh.rotation.y += Math.random()*.1;

    //var globalAsteroidPosition =  asteroid.mesh.localToWorld(new THREE.Vector3());
    var diffPos = rocket.mesh.position.clone().sub(asteroid.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.asteroidjarakTolerance){
      particlesHolder.spawnParticles(asteroid.mesh.position.clone(), 15, Colors.red, 3);

      poolAsteroid.unshift(this.asteroidsInUse.splice(i,1)[0]);
      this.mesh.remove(asteroid.mesh);
      game.planeCollisionSpeedX = 100 * diffPos.x / d;
      game.planeCollisionSpeedY = 100 * diffPos.y / d;
      ambientLight.intensity = 2;

      removehealth();
      i--;
    }else if (asteroid.angle > Math.PI){
      poolAsteroid.unshift(this.asteroidsInUse.splice(i,1)[0]);
      this.mesh.remove(asteroid.mesh);
      i--;
    }
  }
}

Particle = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
  var _this = this;
  var _p = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var speed = .6+Math.random()*.2;
  TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(_p) _p.remove(_this.mesh);
      _this.mesh.scale.set(1,1,1);
      particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

  var nPArticles = density;
  for (var i=0; i<nPArticles; i++){
    var particle;
    if (particlesPool.length) {
      particle = particlesPool.pop();
    }else{
      particle = new Particle();
    }
    this.mesh.add(particle.mesh);
    particle.mesh.visible = true;
    var _this = this;
    particle.mesh.position.y = pos.y;
    particle.mesh.position.x = pos.x;
    particle.explode(pos,color, scale);
  }
}

Coin = function(){
  var geom = new THREE.TetrahedronGeometry(5,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,

    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.skor = 0;
}

StarsHolder = function (nStars){
  this.mesh = new THREE.Object3D();
  this.starsInUse = [];
  this.starsPool = [];
  for (var i=0; i<nStars; i++){
    var coin = new Coin();
    this.starsPool.push(coin);
  }
}

StarsHolder.prototype.spawnStars = function(){

  var nStars = 1 + Math.floor(Math.random()*10);
  var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
  var amplitude = 10 + Math.round(Math.random()*10);
  for (var i=0; i<nStars; i++){
    var coin;
    if (this.starsPool.length) {
      coin = this.starsPool.pop();
    }else{
      coin = new Coin();
    }
    this.mesh.add(coin.mesh);
    this.starsInUse.push(coin);
    coin.angle = - (i*0.02);
    coin.jarak = d + Math.cos(i*.5)*amplitude;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.jarak;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.jarak;
  }
}

StarsHolder.prototype.rotateStars = function(){
  for (var i=0; i<this.starsInUse.length; i++){
    var coin = this.starsInUse[i];
    if (coin.exploding) continue;
    coin.angle += game.speed*deltaTime*game.starsSpeed;
    if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.jarak;
    coin.mesh.position.x = Math.cos(coin.angle)*coin.jarak;
    coin.mesh.rotation.z += Math.random()*.1;
    coin.mesh.rotation.y += Math.random()*.1;

    //var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
    var diffPos = rocket.mesh.position.clone().sub(coin.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.coinjarakTolerance){
      this.starsPool.unshift(this.starsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
      addscore();
      // addhealth();
      i--;
    }else if (coin.angle > Math.PI){
      this.starsPool.unshift(this.starsInUse.splice(i,1)[0]);
      this.mesh.remove(coin.mesh);
      i--;
    }
  }
}

var sea, rocket;

class Rocket {
  constructor() {
    this.mesh = new THREE.Object3D();
    let geoFinShape = new THREE.Shape();
    let x = 0,
      y = 0;

    geoFinShape.moveTo(x, y);
    geoFinShape.lineTo(x, y + 50);
    geoFinShape.lineTo(x + 35, y + 10);
    geoFinShape.lineTo(x + 35, y - 10);
    geoFinShape.lineTo(x, y);

    let finExtrudeSettings = {
      amount: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    };

    let geoWindowShape = new THREE.Shape();
    geoWindowShape.moveTo(x - 18, y + 45);
    geoWindowShape.lineTo(x + 18, y + 45);
    geoWindowShape.lineTo(x + 18, y - 45);
    geoWindowShape.lineTo(x - 18, y - 45);
    geoWindowShape.lineTo(x - 18, y + 45);

    // geometry
    let geoCone = new THREE.ConeGeometry(50, 70, 8);
    let geoUpper = new THREE.CylinderGeometry(50, 75, 80, 8);
    let geoMiddle = new THREE.CylinderGeometry(75, 85, 80, 8);
    let geoColumn = new THREE.CylinderGeometry(85, 85, 200, 8);
    let geoWindowFrameOuter = new THREE.CylinderGeometry(55, 55, 40, 8);
    let geoWindowFrameInner = new THREE.CylinderGeometry(40, 40, 40, 16);
    let geoWindow = new THREE.CylinderGeometry(50, 50, 40, 8);
    let geoWindowReflection = new THREE.ShapeGeometry(geoWindowShape);
    let geoFin = new THREE.ExtrudeGeometry(geoFinShape, finExtrudeSettings);
    let geoThruster = new THREE.CylinderGeometry(55, 55, 40, 8);
    let geoConnector = new THREE.CylinderGeometry(55, 35, 10, 8);

    // materials
    let matRoof1 = new THREE.MeshPhongMaterial({
      color: ColorsRocket.red1,
      flatShading: true
    });
    let matRoof2 = new THREE.MeshPhongMaterial({
      color: ColorsRocket.red2,
      flatShading: true
    });
    let matRoof3 = new THREE.MeshPhongMaterial({
      color: ColorsRocket.red3,
      flatShading: true
    });
    let matBody = new THREE.MeshPhongMaterial({
      color: ColorsRocket.grey,
      flatShading: true
    });
    let matWindowFrame = new THREE.MeshPhongMaterial({
      color: ColorsRocket.darkGrey,
      side: THREE.DoubleSide,
      flatShading: true
    });
    let matWindow = new THREE.MeshPhongMaterial({
      color: ColorsRocket.windowDarkBlue
    });
    let matWindowReflection = new THREE.MeshPhongMaterial({
      color: ColorsRocket.windowBlue
    });
    let matThruster = new THREE.MeshPhongMaterial({
      color: ColorsRocket.thrusterOrange,
      flatShading: true
    });

    let m = new THREE.Mesh(geoCone, matRoof1);
    m.position.y = 70;
    m.castShadow = true;
    m.receiveShadow = true;

    let m2 = new THREE.Mesh(geoUpper, matRoof2);
    m2.castShadow = true;
    m2.receiveShadow = true;

    let m3 = new THREE.Mesh(geoMiddle, matRoof3);
    m3.position.y = -70;
    m3.castShadow = true;
    m3.receiveShadow = true;

    this.roof = new THREE.Object3D();
    this.roof.add(m, m2, m3);

    let mColumn = new THREE.Mesh(geoColumn, matBody);
    mColumn.position.y = -210;
    mColumn.position.x = 0;
    mColumn.position.z = 0;
    mColumn.castShadow = true;
    mColumn.receiveShadow = true;

    let zPlacement = 85;
    let yPlacement = -310;
    let xPlacement = 8;
    let yRotation = 1.6;
    let scale = 1.9;
    let finWidth = 15;
    let mFinLeft = new THREE.Mesh(geoFin, matRoof3);
    mFinLeft.position.y = yPlacement;
    mFinLeft.position.z = -zPlacement;
    mFinLeft.rotation.y = yRotation - 0.08;
    mFinLeft.scale.set(scale, scale, scale);
    mFinLeft.castShadow = true;
    mFinLeft.receiveShadow = true;
    let mFinRight = new THREE.Mesh(geoFin, matRoof3);
    mFinRight.position.y = yPlacement;
    mFinRight.position.z = zPlacement;
    mFinRight.rotation.y = -yRotation;
    mFinRight.scale.set(scale, scale, scale);
    mFinRight.castShadow = true;
    mFinRight.receiveShadow = true;

    let mfins = new THREE.Object3D();
    mfins.rotation.y += 0.05;
    mfins.add(mFinLeft, mFinRight);
    this.body = new THREE.Object3D();
    this.body.add(mColumn, mfins);

    let innerMesh = new THREE.Mesh(geoWindowFrameInner);
    innerMesh.rotation.y = 0.2;
    let outerCylinder = new ThreeBSP(geoWindowFrameOuter);
    let innerCylinder = new ThreeBSP(innerMesh);

    let hollowed = outerCylinder.union(innerCylinder);
    let m5 = hollowed.toMesh(matWindowFrame);
    m5.position.y = -200;
    m5.position.x = -77;
    m5.rotation.z = 1.59;
    m5.castShadow = true;
    m5.receiveShadow = true;

    let m6 = new THREE.Mesh(geoWindow, matWindow);
    m6.position.y = -200;
    m6.position.x = -67;
    m6.rotation.z = 1.59;
    m6.castShadow = true;
    m6.receiveShadow = true;

    let mWindowReflection = new THREE.Mesh(
      geoWindowReflection,
      matWindowReflection
    );
    mWindowReflection.position.x = -90;
    mWindowReflection.position.y = -200;
    mWindowReflection.rotation.y = -1.5;
    mWindowReflection.rotation.x = 0.82;
    mWindowReflection.receiveShadow = true;

    this.window = new THREE.Object3D();
    this.window.add(m5, m6, mWindowReflection);

    let mThruster = new THREE.Mesh(geoThruster, matWindowFrame);
    mThruster.position.y = -305;
    mThruster.receiveShadow = true;
    mThruster.castShadow = true;

    let mConnector = new THREE.Mesh(geoConnector, matThruster);
    mConnector.position.y = -330;
    mConnector.receiveShadow = true;
    mConnector.castShadow = true;

    let mBurner = new THREE.Mesh(geoThruster, matWindowFrame);
    mBurner.position.y = -340;
    mBurner.scale.set(0.7, 0.55, 0.7);
    mBurner.receiveShadow = true;
    mBurner.castShadow = true;

    this.base = new THREE.Object3D();
    this.base.add(mThruster, mConnector, mBurner);

    this.mesh.add(this.roof);
    this.mesh.add(this.body);
    this.mesh.add(this.window);
    this.mesh.add(this.base);
  }
}

class Base {
  constructor() {
    this.mesh = new THREE.Object3D();
    let geo = new THREE.CylinderGeometry(70, 80, 50, 8);
    let mat = new THREE.MeshPhongMaterial({
      color: ColorsRocket.darkGrey
    });
    let m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    this.mesh.add(m);
  }
}
function createPlane(){
  rocket = new Rocket();
  console.log(rocket);
  rocket.mesh.scale.set(.05,.05,.05);
  // rocket.mesh.position.y = -40;
  rocket.base.rotation.x = 1.6;
  rocket.body.rotation.x = 1.6;
  rocket.mesh.rotation.x = 1.6;
  rocket.roof.rotation.x = 1.6;
  rocket.window.rotation.x = 1.6;
  rocket.mesh.rotation.y = 1.5;
  rocket.mesh.position.y = game.planeDefaultHeight;
  scene.add(rocket.mesh);
}

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -game.seaRadius;
  scene.add(sea.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -game.seaRadius;
  scene.add(sky.mesh);
}

function createStars(){

  starsHolder = new StarsHolder(20);
  scene.add(starsHolder.mesh)
}

function createScalers(){
  for (var i=0; i<10; i++){
    var scaler = new Scaler();
    poolScaler.push(scaler);
  }
  scalersHolder = new ScalersHolder();
  scene.add(scalersHolder.mesh)
}

function createAsteroids(){
  for (var i=0; i<10; i++){
    var asteroid = new Asteroid();
    poolAsteroid.push(asteroid);
    console.log(poolAsteroid);
  }
  asteroidsHolder = new AsteroidsHolder();
  scene.add(asteroidsHolder.mesh)
}

function createParticles(){
  for (var i=0; i<10; i++){
    var particle = new Particle();
    particlesPool.push(particle);
  }
  particlesHolder = new ParticlesHolder();
  scene.add(particlesHolder.mesh)
}

function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  if (game.status=="playing"){

    // Add health stars every 100m;
    if (Math.floor(game.jarak)%game.jarakForStarsSpawn == 0 && Math.floor(game.jarak) > game.coinLastSpawn){
      game.coinLastSpawn = Math.floor(game.jarak);
      starsHolder.spawnStars();
    }

    if (Math.floor(game.jarak)%game.jarakForSpeedUpdate == 0 && Math.floor(game.jarak) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.jarak);
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }

    if (Math.floor(game.jarak)%game.jarakForScalersSpawn == 0 && Math.floor(game.jarak) > game.scalerLastSpawn){
      game.scalerLastSpawn = Math.floor(game.jarak);
      scalersHolder.spawnScalers();
    }

    if (Math.floor(game.jarak)%game.jarakForAsteroidsSpawn == 0 && Math.floor(game.jarak) > game.asteroidLastSpawn){
      game.asteroidLastSpawn = Math.floor(game.jarak);
      asteroidsHolder.spawnAsteroids();
    }

    if (Math.floor(game.jarak)%game.jarakForlevelUpdate == 0 && Math.floor(game.jarak) > game.levelLastUpdate){
      game.levelLastUpdate = Math.floor(game.jarak);
      game.level++;
      // fieldlevel.innerHTML = Math.floor(game.level);

      game.targetBaseSpeed = game.initSpeed + game.incrementSpeedBylevel*game.level
    }


    updatePlane();
    updatejarak();
    updatehealth();
    game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
    game.speed = game.baseSpeed * game.planeSpeed;

  }else if(game.status=="gameover"){
    game.speed *= .99;
    rocket.mesh.rotation.z += (-Math.PI/2 - rocket.mesh.rotation.z)*.0002*deltaTime;
    rocket.mesh.rotation.x += 0.0003*deltaTime;
    game.planeFallSpeed *= 1.05;
    rocket.mesh.position.y -= game.planeFallSpeed*deltaTime;

    if (rocket.mesh.position.y <-200){
      showReplay();
      game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }

  sky.mesh.rotation.z += .001;
  // rocket.propeller.rotation.x +=.2 + game.planeSpeed * deltaTime*.005;
  sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;

  if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

  starsHolder.rotateStars();
  asteroidsHolder.rotateAsteroids();
  scalersHolder.rotateScalers();

  // sky.moveClouds();
  sea.moveWaves();

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function updatejarak(){
  game.jarak += game.speed*deltaTime*game.ratioSpeedjarak;
}

var blinkhealth=false;

function updatehealth(){
  
}

function addscore(){
  game.score += game.coinValue;
  game.score = Math.min(game.score, 100);
  fieldscore.innerHTML = Math.floor(game.score);
}
function addhealth(){
  game.health += game.coinValue;
  game.health = Math.min(game.health, 100);
}

function multiplySize(){
  rocket.mesh.scale.x *= 1.5;
  rocket.mesh.scale.y *= 1.5;
  rocket.mesh.scale.z *= 1.5;
}

function removehealth(){
  game.health -= game.asteroidValue;
  game.health = Math.max(0, game.health);
  healthBar.style.right = (100-game.health)+"%";
  healthBar.style.backgroundColor = (game.health<50)? "#f25346" : "#68c3c0";

  if (game.health<30){
    healthBar.style.animationName = "blinking";
  }else{
    healthBar.style.animationName = "none";
  }

  if (game.health <1){
    game.status = "gameover";
  }
}

function updatePlane(){
  game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
  var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
  var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);

  game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
  targetX += game.planeCollisionDisplacementX;


  game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
  targetY += game.planeCollisionDisplacementY;

  rocket.mesh.position.y += (targetY-rocket.mesh.position.y)*deltaTime*game.planeMoveSensivity;
  rocket.mesh.position.x += (targetX-rocket.mesh.position.x)*deltaTime*game.planeMoveSensivity;

  rocket.mesh.rotation.z = (targetY-rocket.mesh.position.y)*deltaTime*game.planeRotXSensivity;
  rocket.mesh.rotation.x = (rocket.mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
  var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
  camera.fov = normalize(mousePos.x,-1,1,40, 80);
  camera.updateProjectionMatrix ()
  camera.position.y += (rocket.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;

  game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
  game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
  game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
  game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

  // rocket.pilot.updateHairs();
}

function showReplay(){
  replayMessage.style.display="block";
}

function hideReplay(){
  replayMessage.style.display="none";
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var fieldscore, healthBar, replayMessage, fieldlevel;

function init(event){
  // UI
  fieldscore = document.getElementById("skorValue");
  healthBar = document.getElementById("healthBar");
  replayMessage = document.getElementById("replayMessage");
  // fieldlevel = document.getElementById("bValue");

  resetGame();
  createScene();

  createLights();
  createPlane();
  createSea();
  createSky();
  createStars();
  createScalers();
  createAsteroids();
  createParticles();

  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('touchmove', handleTouchMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchend', handleTouchEnd, false);

  loop();
}

window.addEventListener('load', init, false);

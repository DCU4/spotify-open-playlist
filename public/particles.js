var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x121212 );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var mouseX;
var mouseY;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
let canvasWrapper = document.querySelector('.canvas')
canvasWrapper.appendChild( renderer.domElement );

window.addEventListener("resize", function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
});

var distance = Math.min(200, window.innerWidth / 2 );
var geometry = new THREE.Geometry();

var particles = new THREE.Points(geometry, new THREE.PointsMaterial({color: 0xffffff, size: 1}));
// particles.boundingSphere = 5000;

for (var i = 0; i < 1000; i++) {

  var vertex = new THREE.Vector3();

  var theta = THREE.Math.randFloatSpread(360); 
  var phi = THREE.Math.randFloatSpread(360); 

  vertex.x = distance * Math.sin(theta) * Math.cos(phi);
  vertex.y = distance * Math.sin(theta) * Math.sin(phi);
  vertex.z = distance * Math.cos(theta);

  geometry.vertices.push(vertex);


  gsap.to(particles.rotation, {duration: i, x: 0, y: i}).timeScale(.05);

}

// myTween = gsap.to(particles.rotation, {duration: 0.1, x: i, y: 0});



var renderingParent = new THREE.Group();
renderingParent.add(particles);

var resizeContainer = new THREE.Group();
resizeContainer.add(renderingParent);
scene.add(resizeContainer);

camera.position.z = 40;
// object.matrixAutoUpdate  = false;


var animate = function () {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
};
var myTween;
document.addEventListener( 'mousemove', onMouseMove, false );
function onMouseMove(event) {
  if(myTween)
    myTween.kill();
  
  mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouseY = - ( event.clientY / window.innerHeight ) * 2 + 1;

  gsap.to(particles.rotation, {
    duration: 50, 
    x: mouseY*-1, 
    y: mouseX
  });
  // particles.rotation.x = mouseY*-1;
  // particles.rotation.y = mouseX;
}
animate();




// Scaling animation
// var animProps = {scale: 1, xRot: 0, yRot: 0};
// gsap.to(animProps, {duration: 10, scale: 1.3, repeat: -1, yoyo: true, ease: "sine", onUpdate: function() {
//   renderingParent.scale.set(animProps.scale,animProps.scale,animProps.scale);
// }});

// gsap.to(animProps, {duration: 120, xRot: Math.PI * 2, yRot: Math.PI * 4, repeat: -1, yoyo: true, ease: "none", onUpdate: function() {
//   renderingParent.rotation.set(animProps.xRot,animProps.yRot,0);
// }});

let tracks = document.querySelector('ul li');
let target = document.querySelector('#target');
const mouse = {
  x: null,
  y: null
}

window.addEventListener('mousemove', (e) => {
  mouse.y = e.y;
  mouse.x = e.x;
  // console.log(mouse);
});



function onDragStart(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("text/html", ev.target.outerHTML);
  ev.dataTransfer.effectAllowed = "move";
}

function onDragOver(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move"
}

function onDrop(ev) {
  ev.preventDefault();

  const data = ev.dataTransfer.getData("text/html");
  const temp = document.createElement('div');
  temp.innerHTML = data;
  const htmlObject = temp.querySelector('p');
  console.log(htmlObject);

  let pos = htmlObject.getBoundingClientRect();
  console.log(pos);
   

  // console.log(item);
  ev.target.insertAdjacentHTML('beforeend',data);
  const el = ev.target.querySelector('p');
  // console.log(mouse);
  el.style.top = mouse.y+'px';
  el.style.left = mouse.x+'px';

}

p1.addEventListener('dragstart', onDragStart)
target.addEventListener('dragover', onDragOver)
target.addEventListener('drop', onDrop)

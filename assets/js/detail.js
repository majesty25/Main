var counter = 1;
let count = document.querySelector(".count");

function increaseQuantity() {
  counter++;
  // count.value = counter;
  count.innerHTML = counter;
  document.querySelector(".dec").disabled = false;
  document.querySelector(".dec").style.cursor = "pointer";
  console.log("kjkjksa");
}

// if (count.value < 1) {
function decreaseQuantity() {
  counter--;
  count.innerHTML = counter;
  if (count.innerHTML < 2) {
    document.querySelector(".dec").disabled = true;
    document.querySelector(".dec").style.cursor = "no-drop";
  }
}

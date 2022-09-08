

// async function control() {
  loadMore();
  
// }

function lazyload() {
  let lazyimage = document.getElementsByClassName("img");
  for (let i = 0; i < lazyimage.length; i++) {
    setTimeout(() => {
      lazyimage[i].setAttribute("src", lazyimage[i].getAttribute("data-src"));
      element.style.display = "none";
      console.log(lazyimage);
    }, 1000);

    // }
  }
}

async function loadMore() { 
  try {
     let k = document.getElementsByClassName("item");     
     for (let i = 0; i < 70; i++) {
       k[i].style.display = "flex";
     }
  } catch (error) {
    
  } finally {
    lazyload();
  }
 

  
}

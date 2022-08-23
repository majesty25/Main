window.onscroll = function (ev) {
    // e.preventDefault();
    lazyload()
    
}

function lazyload() {
    let lazyimage = document.querySelector("#item-img")
    for (let i = 0; i < lazyimage.length; i++){
        if (elementInViewport(lazyimage[i])) {
                    lazyimage[i].setAttribute(
                      "src",
                      lazyimage[i].getAttribute("data-src")
            );
            console.log(lazyimage);

        }
    }
}

lazyload()

function elementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left > + 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}
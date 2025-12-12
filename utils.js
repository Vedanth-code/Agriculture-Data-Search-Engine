//#region Fisher-Yates Shuffle - Most Efficient //o(n)
export function fisherYatesShuffle(array, size) {
    // Shuffle in-place from end to start
    for (let i = 0; i < size; i++) {
        // Generate random index from i to end of array
        const j = i + Math.floor(Math.random() * (array.length - i));

        // Swap elements at i and j using ES6 destructuring
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, size);
}
//#endregion

let loadingAnimation;

export function animateFavicon() {
    let currentFrame = 1;
    const favicon = document.querySelector("link[rel*='icon']");

    loadingAnimation = setInterval(() => {
        favicon.href = `./static/frame${currentFrame}.png`;
        currentFrame = (currentFrame + 1) % 54;
    }, 10); // Change frame every 100ms
}

// Stop animation and restore original favicon
export function stopLoading() {
    if (loadingAnimation) {
        clearInterval(loadingAnimation);
        loadingAnimation = null;
    }
    document.querySelector("link[rel*='icon']").href = './static/favicon.PNG';
}

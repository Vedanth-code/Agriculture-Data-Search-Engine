function animateFavicon() {
    let currentFrame = 1;
    const favicon = document.querySelector("link[rel*='icon']");

    const animationInterval = setInterval(() => {
        favicon.href = `./static/frame${currentFrame}.png`;
        currentFrame = (currentFrame + 1) % 54;
    }, 10); // Change frame every 100ms

    // Return interval ID to stop animation later
    return animationInterval;
}


let loadingAnimation;

// Stop animation and restore original favicon
function stopLoading() {
    clearInterval(loadingAnimation);
    document.querySelector("link[rel*='icon']").href = './static/favicon.PNG';
}

//Stores all data from the search
const results = [];

function fetchCrop(InputCrop) {
    return new Promise((resolve, reject) => {  // ✅ Promise wrapper


        fetch("https://raw.githubusercontent.com/Vedanth-code/Agriculture-Data-Search-Engine/master/crop_yield.csv").then(r => r.text())
            .then(csv => {
                Papa.parse(csv, {
                    header: true,
                    dynamicTyping: false,  //  FIX: No eval() needed
                    chunkSize: 1024 * 1024,     //  Process 1000 rows at a time
                    skipEmptyLines: true,  // ✅ Skip blank lines
                    comments: true,        // ✅ Skip comments
                    // fastMode: true,        // ✅ Faster parsing
                    chunk: (chunkResults) => {
                        // ✅ Validate each row
                        const validRows = chunkResults.data.filter(row =>
                            row && row.Crop && typeof row.Crop === 'string'
                        );

                        const filteredChunk = validRows.filter(row =>
                            row.Crop === InputCrop
                        );
                        results.push(...filteredChunk);
                    },
                    complete: () => {
                        console.log(`✅ Complete: ${results.length} ${InputCrop} records`);
                        resolve(results);  //  Returns data
                    },
                    error: reject
                });
            }
            ).catch(reject);
    });
}



// Pagination variables
let currentPage = 1;
let itemsPerPage = 10;
let totalItems = 0;
let allCropData = [];

function displayCropList(cropData, page = 1) {

    // document.querySelector('.spinner').style.display = 'inline-block';
    // Change to animated loading favicon
    const favicon = document.querySelector("link[rel*='icon']");
    favicon.type = "image/gif";
    favicon.href = "./static/loading.gif";

    const divBlock = document.getElementById('listOfCrops');
    const multipage = document.getElementById('multiplePage');
    multipage.style.display = "block";



    // Store all data
    allCropData = cropData;
    totalItems = cropData.length;
    currentPage = page;


    // Calculate pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = cropData.slice(startIndex, endIndex);

    console.log("HEyyyyyyyyyyyyyyy ", pageData);
    divBlock.innerHTML =
        pageData.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
                `
            <div class="itemList" onclick="viewCropDetails(${actualIndex})">
                <div class="list1">
                    <h7><strong>Crop name: </strong>${item.Crop}</h7>
                </div>
                <div class="list2">
                    <p><strong>Region: </strong>${item.Region}</p>
                    <p><strong>Yeild Ton: </strong>${item.Yield_tons_per_hectare}</p>
                </div>
            </div>
    `
            );
        }).join('')

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNumbersDiv = document.getElementById('page-numbers');

    // Update button states
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Generate page numbers
    pageNumbersDiv.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        // Show first, last, current, and nearby pages
        if (i === 1 || i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)) {

            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-number');
            pageBtn.textContent = i;

            if (i === currentPage) {
                pageBtn.classList.add('active');
            }

            pageBtn.addEventListener('click', () => {
                displayCropList(allCropData, i);
            });

            pageNumbersDiv.appendChild(pageBtn);
        }
        // Add ellipsis
        else if (i === currentPage - 2 || i === currentPage + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '8px';
            pageNumbersDiv.appendChild(ellipsis);
        }
    }
}

//Navigate to crop-details page
function viewCropDetails(index) {
    const selectedCrop = allCropData[index];

    // Build URL parameters from crop data
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(selectedCrop)) {
        params.append(key, value);
    }

    // Redirect with URL parameters
    window.location.href = `crop-details.html?${params.toString()}`;
}
// Previous button handler
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentPage > 1) {
        displayCropList(allCropData, currentPage - 1);
    }
});

// Next button handler
document.getElementById('next-btn').addEventListener('click', () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
        displayCropList(allCropData, currentPage + 1);
    }
});

//form submit
document.querySelector('form[role="search"]').addEventListener("submit", async function (e) {
    // e.stopPropagation();
    e.preventDefault();

    // Start animation
    loadingAnimation = animateFavicon();

    let InputCrop = this.querySelector('input[type="search"]').value;
    console.log("THe INput crop is ", InputCrop);
    if (!InputCrop) return false;

    try {
        const cropData = await fetchCrop(InputCrop);  // Await results
        displayCropList(cropData);
        console.log("The results are:", cropData);
    } catch (error) {
        console.error("Search failed:", error);
    } finally {
        stopLoading(); //Stops loading
    }
    return false;
})


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

//Stores all data from the search
const results = [];

function fetchCrop(InputCrop) {
    return new Promise((resolve, reject) => {  // ✅ Promise wrapper


        fetch("https://raw.githubusercontent.com/Vedanth-code/Agriculture-Data-Search-Engine/master/crop_yield.csv").then(r => r.text())
            .then(csv => {
                Papa.parse(csv, {
                    header: true,
                    dynamicTyping: false,  //  FIX: No eval() needed
                    chunkSize: 1024 * 1024,     //  Process 1Mb at a time
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

// Helper to update URL
function updateUrlState(search, page) {
    const url = new URL(window.location);
    if (search) url.searchParams.set('search', search);
    if (page) url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
}

// Update pagination button listeners
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
        if (i === 1 || i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)) {

            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-number');
            pageBtn.textContent = i;

            if (i === currentPage) {
                pageBtn.classList.add('active');
            }

            pageBtn.addEventListener('click', () => {
                const search = new URLSearchParams(window.location.search).get('search');
                updateUrlState(search, i);
                displayCropList(allCropData, i);
            });

            pageNumbersDiv.appendChild(pageBtn);
        }
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

// Make globally available for HTML onclick
window.viewCropDetails = viewCropDetails;

// Previous button handler
const prevBtn = document.getElementById('prev-btn');
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            const search = new URLSearchParams(window.location.search).get('search');
            updateUrlState(search, newPage);
            displayCropList(allCropData, newPage);
        }
    });
}

// Next button handler
const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            const search = new URLSearchParams(window.location.search).get('search');
            updateUrlState(search, newPage);
            displayCropList(allCropData, newPage);
        }
    });
}

//form submit
const searchForm = document.querySelector('form[role="search"]');
if (searchForm) {
    searchForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Start animation
        animateFavicon();

        let InputCrop = this.querySelector('input[type="search"]').value;
        console.log("THe INput crop is ", InputCrop);
        if (!InputCrop || InputCrop == "") {
            stopLoading();
            window.location.href = "index.html";
        };

        // Update URL with search term (reset to page 1)
        updateUrlState(InputCrop, 1);

        try {
            const cropData = await fetchCrop(InputCrop);
            displayCropList(cropData, 1);
            console.log("The results are:", cropData);

        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            stopLoading();
        }
        return false;
    })
}

// Initialize from URL on load
window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const pageParam = parseInt(params.get('page')) || 1;

    const searchInput = document.querySelector('input[type="search"]');

    if (searchParam && searchInput) {
        searchInput.value = searchParam;
        animateFavicon();
        try {
            const cropData = await fetchCrop(searchParam);
            displayCropList(cropData, pageParam);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            stopLoading();
        }
    }
});



//Region filter
const regionSelect = document.querySelector('select[id="region-select"]');
if (regionSelect) {
    regionSelect.addEventListener('change', async function (e) {
        const region = this.value;
        console.log("The region is ", region);
        if (!region) return false;

        try {
            // const regionData = await fetchRegionData(region);  // Await results
            // console.log("The Region Data are:", regionData);
            const params = new URLSearchParams();
            params.append("region", region);

            window.location.href = `region.html?${params.toString()}`;

            redirectRegion(regionData);

        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            stopLoading(); //Stops loading
        }
        return false;
    })
}
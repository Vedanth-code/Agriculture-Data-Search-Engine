import { cropDetails, images } from './lists.js';

window.onload = function () {
    // Get URL parameters (Method 1)
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.toString() === '') {
        this.document.getElementById('details-card').display = 'block'
        document.getElementById('cropDetails').innerHTML =
            '<p>No crop data found. Please go back and select a crop.</p>';
        return;
    }

    // Convert URL parameters to object
    const cropData = Object.fromEntries(urlParams);

    // Display all crop detaill


    for (const [key, value] of Object.entries(cropDetails)) {
        if (key === 'fertilizer' || key === 'irrigation') {
            let id = (key === 'fertilizer') ? 'mincont4-2-1' : 'mincont4-2-2';
            if (cropData[value] == "True") {
                document.getElementById(key).innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="34" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>`
                    ;
                document.getElementById(id).style.backgroundColor = "green";
            } else {
                document.getElementById(key).innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="34" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>`;
                document.getElementById(id).style.backgroundColor = "red";
            }

        } else {

            document.getElementById(key).textContent += `${cropData[value.value]}`;

        }

    }
    console.log(`THe image is  ${images[cropData['Crop']]}`);

    document.getElementById('mainContainer').style.backgroundImage = `url(${images[cropData['Crop']]})`;
};

function goBack() {
    console.log("goback triggered ......");

    window.history.back();
}

document.querySelector('.back-btn').addEventListener('click', goBack);

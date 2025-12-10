import { cropDetails, images } from './lists.js';

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.toString() === '') {
        // Fallback or error if no params
        document.getElementById('details-card').style.display = 'block'; // Assuming old ID is kept for this
        document.getElementById('cropDetails').innerHTML =
            '<p>No crop data found. Please go back and select a crop.</p>';
        return;
    }

    const cropData = Object.fromEntries(urlParams);

    // Populate Data
    for (const [key, value] of Object.entries(cropDetails)) {
        const element = document.getElementById(key);
        if (!element) continue;

        if (key === 'fertilizer' || key === 'irrigation') {
            let id = (key === 'fertilizer') ? 'mincont4-2-1' : 'mincont4-2-2';
            const val = cropData[value.value];

            // Check for both string "True" and boolean true just in case
            if (val == "True" || val === true) {
                element.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" class="status-icon">
                            <path d="M20 6L9 17L4 12" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>`;
                const container = document.getElementById(id);
                if (container) {
                    container.style.border = "2px solid #4ade80";
                }
            } else {
                element.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" class="status-icon">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>`;
                const container = document.getElementById(id);
                if (container) {
                    container.style.border = "2px solid #f87171";
                }
            }
        } else {
            const dataKey = value.value;
            if (cropData[dataKey]) {
                const label = element.textContent; // Keep original label
                // Wrap value in span for styling
                element.innerHTML = `<span class="label-text">${label}</span> <span class="value-text">${cropData[dataKey]}</span>`;
            }
        }
    }

    // Set Background
    const cropName = cropData['Crop'];
    if (images[cropName]) {
        document.getElementById('mainContainer').style.backgroundImage = `url(${images[cropName]})`;
    } else {
        // Fallback
        document.getElementById('mainContainer').style.backgroundImage = `url(https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2070&auto=format&fit=crop)`;
    }
};

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/';
    }
}

document.querySelector('.back-btn').addEventListener('click', goBack);

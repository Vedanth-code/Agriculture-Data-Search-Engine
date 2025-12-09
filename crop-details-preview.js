// Inline data to avoid CORS issues with local file:// protocol
const cropDetails = {
    cropName: {
        value: "Crop",
        metric: "",
    },
    doh: {
        value: "Days_to_Harvest",
        metric: "",
    },
    region: {
        value: "Region",
        metric: "",
    },
    soil: {
        value: "Soil_Type",
        metric: "",
    },
    fertilizer: {
        value: "Fertilizer_Used",
        metric: "",
    },
    irrigation: {
        value: "Irrigation_Used",
        metric: "",
    },
    temperature: {
        value: "Temperature_Celsius",
        metric: "",
    },
    rainfall: {
        value: "Rainfall_mm",
        metric: "",
    },
    weather: {
        value: "Weather_Condition",
        metric: "",
    },
    yeilds: {
        value: "Yield_tons_per_hectare",
        metric: "",
    },
};

const images = {
    "Wheat": "https://peptechbio.com/wp-content/uploads/2023/03/Wheat_photo-cred-Adobe-stock_E-2.jpg"
};

// Mock Data for Preview Mode
const MOCK_DATA = {
    "Crop": "Wheat",
    "Days_to_Harvest": "120",
    "Region": "North India",
    "Soil_Type": "Loamy",
    "Fertilizer_Used": "True",
    "Irrigation_Used": "False",
    "Temperature_Celsius": "20-25°C",
    "Rainfall_mm": "750mm",
    "Weather_Condition": "Cool & Dry",
    "Yield_tons_per_hectare": "5.5"
};

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    let cropData = {};

    // Check if we have params, if not use MOCK_DATA
    if (urlParams.toString() === '') {
        console.log("No URL params found. Using MOCK data for preview.");
        cropData = MOCK_DATA;
    } else {
        cropData = Object.fromEntries(urlParams);
    }

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
                // We handle bg color in CSS now or add a class usually, but let's keep inline style compatibility for now but improved
                const container = document.getElementById(id);
                if (container) {
                    container.style.border = "2px solid #4ade80"; // Green border instead of full bg for cleaner look
                    // container.style.backgroundColor = "rgba(74, 222, 128, 0.2)";
                }
            } else {
                element.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" class="status-icon">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>`;
                const container = document.getElementById(id);
                if (container) {
                    container.style.border = "2px solid #f87171"; // Red border
                    // container.style.backgroundColor = "rgba(248, 113, 113, 0.2)";
                }
            }
        } else {
            // Updated to handle the object structure in lists.js vs simple string
            // lists.js structure: text: { value: "KeyName", metric: "" }
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
        // Fallback image if Wheat isn't there or key mismatches
        document.getElementById('mainContainer').style.backgroundImage = `url(https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2070&auto=format&fit=crop)`;
    }

    // Back button logic to go back to previous page or home if no history
    document.querySelector('.back-btn').addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/'; // Or wherever home is
        }
    });
};

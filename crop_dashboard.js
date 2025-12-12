import { animateFavicon, stopLoading, fisherYatesShuffle } from "./utils.js";
// Parse URL params
const urlParams = new URLSearchParams(window.location.search);
const crop = urlParams.get('crop');

console.log("the crop is ", crop);

if (!crop) {
    alert("No crop selected!");
    window.location.href = "index.html";
}

document.getElementById('cropName').textContent = `${crop} Analysis`;

animateFavicon();
fetchData(crop);

async function fetchData(crop) {
    console.log("Fetching data for crop: ", crop);

    const data = await new Promise((resolve, reject) => {
        Papa.parse("https://raw.githubusercontent.com/Vedanth-code/Agriculture-Data-Search-Engine/master/crop_yield.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });

    // Filter by crop
    const cropData = data.filter(row => row.Crop === crop);
    console.log("Filtered Data: ", cropData);

    renderCharts(cropData);
    stopLoading();
}

function renderCharts(data) {
    const config = { displayModeBar: false, responsive: true };
    const baseLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#333' },
        margin: { t: 30, b: 40, l: 50, r: 20 },
        xaxis: { gridcolor: '#e0e0e0' },
        yaxis: { gridcolor: '#e0e0e0' }
    };

    //#region 1. Regional Distribution (Pie Chart)
    const regions = {};
    data.forEach(d => {
        const region = d.Region || 'Unknown';
        regions[region] = (regions[region] || 0) + 1;
    });

    const pieLayout = { ...baseLayout, height: 350 };
    Plotly.newPlot('regionPieChart', [{
        labels: Object.keys(regions),
        values: Object.values(regions),
        type: 'pie',
        marker: { colors: ['#4bc0c0', '#ffcd56', '#ff9f43', '#ff6384', '#36a2eb'] }
    }], pieLayout, config);
    //#endregion    

    //#region 2. Temperature vs Yield (Scatter Plot)
    // Create a shadow copy of data to shuffle, preserving original data for other charts
    const shuffledData = fisherYatesShuffle([...data], Math.min(data.length, 10000));

    const temps = shuffledData.map(d => d.Temperature_Celsius);
    const yields = shuffledData.map(d => d.Yield_tons_per_hectare);

    const scatterTrace = {
        x: temps,
        y: yields,
        mode: 'markers',
        type: 'scatter',
        marker: { size: 8, color: '#ffcd56' }
    };

    const scatterLayout = {
        ...baseLayout,
        title: 'Temperature vs Yield',
        xaxis: { title: 'Temperature (°C)', gridcolor: '#e0e0e0' },
        yaxis: { title: 'Yield (tons/ha)', gridcolor: '#e0e0e0' }
    };
    Plotly.newPlot('tempYieldScatter', [scatterTrace], scatterLayout, config);
    //#endregion            

    //#region 3. Fertilizer Impact (Grouped Bar - Avg Yield)
    const fertilizerYes = data.filter(d => d.Fertilizer_Used === "True").map(d => d.Yield_tons_per_hectare);
    const fertilizerNo = data.filter(d => d.Fertilizer_Used === "False").map(d => d.Yield_tons_per_hectare);

    const avgFertYes = fertilizerYes.length ? fertilizerYes.reduce((a, b) => a + b, 0) / fertilizerYes.length : 0;
    const avgFertNo = fertilizerNo.length ? fertilizerNo.reduce((a, b) => a + b, 0) / fertilizerNo.length : 0;

    const fertTrace = {
        x: ['Fertilizer Used', 'No Fertilizer'],
        y: [avgFertYes, avgFertNo],
        type: 'bar',
        marker: { color: ['#4bc0c0', '#ff6384'] }
    };

    const fertLayout = {
        ...baseLayout,
        title: 'Avg Yield with vs without Fertilizer',
        yaxis: { title: 'Avg Yield (tons/ha)' }
    };
    Plotly.newPlot('fertImpactChart', [fertTrace], fertLayout, config);
    //#endregion                

    //#region 4. Irrigation Impact (Grouped Bar - Avg Yield)
    const irrYes = data.filter(d => d.Irrigation_Used === "True").map(d => d.Yield_tons_per_hectare);
    const irrNo = data.filter(d => d.Irrigation_Used === "False").map(d => d.Yield_tons_per_hectare);

    const avgIrrYes = irrYes.length ? irrYes.reduce((a, b) => a + b, 0) / irrYes.length : 0;
    const avgIrrNo = irrNo.length ? irrNo.reduce((a, b) => a + b, 0) / irrNo.length : 0;

    const irrTrace = {
        x: ['Irrigation Used', 'No Irrigation'],
        y: [avgIrrYes, avgIrrNo],
        type: 'bar',
        marker: { color: ['#36a2eb', '#ff9f43'] }
    };

    const irrLayout = {
        ...baseLayout,
        title: 'Avg Yield with vs without Irrigation',
        yaxis: { title: 'Avg Yield (tons/ha)' }
    };
    Plotly.newPlot('irrigationImpactChart', [irrTrace], irrLayout, config);
    //#endregion                
}

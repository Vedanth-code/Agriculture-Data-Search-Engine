import { animateFavicon, stopLoading, fisherYatesShuffle } from "./utils.js";

// Parse URL params
const urlParams = new URLSearchParams(window.location.search);
const soil = urlParams.get('soil');

console.log("the soil is ", soil);

if (!soil) {
    alert("No soil selected!");
    window.location.href = "index.html";
}

document.getElementById('soilName').textContent = `${soil} Soil Analysis`;

animateFavicon();
fetchData(soil);

async function fetchData(soil) {
    console.log("Fetching data for soil: ", soil);

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

    // Filter by soil
    const soilData = data.filter(row => row.Soil_Type === soil);
    console.log("Filtered Data: ", soilData);

    renderCharts(soilData);
    stopLoading();
}

function regionCompositionGraph(data, baseLayout, config) {
    const regions = {};
    data.forEach(d => {
        const region = d.Region || 'Unknown';
        regions[region] = (regions[region] || 0) + 1;
    });

    const regionTrace = {
        x: Object.keys(regions),
        y: Object.values(regions),
        type: 'bar',
        marker: { color: '#36a2eb' }
    };

    const regionLayout = {
        ...baseLayout,
        title: 'Regional Distribution',
        yaxis: {
            title: 'Record Count',
            range: [41000, 42000],           //  Force range from 4.0 to 5.0
            dtick: 100,                  //  Tick every 0.1 (4.0, 4.1, 4.2, ...)
            tick0: 41000                   //  Start ticks at 4.0 }
        }
    }
        ;
    Plotly.newPlot('regionBarChart', [regionTrace], regionLayout, config);
}

function yieldByCropGraph(data, baseLayout, config) {
    const crops = {};
    data.forEach(d => {
        const crop = d.Crop;
        if (!crops[crop]) crops[crop] = [];
        crops[crop].push(d.Yield_tons_per_hectare);
    });

    const cropNames = Object.keys(crops);
    const avgYields = cropNames.map(c => {
        const sum = crops[c].reduce((a, b) => a + b, 0);
        return sum / crops[c].length;
    });

    const cropYieldTrace = {
        x: cropNames,
        y: avgYields,
        type: 'bar',
        marker: { color: '#4bc0c0' }
    };

    const cropYieldLayout = {
        ...baseLayout,
        title: 'Average Yield by Crop',
        yaxis: {
            title: 'Avg Yield (tons/ha)',
            range: [4.6, 4.7],           //  Force range from 4.0 to 5.0
            dtick: 0.01,                  //  Tick every 0.1 (4.0, 4.1, 4.2, ...)
            tick0: 4.6                   //  Start ticks at 4.0
        }
    };
    Plotly.newPlot('soilCropYieldChart', [cropYieldTrace], cropYieldLayout, config);
}

function fertilizerImpactGraph(data, baseLayout, config) {
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
}

function irrigationImpactGraph(data, baseLayout, config) {
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
}


function tempPerYieldGraph(data, baseLayout, config) {
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

    regionCompositionGraph(data, baseLayout, config);

    yieldByCropGraph(data, baseLayout, config);

    tempPerYieldGraph(data, baseLayout, config);

    fertilizerImpactGraph(data, baseLayout, config);

    irrigationImpactGraph(data, baseLayout, config)

}

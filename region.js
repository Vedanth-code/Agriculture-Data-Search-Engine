import { animateFavicon, stopLoading, fisherYatesShuffle } from "./utils.js";

// Parse URL params
const urlParams = new URLSearchParams(window.location.search);

// Get the data
let region = urlParams.get("region");
let typesofCrops;
let typeofSoil;
let cropsData;
let soilData;
let tempData;
let rainfallData;
let yieldsData
let FertilizerAndIrrigationData;

console.log("the region is ", region);        // String, not array/object yet

animateFavicon();

fetchData(region);

async function fetchData(region) {
    console.log("The region is ", region);
    if (!region) return false;

    try {
        const regionData = await fetchRegionData(region);  // Await results
        console.log("The Region Data are:", regionData);

        redirectRegion(regionData);
    } catch (error) {
        console.error("Search failed:", error);
    } finally {
        stopLoading(); //Stops loading
    }
}

//Stores all data from the search
const results = [];

async function fetchRegionData(region) {
    return new Promise((resolve, reject) => {
        fetch("https://raw.githubusercontent.com/Vedanth-code/Agriculture-Data-Search-Engine/master/crop_yield.csv").then(r => r.text())
            .then(csv => {
                Papa.parse(csv, {
                    header: true,
                    dynamicTyping: false,  //  FIX: No eval() needed
                    chunkSize: 1024 * 1024,     //  Process 1Mb at a time
                    skipEmptyLines: true,  // ✅ Skip blank lines
                    comments: true,        // ✅ Skip comments
                    chunk: (chunkResults) => {
                        // ✅ Validate each row
                        const validRows = chunkResults.data.filter(row =>
                            row && row.Region && typeof row.Region === 'string'
                        );

                        const filteredChunk = validRows.filter(row =>
                            row.Region === region
                        );
                        results.push(...filteredChunk);
                    },
                    complete: () => {
                        resolve(results);  //  Returns data
                    },
                    error: reject
                });
            }
            ).catch(reject);
    });
}



async function redirectRegion(regionData) {

    typesofCrops = Array.from(new Set(regionData.map(item => item.Crop)));
    console.log("The types of crops are:", typesofCrops);

    typeofSoil = Array.from(new Set(regionData.map(item => item.Soil_Type)));
    console.log("The types of soils are:", typeofSoil);

    //#region Calculate Crops: tons/hec
    cropsData = [];
    typesofCrops.map((item) => {
        let tons = 0;
        regionData.filter((crop) => crop.Crop === item
        ).map((crop) => {
            tons += parseFloat(crop.Yield_tons_per_hectare);
        });
        let avg = tons / (regionData.filter(crop => crop.Crop === item).length);
        cropsData.push({ [item]: avg.toFixed(2) });
    });
    console.log("THe crop data is ", cropsData);
    //#endregion

    //#region Calculate Soil data of the region
    soilData = {};
    typeofSoil.map((item) => {
        let count = regionData.filter((soil) => soil.Soil_Type === item).length;
        soilData[item] = count;
    })
    console.log("THe soil data is ", soilData);
    //#endregion

    //#region Calculate temp of region
    let northtemp = regionData.map((item) => {
        return item.Temperature_Celsius;
    })
    tempData = fisherYatesShuffle(northtemp, 10000);
    console.log("THe temp is ", tempData);
    //#endregion

    //#region Calculate rainfall of the region
    rainfallData = fisherYatesShuffle(regionData.map((item) => item.Rainfall_mm), 1000);
    console.log("The rainfall data is ", rainfallData);
    //#endregion

    //#region Calculate yields of the region
    yieldsData = fisherYatesShuffle(regionData.map((item) => item.Yield_tons_per_hectare), 1000);
    console.log("The Yield data is ", yieldsData);
    //#endregion


    //#region Calculate Irrigation and Fertilizer
    let FertilizerYesCount = 0;
    let IrrigationYesCount = 0;
    regionData.map((item) => {
        (item.Fertilizer_Used === "True") ? FertilizerYesCount++ : "";
        (item.Irrigation_Used === "True") ? IrrigationYesCount++ : "";
    });

    FertilizerAndIrrigationData = {
        "Fertilizer": { "yes": FertilizerYesCount, "no": regionData.length - FertilizerYesCount },
        "Irrigation": { "yes": IrrigationYesCount, "no": regionData.length - IrrigationYesCount }
    }
    console.log("The ferti and irrigation is ", FertilizerAndIrrigationData);

    //#endregion

    const rawData = {
        cropData: cropsData,
        tempData: tempData,
    };
    // console.log("THe rawdata is ", rawData);

    renderCharts(rawData);
}



let regionName = document.getElementById('regionName');
if (regionName) {
    document.getElementById('regionName').textContent = `${region} Region Analysis`;
}

function renderCharts(data) {
    const config = { displayModeBar: false, responsive: true };
    const baseLayout = {
        height: 280, // Reduced height further
        margin: { t: 30, b: 30, l: 40, r: 20 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true
    };

    //#region --- 1. Crop Yield Comparison (Bar Chart) ---
    const uniqueCrops = (typesofCrops);
    const avgYields = data.cropData.map((item) => Object.values(item)[0]);

    // console.log("The avg yields are ", avgYields);
    const layoutBar = {
        ...baseLayout, yaxis: {
            title: 'Avg Yield (Tons/Ha)', automargin: true,
            range: [4.5, 5.0],           //  Force range from 4.0 to 5.0
            dtick: 0.1,                  //  Tick every 0.1 (4.0, 4.1, 4.2, ...)
            tick0: 4.0                   //  Start ticks at 4.0
        }, xaxis: { automargin: true }
    };
    Plotly.newPlot('yieldBarChart', [{ x: uniqueCrops, y: avgYields, type: 'bar', marker: { color: '#116bac' } }], layoutBar, config);
    //#endregion

    //#region --- 2. Temperature Range (Box Plot) ---
    // const temps = data.map(d => parseFloat(d.Temperature_Celsius || 0));
    console.log("The data is ", data);

    const temps = data.tempData.map(d => parseFloat(d || 0));

    const layoutBox = { ...baseLayout, yaxis: { title: 'Temperature (°C)', automargin: true }, xaxis: { automargin: true } };
    Plotly.newPlot('tempBoxPlot', [{ y: temps, type: 'box', name: 'Temperature', marker: { color: '#ff9f43' } }], layoutBox, config);
    //#endregion

    //#region --- 3. Rainfall vs Yield (Scatter Plot) ---
    const sampleData = { rainfall: rainfallData, yield: yieldsData };
    console.log("THe sample data is ", sampleData);

    const layoutScatter = { ...baseLayout, xaxis: { title: 'Rainfall (mm)', automargin: true }, yaxis: { title: 'Yield (Tons/Ha)', automargin: true } };
    Plotly.newPlot('rainYieldScatter', [{ x: sampleData.rainfall.map(val => parseFloat(val)), y: sampleData.yield.map(val => parseFloat(val)), mode: 'markers', type: 'scatter', marker: { size: 5, color: '#36a2eb', opacity: 0.6 } }], layoutScatter, config);
    //#endregion

    //#region --- 4. Soil Type Composition (Pie Chart) ---
    const soilTypes = {};
    // data.forEach(d => { const type = d.Soil_Type || 'Unknown'; soilTypes[type] = (soilTypes[type] || 0) + 1; });
    const layoutPie = { ...baseLayout, height: 280, showlegend: true, margin: { t: 20, b: 20, l: 20, r: 20 } };
    Plotly.newPlot('soilPieChart', [{ labels: Object.keys(soilData), values: Object.values(soilData), type: 'pie', marker: { colors: ['#4bc0c0', '#ffcd56', '#ff9f43', '#ff6384', '#36a2eb'] } }], layoutPie, config);
    //#endregion

    //#region --- 5. Farming Practices (Stacked Bar) ---
    // const fertCounts = { 'Yes': 0, 'No': 0 };
    // const irrCounts = { 'Yes': 0, 'No': 0 };
    // data.forEach(d => {
    //     const fert = String(d.Fertilizer_Used).toLowerCase() === 'true';
    //     const irr = String(d.Irrigation_Used).toLowerCase() === 'true';
    //     if (fert) fertCounts['Yes']++; else fertCounts['No']++;
    //     if (irr) irrCounts['Yes']++; else irrCounts['No']++;
    // });
    const layoutStack = { ...baseLayout, height: 450, barmode: 'group', yaxis: { title: 'Count', automargin: true, range: [124000, 125500], dtick: 100 }, legend: { orientation: 'h', y: 1.1 }, xaxis: { automargin: true } };
    Plotly.newPlot('practicesBarChart', [
        { x: ['Fertilizer', 'Irrigation'], y: [FertilizerAndIrrigationData.Fertilizer.yes, FertilizerAndIrrigationData.Irrigation.yes], name: 'Used', type: 'bar', marker: { color: '#28a745' } },
        { x: ['Fertilizer', 'Irrigation'], y: [FertilizerAndIrrigationData.Fertilizer.no, FertilizerAndIrrigationData.Irrigation.no], name: 'Not Used', type: 'bar', marker: { color: '#dc3545' } }
    ], layoutStack, config);
    //#endregion

}



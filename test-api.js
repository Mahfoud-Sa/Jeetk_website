
const fetch = require('node-fetch');

const API_BASE = "http://jeetk-api.runasp.net/api";

async function testApi() {
  try {
    console.log("Fetching /Locations...");
    const locRes = await fetch(`${API_BASE}/Locations`);
    if (!locRes.ok) console.log("Locations failed");
    else {
        const locData = await locRes.json();
        console.log("Locations data sample:", JSON.stringify(locData.value ? locData.value.slice(0, 1) : locData.slice(0,1), null, 2));
    }

    console.log("Fetching /DeliveryRoutes/2...");
    const routeRes = await fetch(`${API_BASE}/DeliveryRoutes/2`);
    if (!routeRes.ok) console.log("Route 2 failed");
    else {
        const routeData = await routeRes.json();
        console.log("Route 2 data:", JSON.stringify(routeData, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

testApi();

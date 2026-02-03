
const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const API_BASE = "http://jeetk-api.runasp.net/api";

async function testApi() {
  try {
    console.log("Fetching /Locations...");
    const locData = await get(`${API_BASE}/Locations`);
    // console.log("Locations sample:", JSON.stringify(locData, null, 2).substring(0, 200));
    console.log("Locations count:", locData.length || locData.value?.length);

    console.log("Fetching /DeliveryRoutes/2...");
    const routeData = await get(`${API_BASE}/DeliveryRoutes/2`);
    console.log("Route 2:", JSON.stringify(routeData, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testApi();

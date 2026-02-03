
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

async function testList() {
  try {
    console.log("Fetching /DeliveryRoutes (list)...");
    const listData = await get(`${API_BASE}/DeliveryRoutes`);
    console.log("List type:", Array.isArray(listData) ? "Array" : typeof listData);
    if(Array.isArray(listData)) {
         console.log("Count:", listData.length);
         console.log("First Item:", JSON.stringify(listData[0], null, 2));
    } else if (listData.value) {
         console.log("Is Wrapped Array");
         console.log("Count:", listData.value.length);
         console.log("First Item:", JSON.stringify(listData.value[0], null, 2));
    } else {
        console.log("Structure:", JSON.stringify(listData, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

testList();

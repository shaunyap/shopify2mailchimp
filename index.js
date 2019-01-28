require('dotenv').config();

const axios = require('axios');
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const apiEndPoint = "https://" + apiKey + ":" + apiSecret + "@lully-selb.myshopify.com/admin/customers.json"

axios.get(apiEndPoint)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });

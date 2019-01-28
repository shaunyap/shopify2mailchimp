require('dotenv').config();

const axios = require('axios');
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const apiEndPoint = "https://" + apiKey + ":" + apiSecret + "@lully-selb.myshopify.com/admin/customers.json"

axios.get(apiEndPoint)
  .then(response => {
    const customerArray = response.data.customers
    const activeSubscribers = customerArray.filter(customer => {
      return (customer.tags.includes("active_subscriber") && !customer.tags.includes("inactive_subscriber"))
    })
    console.log(activeSubscribers);
  })
  .catch(error => {
    console.log(error);
  });

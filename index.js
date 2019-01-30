require('dotenv').config();

const axios = require('axios');

const shopifyKey = process.env.SHOPIFY_API_KEY;
const shopifySecret = process.env.SHOPIFY_API_SECRET;
const shopifyEndPoint = "https://" + shopifyKey + ":" + shopifySecret + "@lully-selb.myshopify.com/admin/customers.json"

const mailchimpKey = process.env.MAILCHIMP_API_KEY;
const mailchimpURL = process.env.MAILCHIMP_URL;
// Mailchimp's Get request allows for direct use of the API Key, but the Post request needs it to be in Base64 for some odd reason.
const encodeValue = "anystring:"+mailchimpKey
const authBase64 = Buffer.from(encodeValue).toString('base64')

<<<<<<< HEAD
let mailchimpFormattedSubs = []

=======
>>>>>>> 260bb1f130f27f2cb14aaff90cc3838661f88c61
axios.get(shopifyEndPoint)
  .then(response => {
    const customerArray = response.data.customers
    const activeSubscribers = customerArray.filter(customer => {
      return (customer.tags.includes("active_subscriber") && !customer.tags.includes("inactive_subscriber"))
    })
<<<<<<< HEAD
    activeSubscribers.forEach(function(shopifySub) {
      let mailchimpSub = {
        "email_address" : shopifySub.email,
            "status": "subscribed",
            "merge_fields": {
                "FNAME": shopifySub.first_name,
                "LNAME": shopifySub.last_name
            },
            "tags": ["active_subscriber"]
      }
      mailchimpFormattedSubs.push(mailchimpSub)
    })
    axios({
    method: 'post',
    // TODO: Mailchimp's bulk import/update function supports up to 500 users
    url: mailchimpURL + "/lists/5910c026be",
    headers: {
      Authorization: "Basic " + authBase64
      },
      data: {
      	"members": mailchimpFormattedSubs,
      	"update_existing": true
      }
  })
      .then(response => {
        console.log("List uploaded")
      })
      .catch(error => {
        console.log(error);
      })
  })
  .catch(error => {
    console.log(error);
  })
=======
    // console.log(activeSubscribers);
    console.log("Shopify API Ran")
  })
  .catch(error => {
    console.log(error);
  });

  // TODO: turn this into a .then statement

  axios({
  method: 'post',
  // TODO: Mailchimp has a bulk import function for up to 500 users, consider using this
  url: mailchimpURL + "/lists/5910c026be/members",
  headers: {
    Authorization: "Basic " + authBase64
    },
    // TODO: Format data for ingestion into Mailchimp
  data: {
    "email_address": "cookie@tester.com",
    "status": "subscribed",
    "merge_fields": {
        "FNAME": "Cooksie",
        "LNAME": "Bailey"
    },
    "tags": ["active_subscriber"]
  }
})
    .then(response => {
      console.log(response.data)
    })
    .catch(error => {
      console.log(error);
    })
>>>>>>> 260bb1f130f27f2cb14aaff90cc3838661f88c61

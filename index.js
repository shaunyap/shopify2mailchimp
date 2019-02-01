require('dotenv').config();

const axios = require('axios');

const shopifyKey = process.env.SHOPIFY_API_KEY;
const shopifySecret = process.env.SHOPIFY_API_SECRET;
const shopifyActiveEndPoint = "https://" + shopifyKey + ":" + shopifySecret + "@lully-selb.myshopify.com/admin/customers/search.json?query=active_subscriber"
const shopifyInactiveEndPoint = "https://" + shopifyKey + ":" + shopifySecret + "@lully-selb.myshopify.com/admin/customers/search.json?query=inactive_subscriber"

const mailchimpKey = process.env.MAILCHIMP_API_KEY;
const mailchimpURL = process.env.MAILCHIMP_URL;
// Mailchimp's Get request allows for direct use of the API Key, but the Post request needs it to be in Base64 for some odd reason.
const encodeValue = "anystring:"+mailchimpKey
const authBase64 = Buffer.from(encodeValue).toString('base64')

let mailchimpNewSubs = []

// First get all the active subscribers and add them into the mailchimpNewSubs
axios.get(shopifyActiveEndPoint)
  .then(response => {
    const customerArray = response.data.customers
    customerArray.forEach(function(shopifySub) {
      let mailchimpSub = {
        "email_address" : shopifySub.email,
        "status": "subscribed",
        "merge_fields": {
            "FNAME": shopifySub.first_name,
            "LNAME": shopifySub.last_name
        }
      }
      mailchimpNewSubs.push(mailchimpSub)
    })
    // Next, get all the ones who cancelled and add them in, but set their status to unsubscribed.
    axios.get(shopifyInactiveEndPoint)
      .then(response => {
        const customerArray = response.data.customers
        customerArray.forEach(function(shopifySub) {
          let mailchimpSub = {
            "email_address" : shopifySub.email,
            "status": "unsubscribed",
            "merge_fields": {
                "FNAME": shopifySub.first_name,
                "LNAME": shopifySub.last_name
            }
          }
          mailchimpNewSubs.push(mailchimpSub)
        })
      })

      // Then bulk update the list
      .then(response => {
        axios({
        method: 'post',
        // TODO: Mailchimp's bulk import/update function supports up to 500 users
        url: mailchimpURL + "/lists/5b8002aa95",
        headers: {
          Authorization: "Basic " + authBase64
          },
          data: {
          	"members": mailchimpNewSubs,
          	"update_existing": true
          }
        })
        .then(response => {
          console.log("Success! List updated.")
        })
        .catch(error => {
          console.log(error);
        })
      })
    .catch(error => {
      console.log(error)
    })
  })
  .catch(error => {
    console.log(error);
  })

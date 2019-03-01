require('dotenv').config();
const axios = require('axios');
const md5 = require('js-md5');

const shopifyKey = process.env.SHOPIFY_API_KEY;
const shopifySecret = process.env.SHOPIFY_API_SECRET;
const shopifyEndPoint = "https://" + shopifyKey + ":" + shopifySecret + "@lully-selb.myshopify.com/admin/customers/search.json?query=inactive_subscriber%20OR%20active_subscriber"

const mailchimpKey = process.env.MAILCHIMP_API_KEY;
const mailchimpURL = process.env.MAILCHIMP_URL + process.env.MAILCHIMP_ENDPOINT;
// Mailchimp's Get request allows for direct use of the API Key, but the Post request needs it to be in Base64 for some odd reason.
const encodeValue = "anystring:"+mailchimpKey;
const authBase64 = Buffer.from(encodeValue).toString('base64');

const mc_shopifyCustomersListID = '1ee7bc797c';
const mc_mailingListID = 'a3884d4eee';

let mailchimpNewSubs = [];

// First get all the active subscribers and add them into the mailchimpNewSubs
axios.get(shopifyEndPoint)
  .then(response => {
    const customerArray = response.data.customers
    customerArray.forEach(function(shopifySub) {
      let status = "";

      if (shopifySub.tags.includes("inactive_subscriber")) {
        status = "unsubscribed";
      } else {
        status = "subscribed";
      }

      let mailchimpSub = {
        "email_address" : shopifySub.email,
        "status": status,
        "merge_fields": {
            "FNAME": shopifySub.first_name,
            "LNAME": shopifySub.last_name
        }
      }
      mailchimpNewSubs.push(mailchimpSub);

    })
  })


      // Then bulk update the list
      // Mailchimp's bulk import/update function supports up to 500 users
      .then(response => {
        axios({
        method: 'post',
        url: mailchimpURL,
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
          mailchimpNewSubs.forEach(function (sub) {
            deleteUsersFromMailchimpList(sub.email_address, mc_shopifyCustomersListID)
            deleteUsersFromMailchimpList(sub.email_address, mc_mailingListID)
          })
        })
        .catch(error => {
          console.log(error);
        })
      })
    .catch(error => {
      console.log(error)
    })
  .catch(error => {
    console.log(error);
  })

  function deleteUsersFromMailchimpList(userEmail, list) {
    const emailHash = md5(userEmail);
    const mailchimpGetEndPoint = "https://us11.api.mailchimp.com/3.0/lists/" + list + "/members/" + emailHash

    axios({
      method:'get',
      url: mailchimpGetEndPoint,
      headers: {
        Authorization: "Basic " + authBase64
      }
    })
    .then(response => {
      if(response.status == 200) {
        console.log(`Found ${userEmail} in ${list}`)
        axios({
          method:'delete',
          url: mailchimpGetEndPoint,
          headers: {
            Authorization: `anystring: ${mailchimpKey}`
          }
        })
        .then(response => {
          console.log(`${userEmail} removed from list: ${list}`)
        })
        .catch(error => {
          console.log(`Error removing ${userEmail} from ${list}`)
        })
      }
    })
    .catch(error => {
      if(error.response.status === 404) {
        console.log(`${userEmail} is not on the list(${list})`)
      } else {
        console.log(`Error getting ${userEmail} from the Mailchimp list.`)
      }
    })
  }

const jwt = require('jsonwebtoken');
const date = require('date-and-time')
const request = require('request');
const config = require('../config/allconfig');
const ip = require('ip');

module.exports = {
    billdesk: function ({ res }) {
        const now = new Date();

        var secretKey = config.BILLDESK_SECRETKEY
        var url = "https://pguat.billdesk.io/payments/ve1_2/orders/create"

        const clientIP = ip.address();

        // var newDateTimeZone = createISO8601Timestamp(date.format(now, 'YYYY-MM-DDTHH:mm:ssZ'))
        var newDateTimeZone = '2023-07-26T13:32:07+05:30';
        // var newDateTimeZone = getCurrentDateTimeWithOffset();

        defaultHeaders = {
            "clientid": config.BILLDESK_CLIENTID,
        }

        headers = {
            "Content-Type": "application/jose",
            "Accept": "application/jose",
            "BD-Traceid": date.format(now, 'YYYYMMDDHHmmssms'),
            "BD-Timestamp": date.format(now, 'YYYYMMDDHHmmss')
        }

        signOptions = {
            algorithm: "HS256",
            header: defaultHeaders
        }
        console.log({ signOptions })

        var payload = {
            mercid: config.BILLDESK_MERCHANTID,
            orderid: "ORD" + date.format(now, 'YYYYMMDDHHmmss'),
            amount: "300.00",
            order_date: newDateTimeZone,
            currency: "356",
            ru: "https://sarsana-5xux4.ondigitalocean.app/merchant/api/pgresponse",
            additional_info:
            {
                additional_info1: "Details1",
                additional_info2: "Details2"
            },
            itemcode: "DIRECT",
            device: {
                init_channel: "internet",
                ip: clientIP,
                user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                accept_header: "text/html"
            }
        };
        const token = jwt.sign(payload, secretKey, signOptions)
        console.log("JWT : ", token)


        console.log({ headers })

        async function main() {
            try {
                const resData = await doRequest(headers, url, token);

                // Use optional chaining to check if 'resData' is defined and has 'status' property
                let getres = resData?.status ? decryptedResponse(resData) : null;

                console.log(getres);
                res.status(200).json({ status: 1, message: 'called..', token, getres });
            } catch (error) {
                console.error("Error:", error);
                res.status(404).json({ status: 1, message: 'called error!!', token });
            }
        }
        main();
    }
}


// ip: "49.36.81.9",
// ip: "::1",
// device:
// {
//   init_channel: "internet",
//   ip: "17.233.107.92",
//   mac: "11-AC-58-21-1B-AA",
//   imei: "990000112233445",
//   user_agent: "Mozilla/5.0",
//   accept_header: "text/html",
//   fingerprintid: "61b12c18b5d0cf901be34a23ca64bb19"
// }

function getCurrentDateTimeWithOffset() {
    var now = new Date();

    // Get the timezone offset in hours and minutes from the current date.
    var timezoneOffset = now.getTimezoneOffset();
    var offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    var offsetMinutes = Math.abs(timezoneOffset) % 60;

    // Convert the date and time to ISO 8601 format with the correct timezone offset.
    var isoTimestamp =
        now.getFullYear() + '-' +
        padNumber(now.getMonth() + 1) + '-' +
        padNumber(now.getDate()) + 'T' +
        padNumber(now.getHours()) + ':' +
        padNumber(now.getMinutes()) + ':' +
        padNumber(now.getSeconds()) +
        (timezoneOffset < 0 ? '+' : '+') +
        padNumber(offsetHours) + ':' +
        padNumber(offsetMinutes);

    return isoTimestamp;
}

function padNumber(num) {
    return num.toString().padStart(2, '0');
}


function createISO8601Timestamp(dateTimeZone) {
    takeLastTwoDigit = dateTimeZone.slice(-2)
    removeLastTwoDigit = dateTimeZone.slice(0, -2)
    var newDateTimeZone = removeLastTwoDigit + ":" + takeLastTwoDigit
    return newDateTimeZone
}

function doRequest(headers, url, token) {
    return new Promise(function (resolve, reject) {
        request.post({ headers: headers, url: url, body: token }, function (error, response, body) {
            // console.log(response)
            if (!error && response.statusCode == 200) {
                resolve(response);
            } else {
                reject(error || new Error(`Request failed with status code ${response.statusCode}`));
            }
        });
    });
}

function decryptedResponse(response) {
    console.log("Status Code : ", response.statusCode);
    console.log("PG Encrypted Response : ", response.body);
    try {
        const responseJson = jwt.decode(response.body, secretKey, { algorithm: "HS256" });
        console.log("PG Decrypted Response : ", responseJson);
        return responseJson;
    } catch (error) {
        console.error("Decoding error:", error);
        return error;
    }
}


// async function main() {
//   let res = await doRequest(headers, url, token);
//   decryptedResponse(res)
// }

// function doRequest(headers, url, token) {
//   return new Promise(function (resolve, reject) {
//     request.post({ headers: headers, url: url, body: token }, function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//         resolve(response);
//       } else {
//         reject(error);
//       }
//     });
//   });
// }

// function decryptedResponse(response) {
//   console.log("Status Code : ", response.statusCode);
//   console.log("PG Encrypted Response : ", response.body);
//   var responseJson = jwt.decode(response.body, secretKey, algorithm = "HS256")
//   console.log("PG Decrypted Response : ", responseJson)
// } 

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const { exec } = require('child_process');
const ORDER_MODAL = require('../models/orderschema');
const path = require('path');
const allConfig = require('../config/allconfig');
const SENDING_SMS_WP = require('../models/sendingwpsmsmodel');
const createPDfDoc = require("../utilis/createInvoice");
const { logger } = require('../utilis/logger');
const fs = require("fs");
const axios = require("axios");
function generateotp() {
    // Generate a random OTP
    let digits = '0123456789';
    let limit = 6;
    let getOtp = ''
    for (i = 0; i < limit; i++) {
        getOtp += digits[Math.floor(Math.random() * 10)];
    }
    return getOtp;
}
const oceanspecs = require('../utilis/oceanspcecode');
let msg9Api = 'https://control.msg91.com/api/v5';
let integrated_number = "919909999582";
let msg91Sender = "TMEMOR";
let wpMsg9url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';

module.exports = {
    sendEmailWithOTP: async function ({ recipientEmail }) {
        try {
            // Create a transporter object using SMTP
            const transporter = nodemailer.createTransport({
                host: allConfig.NODMAILER_OUTGOING_SERVER,
                port: allConfig.NODMAILER_OUTGOING_SERVER_PORT, // or 587 if you want to use TLS instead of SSL
                secure: true, // true for SSL, false for TLS
                auth: {
                    user: allConfig.NODMAILER_OUTGOING_USER,
                    pass: allConfig.NODMAILER_OUTGOING_PASSWORD,
                },
            });

            const otp = '123456';
            // const otp = generateotp();
            // Email content
            const mailOptions = {
                from: allConfig.NODMAILER_OUTGOING_USER,
                to: recipientEmail,
                subject: 'One-Time Password (OTP) Verification',
                text: `Your OTP is: ${otp}`,
            };

            // Send the email
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully!', otp);
            return { success: true, otp };
        } catch (error) {
            console.log('Error occurred:', error.message);
            return { success: false, message: error }
        }
    },

    sendWithPhone: async function ({ phone, otp_length = 6, otp_sms = false, generatenewotp = false, otp_val = null }) {
        try {
            const otp = generatenewotp ? generateotp() : otp_val;
            console.log({ smsotp: otp });
            const msg91url = `${msg9Api}/otp?template_id=${allConfig.MSG_TEMPLATE_ID}&mobile=+91${phone}&otp=${otp}&otp_length=${otp_length}`;

            let componentsWhatspp = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": otp
                        }
                    ]
                }
            ];
            console.log({ otp_sms });
            let payloadWp = !otp_sms ? generateMsgPayload({ components: componentsWhatspp, tonumber: phone, templatename: 'app_access_a' }) : '';
            let msgwpurl = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
            let mssgenspoint = otp_sms ? msg91url : msgwpurl;
            let forOtp = otp_sms ? true : false;
            let sendingObj = {
                msgurl: mssgenspoint,
                ...(otp_sms && { type: 'sms' }),
                ...(!otp_sms && { payload: payloadWp, type: 'whatsapp' }),
                for_otp: forOtp,
                code: otp
            }
            console.log({ sendingObj })
            return await sendIngMesage({
                ...sendingObj
            })


        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    sendComplimantoryCode: async function ({ phone, complimantorycode, nametype }) {
        try {

            console.log({ complimantorycode });
            let payload = {
                template_id: '64e33de3d6fc057f6a3343d4',
                "sender": msg91Sender,
                "short_url": 1,
                // "short_url": "1 (On) or 0 (Off)",
                mobiles: `+91${phone}`,
                var1: complimantorycode,
                var2: nametype,
            }
            const msg91url = `${msg9Api}/flow/`;

            return await sendIngMesage({ msgurl: msg91url, payload, type: 'sms' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },

    sendApprovalRequest: async function ({ phone, statusval = '', username = '' }) {
        try {


            let payload = {
                template_id: '64d69e9dd6fc0534aa73b812',
                "sender": msg91Sender,
                "short_url": 1,
                // "short_url": "1 (On) or 0 (Off)",
                mobiles: `+91${phone}`,
                var1: username,
                var: statusval
            }
            const msg91url = `${msg9Api}/flow/`;

            return await sendIngMesage({ msgurl: msg91url, payload, type: 'sms' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    sendCsvPassUser: async function ({ phone, username = '', eventname = '' }) {
        try {



            let payloadSms = {
                template_id: '64f232ced6fc05650d4870a2',
                "sender": msg91Sender,
                "short_url": 1,
                // "short_url": "1 (On) or 0 (Off)",
                mobiles: `+91${phone}`,
                var1: username,
                var2: 'KHELAIYA',
                var3: eventname,
                var4: 'SEASON PASS'
            }
            const msg91url = `${msg9Api}/flow/`;

            await sendIngMesage({ msgurl: msg91url, payload: payloadSms, type: 'sms' })

            let componentsWhatspp = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "text",
                            "text": username
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": 'KHELAIYA',
                        },
                        {
                            "type": "text",
                            "text": eventname,
                        },
                        {
                            "type": "text",
                            "text": 'SEASON PASS'
                        }
                    ]
                }
            ];
            let payloadWp = generateMsgPayload({ components: componentsWhatspp, tonumber: phone, templatename: 'access_template' });
            let msgurl = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
            await sendIngMesage({ msgurl, payload: payloadWp, type: 'whatsapp' })
        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },

    sendPdf: async function ({ receiverNumber, receiverName, amount, total_tax, eventaxval, eventname, eventday,
        transaction_Id, billdesk_order_id, createdAt, business_name, base_price, order_id, discount_price,
        tickets, gstin, twoWheelers, fourWheelers, }) {
        try {
            // https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/
            let msg9PdfUrl = `${msg9Api}/whatsapp/whatsapp-outbound-message`;


            const pdfFileName = `invoice_${Date.now()}.pdf`;
            // const htmlContent = await ejs.renderFile(path.join(__dirname, '../views', 'invoice.ejs'), {
            //     name: receiverName, amount, transaction_Id, createdAt,
            //     billdesk_order_id, tickets, twoWheelers, fourWheelers, gstin
            // });

            // const browser = await puppeteer.launch({
            //     headless: 'new',
            //     ignoreDefaultArgs: ['--disable-extensions'],
            //     args: [
            //         '--disable-gpu',
            //         '--disable-dev-shm-usage',
            //         '--disable-setuid-sandbox',
            //         '--no-first-run',
            //         '--no-sandbox',
            //         '--no-zygote',
            //         '--disabled-setupid-sandbox',
            //         '--single-process',
            //     ]
            // });
            // let page = await browser.newPage();
            // await page.setContent(htmlContent, { waitUntil: 'networkidle2' });

            // const pdfBuffer = await page.pdf({
            //     format: 'A4',
            //     printBackground: true,
            // });
            // {
            //     item: "Platinium Ticket",
            //     description: "Day-1 Kesariya Garba",
            //     quantity: 2,
            //     amount: 700
            // },
            const invoiceData = {
                shipping: {
                    name: receiverName,
                    mobile: receiverNumber,
                    address: "katargam",
                    city: "Surat",
                    state: "Gujrat",
                    country: "India",
                    postal_code: 382350
                },
                items: [
                    ...transformItems({
                        items: tickets,
                        ...(eventname && { eventname }),
                        ...(eventday && { eventday }),
                    }),
                    ...transformItems({
                        items: twoWheelers,
                        ...(eventname && { eventname }),
                        ...(eventday && { eventday }),
                    }),
                    ...transformItems({
                        items: fourWheelers,
                        ...(eventname && { eventname }),
                        ...(eventday && { eventday }),
                    }),
                ],
                subtotal: amount ?? 0,
                total: amount ?? 0,
                discount: discount_price ?? 0,
                total_tax: total_tax ?? 0,
                paid: 0,
                hsn: '852364',
                invoice_nr: billdesk_order_id,
                transaction_id: transaction_Id,
                invoice_date: createdAt, base_price: base_price ?? 0,
                gst_in: gstin, gst_name: business_name, eventaxval,
            };
            const pdfBuffer = await createPDfDoc.createInvoice(invoiceData, pdfFileName);
            let foldername = 'invoices';
            let { success, url: pdfurl } = await oceanspecs.imageuploads({
                foldername: 'invoices', filebuffer: pdfBuffer,
                filename: `${foldername}/` + pdfFileName,
            })

            console.log({ pdfurl })
            let components = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "document",
                            "document": {
                                // "link": `http://localhost:8000/${pdfPath}`,
                                "link": pdfurl,
                                "filename": `Invoice ${billdesk_order_id}`
                                // "filename": `Invoice ${Date.now()}`
                            }
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": receiverName
                        }
                    ]
                }
            ];
            let payload = generateMsgPayload({ components, tonumber: receiverNumber, templatename: 'invoicealert' });

            let msgurl = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
            if (receiverNumber) {
                await ORDER_MODAL.findOneAndUpdate({ _id: order_id }, { order_slip: pdfurl }, { new: true });
            }
            await sendIngMesage({ msgurl, payload, type: 'whatsapp' })

        } catch (error) {
            console.log({ error: error });
        }
    },
    deroppedMessage: async function ({ toNumber, toname, provideby, topicname, }) {
        try {
            let components = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": toname
                        },
                        {
                            "type": "text",
                            "text": provideby
                        },
                        {
                            "type": "text",
                            "text": topicname
                        }
                    ]
                }
            ]
            let payload = generateMsgPayload({ components, tonumber: toNumber, templatename: 'dropticket' });
            let msgurl = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
            await sendIngMesage({ msgurl, payload, type: 'whatsapp' })

        } catch (error) {
            console.log({ error: error });
        }
    },
    privilegeInviteCancellationSms: async function ({ phone, personname, seatposition, providername }) {
        try {


            let payload = {
                template_id: '6500534cd6fc054c8b421492',
                "sender": msg91Sender,
                "short_url": 1,
                // "short_url": "1 (On) or 0 (Off)",
                mobiles: `+91${phone}`,
                var1: personname,
                var2: providername,
                var3: seatposition,
            }
            const msg91url = `${msg9Api}/flow/`;

            return await sendIngMesage({ msgurl: msg91url, payload, type: 'sms' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    privilegeInvitesms: async function ({ phone, personname, seatposition, providername }) {
        try {


            let payload = {
                template_id: '650549d8d6fc055e655ceef3',
                "sender": msg91Sender,
                "short_url": 1,
                // "short_url": "1 (On) or 0 (Off)",
                mobiles: `+91${phone}`,
                var1: personname,
                var2: seatposition,
                var3: providername,
            }
            const msg91url = `${msg9Api}/flow/`;

            return await sendIngMesage({ msgurl: msg91url, payload, type: 'sms' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    privilegeInviteWp: async function ({ phone, personname, seatposition, providername }) {
        try {


            let components = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "text",
                            "text": personname
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": providername
                        },
                        {
                            "type": "text",
                            "text": seatposition
                        }
                    ]
                }
            ]
            let payload = generateMsgPayload({ components, tonumber: phone, templatename: 'privilege_invite' });

            await sendIngMesage({ msgurl: wpMsg9url, payload, type: 'whatsapp' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    privilegeInviteCancellationWp: async function ({ phone, personname, seatposition, providername }) {
        try {


            let components = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "text",
                            "text": personname
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": providername
                        },
                        {
                            "type": "text",
                            "text": seatposition
                        }
                    ]
                }
            ]
            let payload = generateMsgPayload({ components, tonumber: phone, templatename: 'privilege_invite' });

            await sendIngMesage({ msgurl: wpMsg9url, payload, type: 'whatsapp' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    sendMentorShip: async function ({ phone, personname, parentname, eventname }) {
        try {


            let payload = {
                template_id: '650d377dd6fc0569f40dcf12',
                "sender": msg91Sender,
                "short_url": 1,
                // "short_url": "1 (On) or 0 (Off)",
                mobiles: `+91${phone}`,
                var1: personname,
                var2: parentname,
                var3: eventname,
            }
            const msg91url = `${msg9Api}/flow/`;

            return await sendIngMesage({ msgurl: msg91url, payload, type: 'sms' })

        } catch (error) {
            console.log('Error occurred:', error);
            throw error;
        }
    },
    mentorInvitationWp: async function ({ toNumber, toname, personname, parentname, eventname }) {
        try {
            let components = [
                {
                    "type": "header",
                    "parameters": [
                        {
                            "type": "text",
                            "text": toname
                        }
                    ]
                },
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": personname
                        },
                        {
                            "type": "text",
                            "text": parentname
                        },
                        {
                            "type": "text",
                            "text": eventname
                        }
                    ]
                }
            ]
            let payload = generateMsgPayload({ components, tonumber: toNumber, templatename: 'mentor_invitation' });

            await sendIngMesage({ msgurl: wpMsg9url, payload, type: 'whatsapp' })

        } catch (error) {
            console.log({ error: error });
        }
    }
}
function generateMsgPayload({ components, tonumber, templatename, contenttye = 'template' }) {
    return {
        "integrated_number": integrated_number,
        "content_type": contenttye,
        "payload": {
            "to": tonumber,
            "type": contenttye,
            "template": {
                "name": templatename,
                "language": {
                    "code": "en_US",
                    "policy": "deterministic"
                },
                "components": components,
            },
            "messaging_product": "whatsapp"
        }
    }
}
async function sendIngMesage({ msgurl, method = 'POST', payload, for_otp = false, code = '', type }) {
    try {
        const reqoptions = {
            method: method,
            url: msgurl,
            headers: {
                "authkey": allConfig.MSG_AUTHKEY,
                "Content-Type": "application/json",
                "accept": "application/json",
            },
            ...(!for_otp && { data: JSON.stringify(payload) })
        };

        logger.info(`Msg 91 resuest option :- ${JSON.stringify(reqoptions)}`)
        logger.info(`Msg 91 payload :- ${JSON.stringify(payload)}`)

        return new Promise((resolve, reject) => {
            axios(reqoptions)
                .then((response) => {
                    logger.info(`Msg 91 response:- ${JSON.stringify(response.data)}`)
                    const result = {
                        success: true,
                        ...response.data,
                        ...(code && { otp: code })
                    };

                    logger.info(`Msg 91 result:- ${JSON.stringify(result)}`)
                    resolve(result);
                    let responseStatus = type == 'sms' ? result.type == 'success' : type == 'whatsapp' ? result.success : false;
                    logger.info(`Msg 91 responseStatus :- ${responseStatus}`);
                    // if (!responseStatus) {
                    logger.info('Msg 91 Response save in db')
                    SENDING_SMS_WP.create({
                        type: type,
                        phone_number: payload?.mobiles ?? payload?.payload?.to,
                        status: result?.type ?? result.status,
                        url: msgurl,
                        template: payload?.template_id ?? payload?.template?.name,
                        payload: payload ? JSON.stringify(payload) : '',
                        componets: response.data,
                    }).then((data) => {
                        logger.info(`${type} success`)
                        // console.log(data);

                    }).catch((error) => {
                        console.log('Error', error);
                    });
                    // }
                })
                .catch((error) => {
                    logger.error(`Msg91 Error :- ${error}`);
                    reject({ success: false, message: error.message });
                });
        });
    } catch (err) {
        console.log({ error: err })
    }

}


function transformItems({ items = [], descriptionPrefix = '', eventname = '', eventday = '' }) {
    return items.map(item => ({
        item: `${eventname ? eventname : ''} ${eventday ? eventday + 'Day' : ''} ${item.ticket_name || item.parking_name}`,
        description: `${descriptionPrefix}`,
        quantity: item.qty,
        amount: item.qty * item.price
    }));
}
const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const { logger } = require('../utilis/logger');
const ORDER_MODAL = require('../models/orderschema');
const ticketcategoryvalidate = require('../validator/ticketcategorysvalidate');
const querynames = helaperfn.QUERY;
const TICKETCATEGORYMODAL = require('../models/ticketcategorymodal');
const EVENTCATEGORYMODAL = require('../models/eventcategorymodal');
const USERORDEREVENTCATEGORYMODAL = require('../models/userorderticketcategorymodal');

const ORDEREVENTCATEGORYMODAL = require('../models/ordercategorymodal');

module.exports = {
    createTicketCategory: async function (req, res, next) {
        try {
            let { ticket_name, gates, checkpoints, zones } = req.body;
            const existTicketCategory = await helaperfn.commonQuery(TICKETCATEGORYMODAL, querynames.findOne, { ticket_name });
            if (existTicketCategory.status == 1) {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Ticket Category") });
            } else {
                await ticketcategoryvalidate.creatTicketcategory.validateAsync(req.body);
                // // Remove duplicate IDs
                gates = [...new Set(gates)];
                checkpoints = [...new Set(checkpoints)];
                zones = [...new Set(zones)];

                const newTicketCategory = await helaperfn.commonQuery(TICKETCATEGORYMODAL, querynames.create, { ...req.body, gates, checkpoints, zones });
                console.log({ newTicketCategory })
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Ticket Category`), data: newTicketCategory.data });
            }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Ticket Category', error: err });
        }
    },
    updateTicketCategory: async function (req, res, next) {
        try {
            const { ticket_id, ...otherfileds } = req.body;
            const existTicketCategory = await helaperfn.commonQuery(TICKETCATEGORYMODAL, querynames.findOne, { _id: ticket_id });
            console.log(existTicketCategory.data)
            // console.log({ otherfileds })
            if (existTicketCategory.status == 1) {
                const ticketCatData = await TICKETCATEGORYMODAL.findOneAndUpdate(
                    { _id: existTicketCategory.data._id }, { ...otherfileds }, { new: true });
                let { _id, ...ticketcategoryfiled } = ticketCatData.toObject();

                // console.log({ ticketcategoryfiled })
                console.log({ z: [...new Set(ticketcategoryfiled.gates)] })
                let { _id: updateEventTicketid, } = await EVENTCATEGORYMODAL.updateMany({ parent: ticket_id },
                    { ...ticketcategoryfiled },
                    { new: true });

                console.log({ ticket_id })
                console.log({ updateEventTicketid })

                let updatedata = await USERORDEREVENTCATEGORYMODAL.updateMany({
                    parent: ticket_id,
                }, {
                    $set: {
                        ...ticketcategoryfiled, special_access: false
                    }
                }, { new: true });
                console.log({ updatedata })
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Ticket Category"), data: ticketcategoryfiled });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Ticket Category") });
            }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Ticket Category', error: err });
        }
    },
    deleteTicketCategory: async function (req, res, next) {
        try {
            const { ticket_id } = req.body;
            const existTicketCategory = await helaperfn.commonQuery(TICKETCATEGORYMODAL, querynames.findOne, { _id: ticket_id });
            if (existTicketCategory.status == 1) {
                await helaperfn.commonQuery(TICKETCATEGORYMODAL, querynames.findOneAndUpdate, { _id: existTicketCategory.data._id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Ticket Category") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Ticket Category") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Ticket Category', error: err });
        }
    },
    getAllCategoryTicket: async function (req, res, next) {
        try {
            const existTicketCategory = await TICKETCATEGORYMODAL.find({ is_deleted: false });
            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Ticket Category"), tickets: existTicketCategory });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Ticket Category', error: err });
        }
    },
    getTicketcategoryInfo: async function (req, res, next) {
        try {
            const { ticket_id } = req.params;

            const existTicketCategory = await TICKETCATEGORYMODAL.findOne({ _id: ticket_id })
                .populate({
                    path: 'zones',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt'
                })
                .populate({
                    path: 'checkpoints',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt'
                })
                .populate({
                    path: 'gates',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt'
                });

            if (existTicketCategory) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Ticket Category"), data: existTicketCategory });

            } else {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.NOT_FOUND("Ticket Category"), data: null });

            }

        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while fetching Ticket Category', error: err });
        }
    },
    stasticOfTicketCategory: async function (req, res, next) {
        try {

            let staticsData = await ORDEREVENTCATEGORYMODAL.aggregate([
                {
                    $group: {
                        _id: {
                            event: '$event',
                            parent: '$parent'
                        },
                        total_qty: { $sum: '$qty' }
                    }
                },
                {
                    $lookup: {
                        from: 'events',
                        localField: '_id.event',
                        foreignField: '_id',
                        as: 'eventDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'ticketcategorys',
                        localField: '_id.parent',
                        foreignField: '_id',
                        as: 'ticketDetails'
                    }
                },
                {
                    $unwind: '$eventDetails'
                },
                {
                    $unwind: '$ticketDetails'
                },
                {
                    $project: {
                        _id: 0,
                        'ticketDetails._id': 1,
                        'ticketDetails.ticket_name': 1,
                        'ticketDetails.color_code': 1,

                        total_qty: 1,
                        'eventDetails._id': 1,
                        'eventDetails.event_photo': 1,
                        'eventDetails.event_date': 1,
                        'eventDetails.event_day': 1,
                        'eventDetails.event_location': 1,
                        'eventDetails.event_name': 1,
                        'eventDetails.event_location': 1,

                    }
                }
            ]);
            const groupedData = staticsData.reduce((result, item) => {
                const eventId = item.eventDetails._id;

                if (!result[eventId]) {
                    result[eventId] = {
                        total_qty: 0,
                        eventDetails: item.eventDetails,
                        ticketDetails: []
                    };
                }

                result[eventId].total_qty += item.total_qty;
                item.ticketDetails.total_qty = item.total_qty;
                result[eventId].ticketDetails.push(item.ticketDetails);

                return result;
            }, {});


            const resultArray = Object.values(groupedData);

            logger.info(`staticsData :- ${JSON.stringify(staticsData)}`);

            let fidOrderData = await ORDER_MODAL.find({}).populate([
                {
                    path: 'event',
                    match: { _id: { $exists: true } },
                    select: 'event_name event_photo event_date event_day event_location'
                },
                {
                    path: 'tickets',
                    match: { _id: { $exists: true } },
                    select: 'qty ticket_name color_code event parent'
                }
            ])
            // Create an object to store the grouped data for different payment_status values
            const groupedNewData = {
                success: [],
                failed: [],
                cancel: [],
            };
            const result = {};

            // Iterate through each document in findSuccess
            fidOrderData.forEach((document) => {
                // Assuming that each document in fidOrderData has a 'tickets' property
                const tickets = document.tickets;

                // Group tickets by 'event' for the current document
                const groupedTickets = tickets.reduce((acc, ticket) => {
                    // Group tickets by 'event'
                    // Create a unique key for each 'event'
                    const eventId = ticket.event;

                    // Initialize the group if it doesn't exist in the accumulator
                    if (!acc[eventId]) {
                        acc[eventId] = {
                            total_qty: 0,
                            eventDetails: document.event, // Add eventDetails from the document
                            ticketDetails: [],
                        };
                    }

                    // Add the quantity of the current ticket to the total_qty of the group
                    acc[eventId].total_qty += ticket.qty;

                    // Ensure ticket.parent is a string (null or undefined will be converted to 'null' or 'undefined')
                    const parentTicketId = String(ticket.parent);

                    const parentTicket = acc[eventId].ticketDetails.find((t) => {
                        return t.id == parentTicketId
                    });

                    if (parentTicket) {
                        // console.log(parentTicket)
                        parentTicket.total_qty += ticket.qty;
                    } else {
                        acc[eventId].ticketDetails.push({
                            id: String(ticket.parent),
                            ticket_name: ticket.ticket_name,
                            color_code: ticket.color_code,
                            total_qty: ticket.qty,
                        });
                    }

                    return acc;
                }, {});

                // Determine the payment_status for the current document
                const paymentStatus = document.payment_status?.toLowerCase();

                // Push the groupedTickets into the corresponding group based on payment_status
                if (!result[paymentStatus]) {
                    result[paymentStatus] = {};
                    groupedNewData[paymentStatus] = [];
                }


                // Merge groupedTickets into the result object for the current payment_status
                for (const eventId in groupedTickets) {
                    if (!result[paymentStatus][eventId]) {
                        // result[paymentStatus].push(groupedTickets[eventId]);
                        result[paymentStatus][eventId] = groupedTickets[eventId];
                        groupedNewData[paymentStatus].push(groupedTickets[eventId]);
                    } else {
                        // If the event already exists in the result, add the quantities and ticket details
                        result[paymentStatus][eventId].total_qty += groupedTickets[eventId].total_qty;
                        result[paymentStatus][eventId].ticketDetails.push(...groupedTickets[eventId].ticketDetails);
                        result[paymentStatus][eventId].ticketDetails = combineTicketDetails(
                            result[paymentStatus][eventId].ticketDetails
                        );
                    }
                }

            });

            res.status(StatusCodes.OK).json({ status: 1, message: 'Selling Data', data: groupedNewData });

        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while getting Ticket Category', error: err });
        }
    },
    recentTransferTicket: async function (req, res, next) {
        try {
            let { _id: provider_id } = req.user;
            let getAllData = await ORDEREVENTCATEGORYMODAL.find({ is_salesteam: true });
            res.status(200).json({ status: 1, message: 'recent Transfer Tickets', data: getAllData });
        } catch (error) {
            console.log(error)
            res.status(INTERNAL_SERVER_ERROR).json({ status: 0, message: error });
        }
    },
}

function combineTicketDetails(ticketDetails) {
    const ticketMap = new Map();
    ticketDetails.forEach((ticket) => {
        const id = ticket.id;
        if (ticketMap.has(id)) {
            // If a ticket with the same ID exists, add its quantity
            ticketMap.get(id).total_qty += ticket.total_qty;
        } else {
            // Otherwise, add the ticket to the map
            ticketMap.set(id, { ...ticket });
        }
    });
    // Return the deduplicated ticket details as an array
    return Array.from(ticketMap.values());
}
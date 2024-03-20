const { StatusCodes } = require('http-status-codes');
const helaperfn = require('../helper/helper');
const EVENTMODAL = require('../models/eventmodal');
const TICKETCATEGORYMODAL = require('../models/ticketcategorymodal');
const EVENTCATEGORYMODAL = require('../models/eventcategorymodal');
const TAXMODAL = require('../models/taxmodal');
const eventvalidator = require('../validator/eventvalidate');
const querynames = helaperfn.QUERY;
const ocenfileupload = require('../utilis/oceanspcecode');

module.exports = {
    createEvent: async function (req, res, next) {
        try {
            let { event_name, ticketcategorys, taxes, is_duplicate = false } = req.body;

            console.log({ event_name })
            const existEvent = await EVENTMODAL.findOne({ event_name: event_name });
            if (is_duplicate && !existEvent) {
                return res.status(200).send({ status: 0, message: 'Event not found' });
            }
            ticketcategorys = ticketcategorys ? JSON.parse(ticketcategorys) : '';
            taxes = taxes ? JSON.parse(taxes) : '';
            console.log({ existEvent })
            // if (existEvent.status == 1) {
            //     res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.EXISTS("Event") });
            // } else {
            await eventvalidator.createEvent.validateAsync(req.body);


            const filelist = req.files || [];

            const uploads = is_duplicate ? [] : ocenfileupload.multipleimageUpload({ filelist: filelist })

            const returnUploadedData = is_duplicate ? [existEvent.event_photo, existEvent.portrait_image, existEvent.term_condition_Pdf, existEvent.venue_pdf,] : await uploads;
            console.log(returnUploadedData);
            let [event_photo, portrait_image, term_condition_Pdf, venue_pdf] = returnUploadedData;
            let ticketcategoryslist = [];

            if (ticketcategorys && ticketcategorys.length > 0) {
                for (const ticketCat of ticketcategorys) {
                    const exist = await TICKETCATEGORYMODAL.findOne({ _id: ticketCat.ticket_id })
                        .select('-createdAt -updatedAt');

                    if (exist) {
                        // Ticket category exists
                        const { _id, ...otherFields } = exist.toObject();
                        const ticketCategory = { parent: _id, ...otherFields, price: Number(ticketCat.price) };
                        let createEventCategoey = await helaperfn.commonQuery(EVENTCATEGORYMODAL, querynames.create, { ...ticketCategory });
                        ticketcategoryslist.push(createEventCategoey.data._id);
                        console.log("Ticket category exists:", ticketCat.ticket_id);
                    } else {
                        // Ticket category does not exist
                        console.log("Ticket category does not exist:", ticketCat.ticket_id);
                    }
                }
                ticketcategoryslist = [...new Set(ticketcategoryslist)];
            }
            let taxList = [];
            if (taxes && taxes.length > 0) {
                for (const tax of taxes) {
                    // const exist = await TAXMODAL.findOne({ tax_name: tax.tax_name })
                    //     .select('-createdAt -updatedAt');
                    // // if (!exist) {
                    let taxData = await helaperfn.commonQuery(TAXMODAL, querynames.create, { ...tax });
                    taxList.push(taxData.data._id)
                    // }
                }
            }

            const newEvent = await helaperfn.commonQuery(EVENTMODAL, querynames.create, {
                ...req.body,
                event_photo: event_photo, venue_pdf, term_condition_Pdf,
                ticketcategorys: ticketcategoryslist,// Assign the ticket categories array to the field directly
                taxes: taxList, portrait_image: portrait_image
            });
            let findEvent = await EVENTMODAL.findOne({ _id: newEvent.data._id })
                .populate([
                    {
                        path: 'taxes ticketcategorys',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    },

                ]);

            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.CREATED_SUCCESS(`Event`), data: findEvent });
            // }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while creating Event', error: err });
        }
    },
    updateEvent: async function (req, res, next) {
        try {
            const { event_id } = req.body;
            const existEvent = await helaperfn.commonQuery(EVENTMODAL, querynames.findOne, { _id: event_id });
            if (existEvent.status == 1) {
                const filelist = req.files || [];
                console.log(filelist)
                const uploads = filelist ? ocenfileupload.multipleimageUpload({ filelist: filelist }) : null;

                const [event_photo, portrait_image] = uploads ? await uploads : [];
                console.log({ event_photo, portrait_image })
                const updateEvent = await helaperfn.commonQuery(EVENTMODAL, querynames.findOneAndUpdate, { _id: existEvent.data._id },
                    {
                        ...req.body,
                        ...(portrait_image && { portrait_image: portrait_image }),
                        ...(event_photo && { event_photo: event_photo }),
                    });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.UPDATED_SUCCESS("Event"), data: updateEvent.data });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Event") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while updating Event', error: err });
        }
    },
    deleteEvent: async function (req, res, next) {
        try {
            const { event_id } = req.body;
            const existEvent = await helaperfn.commonQuery(EVENTMODAL, querynames.findOne, { _id: event_id });
            if (existEvent.status == 1) {
                await helaperfn.commonQuery(EVENTMODAL, querynames.findOneAndUpdate, { _id: event_id }, { is_deleted: true });
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.DELETED_SUCCESS("Event") });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Event") });
            }
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Event', error: err });
        }
    },
    getAllEvents: async function (req, res, next) {
        try {

            const existEvents = await EVENTMODAL.find({ is_deleted: false })
                .populate([{
                    path: 'taxes',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt',
                }])
                .select('-ticketcategorys');

            res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Events"), data: existEvents });
        } catch (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while deleting Events', error: err });
        }
    },
    getEventInfo: async (req, res, next) => {
        try {
            const { event_id } = req.params;
            const existEvents = await EVENTMODAL.findOne({ _id: event_id })
                .populate([
                    {
                        path: 'taxes',
                        match: { _id: { $exists: true } },
                        select: '-createdAt -updatedAt',
                    },
                    {
                        path: 'ticketcategorys',
                        match: { _id: { $exists: true } },
                        select: '-parent -createdAt -updatedAt -qty',
                        populate: [
                            {
                                path: 'zones checkpoints gates',
                                match: { _id: { $exists: true } },
                                select: '-createdAt -updatedAt',
                            }
                        ],
                        options: { sort: { price: 1 } }
                    },

                ]);

            if (existEvents) {
                res.status(StatusCodes.OK).json({ status: 1, message: helaperfn.commonMessages.GET_DATA_SUCCESS("Events"), data: existEvents });

            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Event"), data: null });
            }
        } catch (err) {
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: 'Error while fetching Events', error: err });
        }
    },
    duplicateEvent: async function (req, res, next) {
        try {
            let { event_id } = req.body;
            const existingData = await EVENTMODAL.findOne({ _id: event_id });
            if (existingData) {
                let { _id, ...eventFileds } = existingData.toObject();
                const duplicatedData = { ...eventFileds };
                const newDocument = new EVENTMODAL(duplicatedData);
                let addedEventData = await newDocument.save();
                res.status(StatusCodes.OK).json({ status: 1, message: 'Event duplicated successfully.', data: addedEventData });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: helaperfn.commonMessages.NOT_EXISTS("Event") });
            }
        } catch (error) {
            console.error({ error: error })
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
}
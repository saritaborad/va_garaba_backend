const { StatusCodes } = require('http-status-codes');
const SOFAMODAL = require('../models/sofamodal');
const sendotpfn = require('../utilis/nodemailer');
const SOFASEATMODAL = require('../models/sofaseatmodal');
const SOFAROWSMODAL = require('../models/sofarowsmodal');
const USERMODAL = require('../models/users.model');
const USERORDERTICKETMODAL = require('../models/userticketmodel');
const SOFASEATUSERMODAL = require('../models/sofausermodal');
const PRIVILEGEORDERTICKETMODAL = require('../models/privilegeorderticketmodel');
const EVENTMODAL = require('../models/eventmodal');
const PARKINGMODAL = require('../models/parkingmodal');
const ORDERPARKINGMODAL = require('../models/orderparkingmodal');
const allconfig = require('../config/allconfig');

const PRIVILEGEINVITELOGSMODAL = require('../models/privildegeinvitelogsmodal');
const ocenfileupload = require('../utilis/oceanspcecode');

const FUNCTIONSLIST = require('../helper/functions');
async function ff() {
    await SOFASEATMODAL.updateMany({

    }, { seat_status: 'Available' }, { new: true })
}
let MSG91ENABLE = allconfig.MSG91ENABLE;
// ff()

//sofa create
// rows:8
// sofasPerRow:9
// seatsPerSofa:3
// sofa_section:A
// main_section:M01
module.exports = {
    arrantSeating: async function (req, res, next) {
        try {
            let { rows, sofasPerRow, seatsPerSofa, main_section, sofa_section } = req.body;

            if (rows && sofasPerRow && seatsPerSofa) {
                const generatedSeating = FUNCTIONSLIST.generateSeating({ rows: Number(rows), sofasPerRow: Number(sofasPerRow), seatsPerSofa: Number(seatsPerSofa) });
                // console.log(JSON.stringify(generatedSeating, null, 2));
                const rowPromises = [];
                for (const row of generatedSeating) {
                    const sofasPromises = [];
                    for (const sofaData of row.sofas) {
                        const seatsData = sofaData.seats.map(seatData => ({
                            seat_name: seatData.seat_name,
                            position: seatData.position,
                            main_section: main_section,
                        }));

                        const savedSeatsPromises = seatsData.map(async seatData => {
                            const savedSeat = await new SOFASEATMODAL(seatData).save();
                            return savedSeat._id;
                        });

                        const savedSeatsIds = await Promise.all(savedSeatsPromises);

                        const savedSofa = new SOFAMODAL({
                            sofa_name: sofaData.sofa,
                            seats: savedSeatsIds,
                            sofa_section: row.sofa_row,
                            main_section: main_section,
                        });

                        const savedSofaWithId = await savedSofa.save();
                        // Update the documents using updateMany
                        await SOFASEATMODAL.updateMany(
                            { _id: { $in: savedSeatsIds } },
                            { $set: { sofa_id: savedSofaWithId?._id } } // Set the sofa_id field to savedSofaWithId
                        );
                        sofasPromises.push(savedSofaWithId._id);

                    }
                    const rowModel = new SOFAROWSMODAL({
                        sofa_section: sofa_section,
                        sofa_row: row.sofa_row,
                        main_section: main_section,
                        sofas: sofasPromises,
                    });

                    const savedRow = await rowModel.save();

                    rowPromises.push(savedRow);
                }
                await Promise.all(rowPromises);

                res.status(StatusCodes.OK).json({ status: 1, message: 'Sofa Arrangement Set.' });
            } else {
                res.status(StatusCodes.OK).json({ status: 0, message: 'Entry not valid' });
            }
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    getSofas: async function (req, res, next) {
        try {
            let { main_section, sofa_section } = req.body;
            let findSofaRows = await SOFAROWSMODAL.findOne({ sofa_row: sofa_section, main_section: main_section })
            if (findSofaRows) {
                console.log(findSofaRows)
                // M01 M02
                let sofaData = await SOFAMODAL.find({ _id: { $in: findSofaRows.sofas }, sofa_status: 'Available' })
                    .populate([
                        {
                            path: 'member',
                            match: { _id: { $exists: true }, is_expire: false, seat_status: "Available" },
                            select: 'name phone_number profile_pic',
                        },
                        {
                            path: 'seats',
                            match: { _id: { $exists: true }, is_expire: false, seat_status: "Available" },
                            select: '-gates -parkings -checkpoints -is_alloted -zones -sofa_id',
                        },
                    ]).select('sofa_name main_section sofa_section')
                // let sofaData = await SOFASEATMODAL.find({ seat_status: "Available" })
                //     .populate([
                //         {
                //             // path: 'sofa_id',
                //             // match: { _id: { $exists: true }, is_expire: false },
                //             // select: 'main_section sofa_section',
                //             // populate: [
                //             //     {
                //             //         path: 'seats',
                //             //         match: { _id: { $exists: true }, seat_status: "Available" },
                //             //         select: '-createdAt -updatedAt',
                //             //     },
                //             // ]
                //         },
                //         // {
                //         //     path: 'gates zones checkpoints',
                //         //     match: { _id: { $exists: true } },
                //         //     select: '-createdAt -updatedAt',
                //         // }
                //     ]).select('-gates -parkings -checkpoints -is_alloted -zones')

                res.status(StatusCodes.OK).json({ status: 1, message: 'Sofa Seating arrangment.', data: sofaData });

            } else {
                res.status(StatusCodes.OK).json({ status: 1, message: 'Sofa Seating not Found.', data: null });

            }
        } catch (error) {
            console.error(error)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    allPrivilegeMembers: async function (req, res, next) {
        try {
            let findMemberData = await USERMODAL.find({ is_privilegemember: true, is_deleted: false }).populate([
                {
                    path: 'sofa_member',
                    match: { _id: { $exists: true } },
                    select: '-createdAt -updatedAt -member',
                    populate: [
                        {
                            path: 'seats',
                            match: { _id: { $exists: true } },
                            select: 'position seat_name main_section seat_id seat_status',
                        },
                        {
                            path: 'zone',
                            match: { _id: { $exists: true } },
                            select: '',
                        }
                        // {
                        //     path: 'event',
                        //     match: { _id: { $exists: true } },
                        //     select: 'event_time event_location event_name',
                        // }
                    ]
                },
            ])
            res.status(200).json({ message: 'All Priovilege Member', status: 1, data: findMemberData })

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    addmember: async function (req, res, next) {
        try {
            let { phone_number, name, gender, sofa_ids, is_update } = req.body;
            // is_update
            console.log({ is_update })
            let findUser = await USERMODAL.findOne({ phone_number, is_deleted: false });
            // const findEvent = await EVENTMODAL.findOne({ _id: event_id });
            // const findMember = await SOFAMODAL.findOne({ member: findUser?._id });
            // console.log({ findMember })
            // if (findMember) {
            //     return res.status(200).json({ message: "User is already Member", status: 1 });
            // }

            sofa_ids = sofa_ids ? JSON.parse(sofa_ids) : [];
            let collectSofaIds = sofa_ids.map(sofa => sofa.sofa_id);
            console.log({ sofa_ids });
            const file = req.file;
            let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'Privilegemembers' }) : '';
            imagurlpath = status === 1 ? imagurlpath : '';

            let userUpdatedata = {
                is_privilegemember: true, sofa_member: [...new Set(collectSofaIds)],
                roles: 'privilegemember', name: name, profile_pic: imagurlpath, gender: gender,
            }

            if (findUser) {
                if (is_update) {
                    findUser = await USERMODAL.findOneAndUpdate({ _id: findUser?._id, is_deleted: false },
                        {
                            ...userUpdatedata
                        },
                        { new: true });
                } else {
                    if (findUser.roles == 'n-user') {
                        findUser = await USERMODAL.findOneAndUpdate({ _id: findUser?._id, is_deleted: false },
                            {
                                ...userUpdatedata
                            },
                            { new: true });
                    } else {
                        return res.status(200).json({ message: "User not n-user", status: 1 });
                    }
                }
                // }
            }
            if (!findUser) {
                findUser = await USERMODAL.create(
                    {
                        ...userUpdatedata, phone_number: phone_number
                    });

            }
            if (findUser) {
                for (let updateIds of sofa_ids) {
                    const { sofa_id, zone_id } = updateIds;
                    await SOFAMODAL.findOneAndUpdate({ _id: sofa_id, is_deleted: false },
                        { member: findUser?._id, sofa_status: 'Booked', zone: zone_id }, { new: true });
                    await SOFASEATMODAL.updateMany({ sofa_id: sofa_id, is_deleted: false },
                        { zone: zone_id }, { new: true });
                }
            }
            return res.status(200).json({ message: "Sofa alloted  to user succesfully.", status: 1 });
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    getSofaDetails: async function (req, res) {
        try {

            let { sofa_member } = req.user;
            let sofaDetails = await SOFAMODAL.find({ _id: { $in: sofa_member } })
                .populate([
                    {
                        path: 'seats',
                        match: { _id: { $exists: true }, },
                        select: '-createdAt -updatedAt -sofa_id',
                        populate: [
                            {
                                path: 'ticket_user',
                                match: { _id: { $exists: true } },
                                select: 'name profile_pic gender phone_number',
                            },
                        ]

                    },
                ])
                ;
            return res.status(200).json({
                message: "Sofa Details", status: 1,
                data: sofaDetails.length > 0 ? sofaDetails : null
            });

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    zoneWiseSeat: async function (req, res) {
        try {

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    invitedTickets: async function (req, res, next) {
        try {
            let { _id: memberid } = req.user;
            let findTickets = await PRIVILEGEORDERTICKETMODAL.find({
                provided_id: memberid
            })
                .populate([
                    {
                        path: 'seat',
                        match: { _id: { $exists: true } },
                        select: 'position seat_name main_section seat_id seat_status',
                    },
                    {
                        path: 'user',
                        match: { _id: { $exists: true } },
                        select: 'profile_pic name gender phone_number',
                    },
                ]
                );

            res.status(200).json({ message: "Tickets list", status: 1, data: findTickets });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    inviteTosofauser: async function (req, res, next) {
        try {
            let { phone_number, name, gender, seat_id, is_change } = req.body;
            console.log({ is_change })
            is_change = false;
            // is_change = is_change == 'true' ? true : false;
            console.log({ bodydata: req.body })
            // event_id, parking_id, revesed_parking
            const { _id: provider_id, roles: provider_role, name: providername } = req.user;



            let findUser = await USERMODAL.findOne({ phone_number, is_deleted: false });
            let AlredyInviteUser = findUser?.is_privilegeuser;
            console.log({ AlredyInviteUser })
            if (AlredyInviteUser) {
                return res.status(200).json({ message: "Seat Already Invited or is Seat Yours!", status: 2, already_invited: true });
            }

            let applyCondition = {
                ...(!is_change && { seat_status: "Available" }),
                ...(is_change && { provided_id: provider_id, }),
            }
            // Check if the seat is available
            console.log({ applyCondition })

            // if (findUser && findUser.roles !== 'n-user') {
            //     res.status(200).json({ message: "User not n-user", status: 1 });
            //     return false;
            // }
            // if (findUser && findUser.is_privilegemember) {
            //     return res.status(200).json({ message: "You Are  Already Sofa Member", status: 1 });
            // }
            console.log({ f: !is_change, is_change })
            const findSeatAvailable = await SOFASEATMODAL.findOne({
                _id: seat_id,
                // seat_status: "Available",
                ...applyCondition

            });


            if (!findSeatAvailable) {
                return res.status(200).json({ message: "Seat Already Invited or is Seat Yours!", status: 2, already_invited: true });
            }

            // const findEvent = await EVENTMODAL.findOne({ _id: event_id });

            // if (!findEvent) {
            //     return res.status(200).json({ message: "Event not Found", status: 1 });
            // } else {

            const file = req.file;
            let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'PrivilegeUsers' }) : '';
            imagurlpath = status === 1 ? imagurlpath : '';

            let userUpdatedata = {
                // is_privilegeuser: true,
                // roles: 'privilegeuser',
            }
            if (is_change) {
                // console.log({ findSeatAvailable })
                // seat
                let OlderUser = await USERMODAL.findOne({ _id: findSeatAvailable.user, is_deleted: false });
                // OlderUser = await USERMODAL.findOneAndUpdate({
                //     _id: OlderUser?._id
                // }, { ...userUpdatedata }, { new: true })
                await PRIVILEGEORDERTICKETMODAL.updateMany({
                    seat: seat_id, user: OlderUser._id
                }, { is_deleted: true }, { new: true })

                let invitesLogs = await PRIVILEGEINVITELOGSMODAL.create({
                    user: OlderUser._id,
                    user_name: OlderUser?.name,
                    phone_number: OlderUser?.phone_number,
                    profile_pic: OlderUser?.profile_pic,
                    seat: seat_id,
                    log: 'Removed'

                })
                await USERMODAL.findOneAndUpdate({
                    _id: provider_id, is_deleted: false
                }, { $addToSet: { privilege_invitelogs: invitesLogs._id } }, { new: true });

            }


            if (findUser) {
                console.log('findUser...')
                //

            } else {

                findUser = await USERMODAL.create({
                    phone_number, profile_pic: imagurlpath,
                    name: name, gender: gender,
                })
            }

            console.log({ findUser });

            if (findUser) {
                let user_id = findUser?._id;

                let userTicketData = await USERORDERTICKETMODAL.create({
                    phone_number: phone_number, name: name, gender: gender,
                    profile_pic: imagurlpath,
                })
                let ticketData = await PRIVILEGEORDERTICKETMODAL.create({
                    user: user_id,
                    ticket_user: userTicketData._id,
                    provide_by: provider_role,
                    provided_id: provider_id,
                    seat: seat_id,
                    event: findSeatAvailable?.event,
                    parking: findSeatAvailable?.parking,
                    zone: findSeatAvailable?.zone,
                    //  ...(findUser.is_privilegemember && { is_active: true })
                })

                // Update seat status and user data
                const seatData = await SOFASEATMODAL.findOneAndUpdate(
                    { _id: seat_id },
                    {
                        // ...(!findUser.is_privilegemember && { seat_status: 'Invited' }),
                        // ...(findUser.is_privilegemember && { seat_status: 'Booked' }),
                        seat_status: 'Invited',
                        provided_id: provider_id,
                        user: user_id,
                        ticket_user: userTicketData._id,
                        provide_by: provider_role,
                        // event: event_id

                    }, { new: true }
                );
                // console.log({ findUser })



                console.log({ ticketData })
                await USERMODAL.findOneAndUpdate({
                    _id: user_id, is_deleted: false
                }, { $addToSet: { privilege_tickets: ticketData._id }, ...(!findUser.is_privilegemember && { is_privilegeuser: true }) }, { new: true });
                // Create a new SOFA SEAT USER entry
                await SOFASEATUSERMODAL.create({
                    user: user_id, seat: seatData._id,
                    order_id: ticketData._id
                });

                let invitesLogs = await PRIVILEGEINVITELOGSMODAL.create({
                    user: user_id,
                    user_name: name,
                    phone_number: phone_number,
                    profile_pic: imagurlpath,
                    seat: seatData._id,
                    log: 'Invited'

                })
                await USERMODAL.findOneAndUpdate({
                    _id: provider_id, is_deleted: false
                }, {
                    $addToSet: { privilege_invitelogs: invitesLogs._id },
                    // ...(name && { name: name }),
                    // ...(gender && { gender: gender }),
                    ...(imagurlpath && { profile_pic: imagurlpath }),
                }, { new: true });

                //parking is_privilegeuser:true parking 
                // let findparking = parking_id ? await PARKINGMODAL.findOne({ _id: parking_id }) : '';
                // if (findparking) {
                //     let parkingObj = {
                //         array: [{
                //             _id: findparking._id, qty: 1, price: Number(findparking.price)
                //         }], modal: PARKINGMODAL, modalname: 'parking', is_reserved: revesed_parking,
                //         submodal: ORDERPARKINGMODAL, provided_by: provider_role, provided_id: provider_id
                //     }
                //     console.log({ p: JSON.stringify(parkingObj) })
                //     const parkinglist = parking_id ? await FUNCTIONSLIST.processArray(parkingObj) : [];
                //     console.log({ p1: JSON.stringify(parkinglist) })
                //     await FUNCTIONSLIST.assignedOrderTouser({
                //         array: parkinglist,
                //         modalname: 'parking', user_id: findUser?._id, is_privilegeuser: true
                //     })
                // }

                // }
                if (MSG91ENABLE) {
                    let sendingData = {
                        personname: name,
                        phone: findUser?.phone_number,
                        seatposition: seatData?.seat_status, providername
                    }
                    await sendotpfn.privilegeInvitesms({
                        ...sendingData
                    });
                    await sendotpfn.privilegeInviteWp({
                        ...sendingData
                    });
                }
            }

            res.status(200).json({ message: "User and Seat updated successfully", status: 1 });
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: error.message });
        }

    },
    activeTicket: async function (req, res, next) {
        try {
            console.log({ bodydata: req.body })
            let { ticket_id, phone_number, name, gender, change_image } = req.body;
            let { _id: user_id } = req.user;

            let findTicket = await PRIVILEGEORDERTICKETMODAL.findOne({ _id: ticket_id, user: user_id });
            if (findTicket) {
                let findUser = await USERMODAL.findOne({ _id: findTicket.user, is_deleted: false });
                console.log({ change_image, j: !change_image })
                const file = req.file;
                let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'PrivilegeUsers' }) : '';
                imagurlpath = status === 1 ? imagurlpath : '';

                await USERORDERTICKETMODAL.findOneAndUpdate({ _id: findTicket.ticket_user }, {
                    profile_pic: imagurlpath,
                }, {
                    new: true
                })
                if (findUser && !findUser.profile_pic) {
                    await USERMODAL.findOneAndUpdate({ _id: findTicket.user, is_deleted: false }, {
                        profile_pic: imagurlpath,
                    }, { new: true });

                }
                await SOFASEATMODAL.findOneAndUpdate(
                    { _id: findTicket.seat },
                    {
                        seat_status: 'Booked', is_active: true,
                    }, { new: true }
                );
                // let userTicketData = await USERORDERTICKETMODAL.create({
                //     phone_number: findUser?.phone_number, name: findUser?.name, gender: findUser?.gender,
                //     profile_pic: imagurlpath,
                // })

                // let ticketData = await PRIVILEGEORDERTICKETMODAL.findOneAndUpdate({ _id: findTicket._id }, {
                //     ticket_user: userTicketData._id,
                //     is_active: true,
                // }, { new: true })
                // if (!change_image) {
                let ticketData = await PRIVILEGEORDERTICKETMODAL.findOneAndUpdate({ _id: findTicket._id }, {
                    is_active: true,
                }, { new: true })

                // }
                res.status(200).json({ message: "Ticket update Done.", status: 0, });


            } else {
                res.status(200).json({ message: "Ticket not Found..", status: 0 });
            }
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    changesSofaSeat: async function (req, res, next) {
        try {
            let { seat_id, phone_number, name, gender, } = req.body;
            let findSeat = await SOFASEATMODAL.findOne({ _id: seat_id });
            console.log({ findSeat });
            if (findSeat) {
                let findUser = await USERMODAL.findOne({ phone_number, is_deleted: false });
                if (findUser) {

                }
                // const file = req.file;
                // let { status, url: imagurlpath } = file ? await ocenfileupload.imageuploads({ file, foldername: 'PrivilegeUsers' }) : '';
                // imagurlpath = status === 1 ? imagurlpath : '';
                //user
            } else {

            }

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    removedSeatuser: async function (req, res, next) {
        try {
            let { seat_id } = req.body;
            const { _id: provider_id, roles: provider_role, name: providername } = req.user;
            let findSeat = await SOFASEATMODAL.findOne({ _id: seat_id, provided_id: provider_id });
            if (findSeat) {
                let findSeatUserTicket = await PRIVILEGEORDERTICKETMODAL.findOne({ seat: seat_id });
                // privilege_tickets
                let userData = await USERMODAL.findOneAndUpdate({ _id: findSeatUserTicket.user, is_deleted: false },
                    { $pull: { privilege_tickets: findSeatUserTicket._id } },
                    { new: true });
                let seatData = await SOFASEATMODAL.findOneAndUpdate({ _id: seat_id }, {
                    seat_status: 'Available', $unset: { ticket_user: 1, user: 1, parking: 1 },
                    is_used: false, is_active: false, allow_change: true, is_alloted: false
                }, { new: true });

                let invitesLogs = await PRIVILEGEINVITELOGSMODAL.create({
                    user: userData._id,
                    user_name: userData?.name,
                    phone_number: userData?.phone_number,
                    profile_pic: userData?.profile_pic,
                    seat: seat_id,
                    log: 'Removed'

                })

                if (MSG91ENABLE) {
                    let sendingData = {
                        personname: userData?.name,
                        phone: userData?.phone_number,
                        seatposition: seatData?.seat_position, providername
                    }
                    await sendotpfn.privilegeInviteCancellationSms({
                        ...sendingData
                    });
                    await sendotpfn.privilegeInviteCancellationWp({
                        ...sendingData
                    });
                }
                await USERMODAL.findOneAndUpdate({
                    _id: provider_id, is_deleted: false
                }, {
                    is_privilegeuser: false,
                    $addToSet: { privilege_invitelogs: invitesLogs._id },
                }, { new: true });
                res.status(200).json({ status: 1, message: 'User Removed Successfully..' });
            } else {
                res.status(200).json({ status: 0, message: 'Seat Not Found' });
            }

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
    test: async function (req, res, next) {
        try {

        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: 0, message: JSON.stringify(error) });
        }
    },
}

function generateSeating({ rows, sofasPerRow, seatsPerSofa }) {
    var seatingArrangement = [];

    for (var row = 1; row <= rows; row++) {
        var rowName = String.fromCharCode(64 + row);
        var rowObj = {
            // sofa_row: 'Row ' + rowName,
            sofa_row: rowName,
            sofas: []
        };

        for (var sofa = 1; sofa <= sofasPerRow; sofa++) {
            var sofaObj = {
                sofa: sofa.toString(),
                seats: []
            };

            for (var seat = 1; seat <= seatsPerSofa; seat++) {
                var position = seat === 1 ? 'left' : seat === seatsPerSofa ? 'right' : 'middle';
                // console.log({ position, r: seat, seatsPerSofa })
                var seatIdWithinRow = (sofa - 1) * seatsPerSofa + seat;
                var seatObj = {
                    seat_name: rowName + seatIdWithinRow,
                    position: position
                };
                sofaObj.seats.push(seatObj);
            }

            rowObj.sofas.push(sofaObj);
        }

        seatingArrangement.push(rowObj);
    }

    return seatingArrangement;
}

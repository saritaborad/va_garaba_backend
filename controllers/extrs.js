// const promises = [];

// for (const userdata of sheetData) {
//     if (userdata.phone_number) {
//         collectPhoneNumber.push(userdata.phone_number);

//         promises.push(processUserData(userdata));
//     } else {
//         mobileNumberNotFoundData.push({ ...useObjectData });
//     }
// }

// async function processUserData(userdata) {
// const capitalized = capitalizeWords(userdata.name);
//     const useObjectData = {
//         name: String(capitalized),
//         birth_date: moment(userdata?.data_of_birth).format("YYYY-MM-DD"),
//         blood_group: userdata?.blood_group,
//         instagram_Id: userdata?.instagram_Id,
//         gender: userdata?.gender?.toLowerCase(),
//     };

//     const findExistData = await USERMODAL.findOne({
//         phone_number: userdata.phone_number,
//         is_deleted: false
//     });

//     if (findExistData) {
//         alreadyExistsData.push({ ...useObjectData, phone_number: userdata.phone_number });

//         if (findExistData && findExistData.roles === 'n-user') {
//             console.log({ mesg: 'user Already found', findExistData });
//             const updatedData = await USERMODAL.findOneAndUpdate(
//                 { phone_number: userdata.phone_number, is_deleted: false },
//                 { ...useObjectData },
//                 { new: true }
//             );

//             changeNToPuserData.push({ ...useObjectData, phone_number: userdata.phone_number });

//             studentCsvlist.push(updatedData?._id);
//         }
//     } else {
//         importData.push({
//             ...useObjectData, phone_number: userdata.phone_number
//         })
//         if (!findExistData) {
//             const newUser = await USERMODAL.create({
//                 ...useObjectData,
//                 phone_number: String(userdata.phone_number),
//                 is_completed: false,
//             });
//             if (newUser && newUser.roles === 'n-user') {
//                 const createNewPass = await PASSMODAL.create({
//                     user: newUser._id,
//                     pass_price: zonePrice,
//                     is_csv: true,
//                     season_name: season_name || allconfig.SEASSON_NAME,
//                     zone: zoneid,
//                     from_date: from_date || allconfig.FROM_DATE,
//                     pass_status: 'Active',
//                     garba_class: branch_id,
//                     season_time: season_time || allconfig.SEASSON_TIME,
//                     to_date: to_date || allconfig.TO_DATE,
//                     is_completed: false,
//                 });

//                 await USERMODAL.findOneAndUpdate(
//                     { _id: newUser._id, is_deleted: false },
//                     { pass_list: createNewPass?._id, roles: 'p-user' },
//                     { new: true }
//                 );

//                 if (allconfig.PROD_ENVIRONMENT) {
//                     sendingSmsPhoneNumber.push({
//                         phone: newUser?.phone_number,
//                         username: newUser?.name,
//                         eventname: season_name || allconfig.SEASSON_NAME,
//                     });
//                 }

//                 studentCsvlist.push(newUser?._id);
//             }
//         }
//     }
// }

// // Execute all the promises concurrently
// await Promise.all(promises);
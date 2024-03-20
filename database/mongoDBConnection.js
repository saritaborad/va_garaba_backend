const mongoose = require('mongoose');
const allconfig = require('../config/allconfig');
const FUNCTIONLIST = require('../helper/functions');
const { logger } = require('../utilis/logger');
const schedule = require('node-schedule');


console.log({ db: allconfig.DB_URL })
mongoose.connect(allconfig.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log(`DB Connected Successfully..`);
}).catch(err => console.log(`DB Err: ${err}`))

// Schedule the task to run every day at 6:00 PM

schedule.scheduleJob('00 06 * * *', async () => {
  try {
    // FUNCTIONLIST.refundToSponsore();
    // FUNCTIONLIST.privilegePassTicektReset();
    logger.info('allow_change updated to false for all Pass users');
    logger.info('allow_change updated to true for');
  } catch (error) {
    console.error('Error updating allow_change:', error);
  }
});

function groupDataByProviderId(data) {
  return data.reduce((groups, document) => {
    const providerId = document.provider_id; // Update with your field name
    if (!groups[providerId]) {
      groups[providerId] = [];
    }
    groups[providerId].push(document);
    return groups;
  }, {});
}

function calculateTotal(groups) {
  return Object.keys(groups).reduce((totalByProvider, providerId) => {
    const group = groups[providerId];
    const total = group.reduce((sum, document) => sum + document.price, 0);
    totalByProvider[providerId] = total;
    return totalByProvider;
  }, {});
}
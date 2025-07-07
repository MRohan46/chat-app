const emailStatusModel = require("../model/EmailOpenModel");
const emailClickModel = require("../model/ClickLogModel");

module.exports.tracking = async (req, res, next) => {
  try {
    const { dataType } = req.body;

    let emailRecords;

    if (dataType === "opens") {
      emailRecords = await emailStatusModel.find({});
    } else{
      emailRecords = await emailClickModel.find({});
    }

    // Send response back to client (optional)
    res.status(200).json({
      success: true,
      dataType,
      records: emailRecords,
    });
  } catch (ex) {
    console.error("Error in tracking:", ex);
    next(ex);
  }
};

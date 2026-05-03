const External = require("../models/External");

const addExternalAccount = async (req, res) => {
  const userId = req.userId;
  const { bankName, account, routing } = req.body;

  if (!bankName || !account || !routing)
    return res.status(400).json({ message: "invalid input" });

  try {
    const externalData = { bankName, account, routing };

    const external = await External.create({
      bankName,
      account,
      routing,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "External account added successfully.",
      data: external,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

const fetchUserExternal = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(400).json({ message: "Bad request!" });

  try {
    const externalAccs = await External.find({ userId }).lean();

    res.status(200).json({
      data: externalAccs,
      success: true,
      message: "External accounts fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

const editUserExternal = async (req, res) => {
  const { accountNo, routingNo, bankName, acctId } = req.body;

  try {
    const acctToUpdate = await External.findById(acctId);

    if (!acctToUpdate)
      return res.status(404).json({ message: "Account not found" });

    if (accountNo) {
      acctToUpdate.account = accountNo;
    }
    if (routingNo) {
      acctToUpdate.routing = routingNo;
    }
    if (bankName) {
      acctToUpdate.bankName = bankName;
    }

    acctToUpdate.save();

    res.status(200).json({ acctToUpdate });
  } catch (error) {
    res.status(500).json({ message: "error fetching externals. try again" });
  }
};

module.exports = { fetchUserExternal, addExternalAccount, editUserExternal };

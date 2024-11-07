const External = require("../models/External");

const addExternalAccount = async (req, res) => {
  const userId = req.userId;
  const { bank, account, routing } = req.body;

  if (!bank || !account || !routing)
    return res.status(400).json({ message: "invalid input" });

  try {
    const externalData = { bank, account, routing };

    await External.addExternal(userId, externalData);

    res.status(201).json({ message: "External added." });
  } catch (error) {
    res.status(500).json({ message: "error adding external. try again" });
  }
};

const fetchUserExternal = async (req, res) => {
  const userId = req.userId;

  try {
    const externalAccs = await External.getUserExternals(userId);

    res.status(201).json({ externalAccs });
  } catch (error) {
    res.status(500).json({ message: "error fetching externals. try again" });
  }
};

module.exports = { fetchUserExternal, addExternalAccount };

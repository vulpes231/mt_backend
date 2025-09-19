const { generateAccountNumber } = require("../utils/gen-account");
const User = require("../models/User");
const Account = require("../models/Account");

const getAllAccounts = async (req, res) => {
	try {
		const accts = await Account.find();
		res
			.status(200)
			.json({
				data: accts,
				success: true,
				message: "Account fetched successfully",
			});
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, success: false, data: null });
	}
};

const createNewAccount = async (req, res) => {
	const { username, accountType } = req.body;

	if (!username || !accountType) {
		return res.status(400).json({ message: "All fields required" });
	}

	try {
		const user = await User.findOne({ username: username });
		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}
		const accNo = parseInt(generateAccountNumber());

		const duplicate = await Account.findOne({ accountNo: accNo });
		if (duplicate) {
			return res
				.status(409)
				.json({ message: "Account already exists!", success: false });
		}

		const newAccount = {
			owner: user._id,
			accountNo: accNo,
			accountType: accountType,
		};
		await Account.create(newAccount);

		res
			.status(200)
			.json({ message: "New account created!", success: false, data: null });
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, success: false, data: null });
	}
};

const getAccountInfo = async (req, res) => {
	const { accountId } = req.params;
	if (accountId)
		return res
			.status(400)
			.json({ message: "Invalid account ID!", status: false });

	try {
		const accountInfo = await Account.findById(accountId);
		res.status(200).json({
			data: accountInfo,
			success: true,
			message: "Account info fetched successfully.",
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, success: false, data: null });
	}
};

const getUserAccounts = async (req, res) => {
	const userId = req.userId;
	if (!userId)
		return res
			.status(401)
			.json({ message: "You're not logged in!", success: false });

	try {
		const userAccounts = await Account.find({ owner: userId }).lean();

		res.status(200).json({
			data: userAccounts,
			success: true,
			message: "User accounts fetched successfully.",
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "an error occured", success: false, data: null });
	}
};

module.exports = {
	createNewAccount,
	getAllAccounts,
	getUserAccounts,
	getAccountInfo,
};

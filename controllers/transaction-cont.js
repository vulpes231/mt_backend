const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

const getAllTransactions = async (req, res) => {
	try {
		const transactions = await Transaction.find();
		res.status(200).json({
			data: transactions,
			success: true,
			message: "Account transactions fetched succesfully.",
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

const getUserTransactions = async (req, res) => {
	const userId = req.userId;
	if (!userId) return res.status(400).json({ message: "Bad request!" });

	const page = Math.max(1, req.query.page || 1);
	const limit = Math.min(10, req.query.limit || 10);
	const sortBy = req.query.sortBy;
	const filterBy = req.query.filterBy;

	try {
		const sort = {};
		const filter = {};

		if (sortBy) sort[sortBy] = -1;
		if (filterBy) filter[filterBy] = filterBy;

		const userTransactions = await Transaction.find(filter)
			.sort(sort)
			.skip((page * 1) / limit)
			.limit(limit);

		const totalItems = await Transaction.countDocuments(filter);
		const totalPages = Math.ceil(totalItems / limit);

		res.status(200).json({
			data: userTransactions,
			success: true,
			message: "user transactions fetched successfully.",
			pagination: {
				currentPage: page,
				totalPage: totalPages,
				totalItem: totalItems,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

const createNewTransaction = async (req, res) => {
	const {
		accountNumber,
		description,
		amount,
		type,
		date,
		time,
		username,
		status,
	} = req.body;

	if (!accountNumber || !description || !amount || !type || !date) {
		return res.status(400).json({ message: "Invalid transaction data!" });
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const user = await User.findOne({ username }).session(session);
		if (!user) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: "User not found!" });
		}

		const userAccount = await Account.findOne({
			accountNo: accountNumber,
		}).session(session);
		if (!userAccount) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: "Account not found!" });
		}

		const parsedAmount = parseFloat(amount);
		if (type == "credit") {
			userAccount.balance = userAccount.balance += parsedAmount;
		} else if (type == "debit") {
			userAccount.balance = userAccount.balance -= parsedAmount;
		} else {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({ message: "Invalid transaction type" });
		}

		await userAccount.save({ session });

		const newTransaction = {
			accountNo: accountNumber,
			amount: parsedAmount,
			description: description,
			date: date,
			type: type,
			receiver: user._id,
			balance: userAccount.balance,
			time: time || null,
			status: status || "completed",
		};

		await Transaction.create([newTransaction], { session });

		await session.commitTransaction();
		session.endSession();

		res
			.status(200)
			.json({ message: "Transaction created!", data: null, success: true });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

const getAccountTransaction = async (req, res) => {
	const userId = req.userId;
	if (!userId)
		return res.status(401).json({ message: "You're not logged in." });
	const { accountNo } = req.params;
	try {
		const trnxs = await Transaction.find({ accountNo: accountNo }).lean();
		res.status(200).json({
			data: trnxs,
			success: true,
			message: "Account transactions fetched succesfully.",
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

module.exports = {
	createNewTransaction,
	getUserTransactions,
	getAllTransactions,
	getAccountTransaction,
};

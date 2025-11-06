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

	const page = Math.max(1, parseInt(req.query.page) || 1);
	const limit = Math.min(50, parseInt(req.query.limit) || 10); // Increased max limit to 50
	const sortBy = req.query.sortBy || "createdAt"; // Default sort by createdAt
	const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // Add sort order option
	const filterBy = req.query.filterBy;
	const filterValue = req.query.filterValue;

	try {
		const sort = {};
		const filter = { receiver: userId };

		// Enhanced filtering for enum fields
		if (filterBy && filterValue) {
			if (filterBy === "status") {
				filter.status = { $in: filterValue.split(",") }; // Allow multiple statuses: ?filterBy=status&filterValue=pending,completed
			} else if (filterBy === "type") {
				filter.type = { $in: filterValue.split(",") }; // Allow multiple types
			} else {
				filter[filterBy] = filterValue;
			}
		}

		// Enhanced sorting with defaults
		if (sortBy === "date" || sortBy === "time") {
			// For date/time sorting, you might want to combine them or use createdAt
			sort["createdAt"] = sortOrder;
		} else {
			sort[sortBy] = sortOrder;
		}

		const userTransactions = await Transaction.find(filter)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // Add lean() for better performance if not modifying

		const totalItems = await Transaction.countDocuments(filter);
		const totalPages = Math.ceil(totalItems / limit);

		res.status(200).json({
			data: userTransactions,
			success: true,
			message: "User transactions fetched successfully.",
			pagination: {
				currentPage: page,
				totalPages: totalPages, // Fixed: consistent naming
				totalItems: totalItems, // Fixed: consistent naming
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Get user transactions error:", error);
		res.status(500).json({
			message: "Internal server error",
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
			userAccount.balance += parsedAmount;
		} else if (type == "debit") {
			userAccount.balance -= parsedAmount;
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
	// console.log(req.query);
	const userId = req.userId;
	if (!userId)
		return res.status(401).json({ message: "You're not logged in." });
	const accountNo = req.query.accountNo;
	const page = Math.max(1, parseInt(req.query.page) || 1);
	const limit = Math.min(10, parseInt(req.query.limit) || 10);
	const sortBy = req.query.sortBy;
	const filterBy = req.query.filterBy;
	const filterValue = req.query.filterValue; // 👈 added
	try {
		const sort = {};
		const filter = { receiver: userId, accountNo: accountNo }; // ensure transactions are scoped to the user

		// Apply filter if provided
		if (filterBy && filterValue) {
			filter[filterBy] = filterValue;
		}

		// Apply sorting if provided
		if (sortBy) {
			sort[sortBy] = -1; // descending
		}
		const trnxs = await Transaction.find(filter)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(limit);

		const totalItems = await Transaction.countDocuments(filter);
		const totalPages = Math.ceil(totalItems / limit);

		res.status(200).json({
			data: trnxs,
			success: true,
			message: "Account transactions fetched succesfully.",
			pagination: {
				currentPage: page,
				totalPage: totalPages,
				totalItem: totalItems,
			},
		});
	} catch (error) {
		console.log(error);
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

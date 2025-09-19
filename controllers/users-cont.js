const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find().lean();
		res.status(200).json({
			data: users,
			success: true,
			message: "Users fetched successfully.",
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

const getUser = async (req, res) => {
	const userId = req.userId;
	if (!userId) return res.status(400).json({ message: "Bad request!" });
	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "user not found" });
		res
			.status(200)
			.json({
				data: user,
				message: "User info fetched successfully",
				success: true,
			});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

const updateUser = async (req, res) => {
	const { email, phone, address } = req.body;

	const userId = req.userId;
	if (!userId) return res.status(400).json({ message: "Bad request!" });

	try {
		const user = await User.findOne({ _id: userId });
		if (!user) return res.status(400).json({ message: "User not found." });

		if (email) user.email = email;
		if (phone) user.phone = phone;
		if (address) user.address = address;

		await user.save();

		res.status(200).json({
			message: `${user.username} profile updated!`,
			data: null,
			success: true,
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

const deleteUser = async (req, res) => {
	const { userId } = req.params;

	try {
		const userAccount = await Account.deleteMany({ owner: userId });
		if (!userAccount)
			return res.status(404).json({ message: "User account not found!" });

		await Transaction.deleteMany({ receiver: userId });

		const user = await User.findByIdAndDelete(userId);
		if (!user) return res.status(404).json({ message: "User not found!" });

		res
			.status(200)
			.json({ message: "User deleted!", data: null, success: true });
	} catch (error) {
		res.status(500).json({
			message: error.message,
			data: null,
			success: false,
		});
	}
};

module.exports = { getAllUsers, updateUser, getUser, deleteUser };

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
// User

const changeUserPassword = async (req, res) => {
	const { password, newPassword } = req.body;

	if (!password || !newPassword) {
		return res
			.status(400)
			.json({ message: "Current password and new password required!" });
	}

	const userId = req.userId;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const user = await User.findById(userId)
			.select("+password")
			.session(session);
		if (!user) {
			await session.abortTransaction();
			session.endSession();
			return res.status(401).json({ message: "User not found!" });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			await session.abortTransaction();
			session.endSession();
			return res.status(401).json({ message: "Invalid password!" });
		}

		const hashedPwd = await bcrypt.hash(newPassword, 10);
		user.password = hashedPwd;

		await user.save({ session });
		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({ message: "Password updated successfully!" });
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		console.error(err);
		return res
			.status(500)
			.json({ message: "An error occurred while updating the password!" });
	}
};

module.exports = { changeUserPassword };

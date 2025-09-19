const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loginUser = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password)
		return res
			.status(400)
			.json({ message: "Username and password is required!" });

	try {
		const user = await User.findOne({ username: username });
		if (!user)
			return res.status(401).json({ message: "Username does not exist!" });

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(401).json({ message: "Invalid username or password!" });
		} else {
			const accessToken = jwt.sign(
				{
					username: user.username,
					userId: user._id,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{
					expiresIn: "1d",
				}
			);
			const refreshToken = jwt.sign(
				{
					username: user.username,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{
					expiresIn: "1d",
				}
			);

			await user.save();
			res.cookie("jwt", refreshToken, {
				httpOnly: true,
				sameSite: "None",
				secure: true,
				maxAge: 24 * 60 * 60 * 1000,
			});

			res.status(200).json({
				token: accessToken,
				data: user,
				success: true,
				message: "Login success.",
			});
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, data: null, success: false });
	}
};

module.exports = loginUser;

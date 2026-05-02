const User = require("../models/User");
const { generateUserToken } = require("../middlewares/verifyToken");

const handleUserToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401);
  console.log(cookies.jwt);

  try {
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken: refreshToken });

    if (!user) return res.status(403).json({ message: "Forbidden!" });

    const newToken = await generateUserToken(user.username, user._id, "access");

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || user.username !== decoded.username) return res.status(403);
        const accessToken = newToken;
        res.status(200).json({ accessToken });
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

module.exports = { handleUserToken };

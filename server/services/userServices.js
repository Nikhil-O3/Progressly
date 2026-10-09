import User from "../models/userSchema.js";

export const userData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
};
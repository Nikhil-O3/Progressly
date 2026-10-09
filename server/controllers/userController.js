import User from "../models/userSchema.js";
import Follow from "../models/followSchema.js";
import Metric from "../models/metricSchema.js";
import Entry from "../models/entrySchema.js";

// GET /api/users/search?q=query
export const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json([]);
  try {
    const users = await User.find({
      name: { $regex: q.trim(), $options: "i" },
      _id: { $ne: req.userId }, // exclude self
    }).select("name email _id").limit(10);
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/users/:id/follow
export const followUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.userId) return res.status(400).json({ error: "Cannot follow yourself" });
  try {
    await Follow.create({ follower: req.userId, following: id });
    res.json({ success: true, following: true });
  } catch (e) {
    if (e.code === 11000) return res.json({ success: true, following: true }); // already following
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/users/:id/follow
export const unfollowUser = async (req, res) => {
  try {
    await Follow.findOneAndDelete({ follower: req.userId, following: req.params.id });
    res.json({ success: true, following: false });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/users/:id/follow-status
export const followStatus = async (req, res) => {
  try {
    const exists = await Follow.findOne({ follower: req.userId, following: req.params.id });
    const followerCount = await Follow.countDocuments({ following: req.params.id });
    const followingCount = await Follow.countDocuments({ follower: req.params.id });
    res.json({ following: !!exists, followerCount, followingCount });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/feed — recent entries from people you follow
export const getFeed = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.userId }).select("following");
    const followingIds = follows.map((f) => f.following);

    if (followingIds.length === 0) return res.json([]);

    // Get public metrics of followed users
    const metrics = await Metric.find({ userId: { $in: followingIds }, isPublic: true });
    const metricIds = metrics.map((m) => m._id);

    // Get last 30 entries from those metrics
    const entries = await Entry.find({ metricId: { $in: metricIds } })
      .sort({ createdAt: -1 })
      .limit(30);

    // Build feed items
    const feedItems = await Promise.all(entries.map(async (entry) => {
      const metric = metrics.find((m) => m._id.toString() === entry.metricId.toString());
      const user = await User.findById(metric.userId).select("name _id");
      return { entry, metric, user };
    }));

    res.json(feedItems);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

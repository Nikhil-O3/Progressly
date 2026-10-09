import Metric from "../models/metricSchema.js";
import Entry from "../models/entrySchema.js";
import User from "../models/userSchema.js";

// GET /api/metrics
export const getMetrics = async (req, res) => {
  try {
    const metrics = await Metric.find({ userId: req.userId });
    return res.json(metrics);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/metrics
export const createMetric = async (req, res) => {
  const { name, unit, color, isPublic, type } = req.body;
  if (!name || !unit) return res.status(400).json({ error: "Name and unit required" });
  try {
    const metric = await Metric.create({
      userId: req.userId,
      name: name.trim(),
      unit: unit.trim(),
      type: type || "number",
      color: color || "#4f46e5",
      isPublic: isPublic !== false,
    });
    return res.status(201).json(metric);
  } catch (e) {
    console.error("createMetric error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/metrics/:id
export const updateMetric = async (req, res) => {
  const { name, unit, color, isPublic, type } = req.body;
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (unit !== undefined) updateData.unit = unit.trim();
    if (color !== undefined) updateData.color = color;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (type !== undefined) updateData.type = type;

    const metric = await Metric.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );
    if (!metric) return res.status(404).json({ error: "Metric not found" });
    return res.json(metric);
  } catch (e) {
    console.error("updateMetric error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/metrics/:id
export const deleteMetric = async (req, res) => {
  try {
    await Metric.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    await Entry.deleteMany({ metricId: req.params.id });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/metrics/:id/entries
export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ metricId: req.params.id, userId: req.userId }).sort({ date: 1 });
    return res.json(entries);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/metrics/:id/entries
export const addEntry = async (req, res) => {
  const { value, date, note } = req.body;
  if (value === undefined || !date) return res.status(400).json({ error: "Value and date required" });
  try {
    const entry = await Entry.create({
      metricId: req.params.id,
      userId: req.userId,
      value: Number(value),
      date,
      note: note || "",
    });
    return res.status(201).json(entry);
  } catch (e) {
    console.error("addEntry error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/metrics/:id/entries/:entryId
export const updateEntry = async (req, res) => {
  const { value, date, note } = req.body;
  try {
    const updateData = {};
    if (value !== undefined) updateData.value = Number(value);
    if (date) updateData.date = date;
    if (note !== undefined) updateData.note = note;

    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.entryId, metricId: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    return res.json(entry);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/metrics/:id/entries/:entryId
export const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.entryId,
      metricId: req.params.id,
      userId: req.userId,
    });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/metrics/:id/stats — streak, total, avg + all entries
export const getStats = async (req, res) => {
  try {
    const metric = await Metric.findOne({ _id: req.params.id, userId: req.userId });
    if (!metric) return res.status(404).json({ error: "Metric not found" });

    const entries = await Entry.find({ metricId: req.params.id, userId: req.userId }).sort({ date: 1 });

    // streak: count consecutive days back from today (where value > 0)
    const today = new Date().toISOString().split("T")[0];
    const activeDates = new Set(entries.filter((e) => e.value > 0).map((e) => e.date));
    let streak = 0;
    let check = today;
    while (activeDates.has(check)) {
      streak++;
      const d = new Date(check);
      d.setDate(d.getDate() - 1);
      check = d.toISOString().split("T")[0];
    }

    const total = entries.reduce((sum, e) => sum + e.value, 0);
    const avg = entries.length ? (total / entries.length).toFixed(1) : 0;

    return res.json({ metric, entries, streak, total, avg });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/profile/:userId — public profile with optional Redis cache
export const getPublicProfile = async (req, res) => {
  const { userId } = req.params;

  // try redis cache
  try {
    const { default: redis } = await import("../config/redis.js");
    const cached = await redis.get(`profile:${userId}`);
    if (cached) return res.json({ ...JSON.parse(cached), fromCache: true });
  } catch (_) {}

  try {
    const user = await User.findById(userId).select("name isPublic _id");
    // FIX: only block if isPublic is explicitly false (handles old users without field)
    if (!user || user.isPublic === false) {
      return res.status(404).json({ error: "Profile not found or private" });
    }

    const metrics = await Metric.find({ userId, isPublic: true });
    const metricsWithEntries = await Promise.all(
      metrics.map(async (m) => {
        const entries = await Entry.find({ metricId: m._id }).sort({ date: 1 });
        const total = entries.reduce((sum, e) => sum + e.value, 0);
        return { metric: m, entries, total };
      })
    );

    const profileData = { user: { _id: user._id, name: user.name }, metrics: metricsWithEntries };

    // cache for 60s
    try {
      const { default: redis } = await import("../config/redis.js");
      await redis.set(`profile:${userId}`, JSON.stringify(profileData), "EX", 60);
    } catch (_) {}

    return res.json({ ...profileData, fromCache: false });
  } catch (e) {
    console.error("getPublicProfile error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
};

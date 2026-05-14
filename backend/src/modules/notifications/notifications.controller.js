const db = require("../../db/connection");
const { paginationSchema } = require("./notifications.validation");

exports.getMyNotifications = async function getMyNotifications(req, res, next) {
  try {
    const parsed = paginationSchema.parse(req.query);
    const { page, limit } = parsed;
    const offset = (page - 1) * limit;

    const items = await db("notifications")
      .where({ recipient_id: req.userId })
      .orderBy("created_at", "desc")
      .offset(offset)
      .limit(limit);

    const unreadRow = await db("notifications")
      .where({ recipient_id: req.userId, is_read: false })
      .count("id as count")
      .first();

    return res.status(200).json({
      success: true,
      data: {
        items,
        page,
        limit,
        unread_count: Number(unreadRow.count || 0),
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.markAsRead = async function markAsRead(req, res, next) {
  try {
    await db("notifications")
      .where({ id: req.params.id, recipient_id: req.userId })
      .update({ is_read: true });
    return res
      .status(200)
      .json({ success: true, data: { message: "Marked as read" } });
  } catch (error) {
    return next(error);
  }
};

exports.markAllAsRead = async function markAllAsRead(req, res, next) {
  try {
    await db("notifications")
      .where({ recipient_id: req.userId })
      .update({ is_read: true });
    return res
      .status(200)
      .json({ success: true, data: { message: "All marked as read" } });
  } catch (error) {
    return next(error);
  }
};

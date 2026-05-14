const db = require("../../db/connection");
let io = null;

function setSocket(serverIo) {
  io = serverIo;
}

async function notifyUser(userId, { type, title, body, data }) {
  const [row] = await db("notifications")
    .insert({ recipient_id: userId, type, title, body, data: data || null })
    .returning("*");

  if (io) {
    io.to(`user:${userId}`).emit("notification", row);
  }

  return row;
}

async function bulkNotify(userIds, payload) {
  const items = userIds.map((userId) => ({
    recipient_id: userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    data: payload.data || null,
  }));

  const rows = await db("notifications").insert(items).returning("*");

  if (io) {
    for (const r of rows) {
      io.to(`user:${r.recipient_id}`).emit("notification", r);
    }
  }

  return rows;
}

module.exports = { setSocket, notifyUser, bulkNotify };

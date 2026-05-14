const db = require("../../db/connection");
const { uploadImage } = require("../../utils/cloudinaryUpload");
const {
  eventCreateSchema,
  eventUpdateSchema,
  paginationSchema,
} = require("./events.validation");
const { evaluateAll } = require("../../utils/achievementEngine");

const createHttpError = (status, code, message) => {
  const err = new Error(message);
  err.statusCode = status;
  err.code = code;
  return err;
};

exports.createEvent = async function createEvent(req, res, next) {
  try {
    const parsed = eventCreateSchema.parse(req.body);

    let coverUrl = null;
    if (req.file && req.file.buffer) {
      const uploaded = await uploadImage(req.file.buffer, {
        mimeType: req.file.mimetype,
      });
      coverUrl = uploaded.url;
    }

    const [created] = await db("events")
      .insert({
        club_id: req.params.clubId,
        title: parsed.title,
        description: parsed.description || null,
        event_type: parsed.event_type,
        location: parsed.location || null,
        virtual_meeting_link: parsed.virtual_meeting_link || null,
        start_datetime: parsed.start_datetime,
        end_datetime: parsed.end_datetime,
        timezone: parsed.timezone || "UTC",
        cover_image_url: coverUrl,
        visibility: parsed.visibility,
        rsvp_required: parsed.rsvp_required,
        rsvp_opens_at: parsed.rsvp_opens_at || null,
        rsvp_closes_at: parsed.rsvp_closes_at || null,
        capacity: parsed.capacity || null,
        waitlist_enabled: parsed.waitlist_enabled,
        custom_rsvp_questions: parsed.custom_rsvp_questions || null,
        checkin_method: parsed.checkin_method || null,
        checkin_code: parsed.checkin_code || null,
        status: "published",
        created_by: req.userId,
      })
      .returning("*");

    // Notify members - simple approach: insert notifications for active members
    // (Notification service will handle emit)
    const members = await db("club_memberships")
      .where({ club_id: req.params.clubId, status: "active" })
      .select("user_id");
    const notifications = members.map((m) => ({
      recipient_id: m.user_id,
      type: "event_created",
      title: `New event: ${created.title}`,
      body: created.description || null,
      data: JSON.stringify({ event_id: created.id }),
    }));

    if (notifications.length) {
      await db("notifications").insert(notifications);
    }

    return res.status(201).json({ success: true, data: { event: created } });
  } catch (error) {
    return next(error);
  }
};

exports.listClubEvents = async function listClubEvents(req, res, next) {
  try {
    const parsed = paginationSchema.parse(req.query);
    const { page, limit } = parsed;
    const offset = (page - 1) * limit;

    const items = await db("events")
      .where({ club_id: req.params.clubId })
      .andWhere("status", "published")
      .orderBy("start_datetime", "asc")
      .offset(offset)
      .limit(limit);

    return res
      .status(200)
      .json({ success: true, data: { items, page, limit } });
  } catch (error) {
    return next(error);
  }
};

exports.getEvent = async function getEvent(req, res, next) {
  try {
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();
    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    // include RSVP status for current user
    let myRsvp = null;
    if (req.userId) {
      myRsvp = await db("event_rsvps")
        .where({ event_id: event.id, user_id: req.userId })
        .first();
    }

    return res.status(200).json({ success: true, data: { event, myRsvp } });
  } catch (error) {
    return next(error);
  }
};

exports.updateEvent = async function updateEvent(req, res, next) {
  try {
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();

    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    if (event.status === "cancelled" || event.status === "completed") {
      throw createHttpError(
        400,
        "CANNOT_UPDATE",
        "Cannot update a cancelled or completed event",
      );
    }

    const validated = eventUpdateSchema.parse(req.body);
    const updateData = {};
    const updatableFields = [
      "title",
      "description",
      "event_type",
      "location",
      "virtual_meeting_link",
      "start_datetime",
      "end_datetime",
      "timezone",
      "visibility",
      "rsvp_required",
      "rsvp_opens_at",
      "rsvp_closes_at",
      "capacity",
      "waitlist_enabled",
      "custom_rsvp_questions",
      "checkin_method",
      "checkin_code",
    ];

    for (const field of updatableFields) {
      if (validated[field] !== undefined) {
        updateData[field] = validated[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw createHttpError(
        400,
        "VALIDATION_ERROR",
        "No valid event fields were provided.",
      );
    }

    const [updated] = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .update(updateData)
      .returning("*");

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

exports.deleteEvent = async function deleteEvent(req, res, next) {
  try {
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();

    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    if (event.status === "cancelled") {
      throw createHttpError(
        400,
        "ALREADY_CANCELLED",
        "Event is already cancelled",
      );
    }

    await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .update({ status: "cancelled" });

    return res
      .status(200)
      .json({ success: true, data: { message: "Event cancelled" } });
  } catch (error) {
    return next(error);
  }
};

exports.rsvp = async function rsvp(req, res, next) {
  try {
    const { number_of_guests = 0, response_data = null } = req.body;
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();
    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    // check capacity
    const registeredCountRow = await db("event_rsvps")
      .where({ event_id: event.id })
      .count("id as count")
      .first();
    const registeredCount = Number(registeredCountRow.count || 0);

    let status = "registered";
    if (event.capacity && registeredCount >= event.capacity) {
      if (event.waitlist_enabled) status = "waitlisted";
      else throw createHttpError(400, "FULL", "Event is full");
    }

    const ticket_code = `TICKET-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    const [rsvp] = await db("event_rsvps")
      .insert({
        event_id: event.id,
        user_id: req.userId,
        status,
        response_data: response_data || null,
        number_of_guests: Number(number_of_guests || 0),
        ticket_code,
      })
      .returning("*");

    // create notification for user
    await db("notifications").insert({
      recipient_id: req.userId,
      type: "rsvp_confirmed",
      title: `RSVP ${status}`,
      body: `Your RSVP status: ${status}`,
      data: JSON.stringify({ event_id: event.id, rsvp_id: rsvp.id }),
    });

    return res.status(201).json({ success: true, data: { rsvp } });
  } catch (error) {
    return next(error);
  }
};

exports.cancelRsvp = async function cancelRsvp(req, res, next) {
  try {
    const rsvp = await db("event_rsvps")
      .where({ event_id: req.params.eventId, user_id: req.userId })
      .first();
    if (!rsvp) throw createHttpError(404, "NOT_FOUND", "RSVP not found");

    await db("event_rsvps")
      .where({ id: rsvp.id })
      .update({ status: "cancelled" });

    // promote waitlist
    const waitlisted = await db("event_rsvps")
      .where({ event_id: req.params.eventId, status: "waitlisted" })
      .orderBy("rsvp_submitted_at", "asc")
      .first();

    if (waitlisted) {
      await db("event_rsvps")
        .where({ id: waitlisted.id })
        .update({ status: "registered" });
      // notify promoted user
      await db("notifications").insert({
        recipient_id: waitlisted.user_id,
        type: "rsvp_promoted",
        title: "You were moved off the waitlist",
        body: "Your RSVP has been confirmed.",
        data: JSON.stringify({ event_id: req.params.eventId }),
      });
    }

    return res
      .status(200)
      .json({ success: true, data: { message: "RSVP cancelled" } });
  } catch (error) {
    return next(error);
  }
};

// attendance endpoints simplified
exports.markAttendance = async function markAttendance(req, res, next) {
  try {
    const { user_id, method = "manual" } = req.body;
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();
    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    await db("attendance_records").insert({
      event_id: event.id,
      user_id,
      checkin_method: method,
      marked_by: req.userId,
    });

    // update rsvp if present
    const rsvp = await db("event_rsvps")
      .where({ event_id: event.id, user_id })
      .first();
    if (rsvp)
      await db("event_rsvps")
        .where({ id: rsvp.id })
        .update({ status: "attended" });

    try {
      await evaluateAll(user_id);
    } catch (err) {
      // Keep attendance success even if achievement checks fail.
    }

    return res
      .status(201)
      .json({ success: true, data: { message: "Attendance recorded" } });
  } catch (error) {
    return next(error);
  }
};

exports.getAttendanceReport = async function getAttendanceReport(
  req,
  res,
  next,
) {
  try {
    const attendees = await db("attendance_records as a")
      .select(
        "a.*",
        db.raw("CONCAT(u.first_name, ' ', u.last_name) as user_name"),
      )
      .leftJoin("users as u", "u.id", "a.user_id")
      .where({ event_id: req.params.eventId })
      .orderBy("a.checkin_time", "asc");

    const registeredCountRow = await db("event_rsvps")
      .where({ event_id: req.params.eventId })
      .count("id as count")
      .first();
    const attendedCountRow = await db("attendance_records")
      .where({ event_id: req.params.eventId })
      .count("id as count")
      .first();

    return res.status(200).json({
      success: true,
      data: {
        attendees,
        registered_count: Number(registeredCountRow.count || 0),
        attended_count: Number(attendedCountRow.count || 0),
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateEvent = async function updateEvent(req, res, next) {
  try {
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();
    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    const [updated] = await db("events")
      .where({ id: event.id })
      .update({
        ...req.body,
        updated_at: db.fn.now(),
      })
      .returning("*");

    return res.status(200).json({ success: true, data: { event: updated } });
  } catch (error) {
    return next(error);
  }
};

exports.deleteEvent = async function deleteEvent(req, res, next) {
  try {
    const event = await db("events")
      .where({ id: req.params.eventId, club_id: req.params.clubId })
      .first();
    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");

    await db("events")
      .where({ id: event.id })
      .update({ status: "cancelled", updated_at: db.fn.now() });

    return res.status(200).json({ success: true, message: "Event cancelled" });
  } catch (error) {
    return next(error);
  }
};

exports.scanTicket = async function scanTicket(req, res, next) {
  try {
    const { ticket_code } = req.body;
    const rsvp = await db("event_rsvps as r")
      .join("users as u", "u.id", "r.user_id")
      .select("r.*", "u.first_name", "u.last_name")
      .where({ "r.ticket_code": ticket_code, "r.event_id": req.params.eventId })
      .first();

    if (!rsvp) throw createHttpError(404, "NOT_FOUND", "Ticket not found");
    if (rsvp.status === "attended") throw createHttpError(409, "ALREADY_CHECKED_IN", "User already checked in");

    await db.transaction(async (trx) => {
      await trx("attendance_records").insert({
        event_id: req.params.eventId,
        user_id: rsvp.user_id,
        rsvp_id: rsvp.id,
        checkin_method: "qr_scan",
        marked_by: req.userId
      });
      await trx("event_rsvps").where({ id: rsvp.id }).update({ status: "attended" });
    });

    return res.status(200).json({ success: true, data: { user: { id: rsvp.user_id, name: `${rsvp.first_name} ${rsvp.last_name}` } } });
  } catch (error) {
    return next(error);
  }
};

exports.selfCheckin = async function selfCheckin(req, res, next) {
  try {
    const { checkin_code } = req.body;
    const event = await db("events").where({ id: req.params.eventId }).first();
    if (!event) throw createHttpError(404, "NOT_FOUND", "Event not found");
    if (event.checkin_code !== checkin_code) throw createHttpError(403, "INVALID_CODE", "Invalid check-in code");

    await db("attendance_records").insert({
      event_id: event.id,
      user_id: req.userId,
      checkin_method: "self_code"
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

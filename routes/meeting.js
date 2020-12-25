const express = require("express");
const meetingController = require("../controllers/meeting");

const router = express.Router();

// GET /products
router.get("/meetings", meetingController.getAllMeetings);

// // GET /meetings/id
// router.get("/meetings/:id",  meetingController.getProduct);

// POST /meetings
router.post("/meetings", meetingController.createMeeting);

// //PUT /meetings/id
// router.put("/meetings/:id",  meetingController.updateProduct);

// //DELETE /meetings/id
// router.delete("/meetings/:id",  meetingController.deleteProduct);

//Exporting the router
module.exports = router;

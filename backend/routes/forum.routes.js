import express from "express";
import ForumController from "../controllers/forum.controller";
import { forumValidation, eventValidation } from "../middleware/validators/forumValidator";

const router = express.Router();

router.post("/", forumValidation, ForumController.createForum);
router.get("/:forumId", ForumController.getForum);
router.put("/:forumId", forumValidation, ForumController.updateForum);
router.delete("/:forumId", ForumController.deleteForum);

router.get("/:forumId/members", ForumController.getForumMembers);
router.delete("/:forumId/members/:memberId", ForumController.removeMember);
router.get("/:forumId/resources", ForumController.getForumResources);

router.post('/events', eventValidation, ForumController.createEvent);
router.get('/events/:forumId', ForumController.getForumEvents);
router.get('/event/:eventId', ForumController.getEvent);
router.put('/event/:eventId', eventValidation, ForumController.updateEvent);
router.delete('/event/:eventId', ForumController.deleteEvent);
router.post('/event/:eventId/participate', ForumController.updateEventParticipation);

export default router;
const express = require("express");

const {
  chat,
  generateDescription,
  similarRecommendations,
  personalizedRecommendations,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/chat", chat);
router.post("/generate-description", generateDescription);
router.get("/recommendations/similar/:eventId", similarRecommendations);
router.get(
  "/recommendations/personalized/:userId",
  personalizedRecommendations,
);

module.exports = router;

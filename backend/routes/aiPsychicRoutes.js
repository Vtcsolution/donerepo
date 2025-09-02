const express = require("express");
const router = express.Router();
const {
  addAiPsychic,
  getAllAiPsychics,
  getAiPsychicById,
  getAiPsychicsByUserId,
  updateAiPsychic,
  deleteAiPsychic,
  getAiPsychicsByType,
  getAiPsychicDetailedProfile
  
} = require("../controllers/aiPsychicController");
router.get("/profile/:psychicId", getAiPsychicDetailedProfile);

// Important: specific routes first
router.post("/add",  addAiPsychic);
router.get("/",  getAllAiPsychics);
router.get("/:id", getAiPsychicById); // must be last
router.get("/user/:userId", getAiPsychicsByUserId);
router.put('/:id', updateAiPsychic)
router.delete("/:id", deleteAiPsychic);
router.get("/type/:type", getAiPsychicsByType);


module.exports = router;

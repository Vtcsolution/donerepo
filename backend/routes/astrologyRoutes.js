const express = require("express");
const router = express.Router();
const { getAstrologyReport, generateAstrologyReport,generatePdfAstrologyReport, getPdfAstrologyReports ,getAllAstrologyReports,getAstrologyReportById} = require("../controllers/astrologyController");
const { protect } = require("../middleware/auth");

router.get("/astrology-report", protect, getAstrologyReport);
router.post("/astrology-report", protect, generateAstrologyReport);
router.get("/reports", protect, getAllAstrologyReports);
router.get("/reports/:reportId", protect, getAstrologyReportById);
router.post("/generate-pdf-astrology-report", protect, generatePdfAstrologyReport);
router.get("/pdf-astrology-reports", protect, getPdfAstrologyReports);

module.exports = router;
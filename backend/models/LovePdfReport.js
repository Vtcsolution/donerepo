const mongoose = require('mongoose');

const lovePdfReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportType: {
    type: String,
    required: true,
    default: 'synastry_couple_report_tropical',
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    default: 'en',
  },
  yourName: {
    type: String,
    required: true,
  },
  partnerName: {
    type: String,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LovePdfReport', lovePdfReportSchema);
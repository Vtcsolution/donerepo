const mongoose = require('mongoose');

const pdfReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, required: true, default: 'natal_horoscope_tropical' },
  pdfUrl: { type: String, required: true },
  language: { type: String, default: 'en' },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('PdfReport', pdfReportSchema);
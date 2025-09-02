const aiFormData = require("../models/aiFormData");
const AiFormData = require("../models/aiFormData");
const aiPsychic = require("../models/aiPsychic");
const { getRequiredFieldsByType } = require("../utils/formLogic");

const SubmitAiForm = async (req, res) => {
  try {
    const userId = req.user._id;
    const { psychicId, formData } = req.body;

    if (!psychicId) {
      return res.status(400).json({ success: false, message: "Psychic ID is required" });
    }

    const psychic = await aiPsychic.findById(psychicId).select('type');
    if (!psychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    const { type } = psychic;

    // Skip form validation and saving for Tarot
    if (type === "Tarot") {
      return res.status(200).json({
        success: true,
        data: {
          form: null,
          redirectTo: `chat/${psychicId}`
        }
      });
    }

    // Proceed with normal form handling for other types
    const requiredFields = getRequiredFieldsByType(type);
    const missingFields = requiredFields.filter(f => !formData[f]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const saveForm = await aiFormData.findOneAndUpdate(
      { userId, type },
      { formData, type },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        form: saveForm,
        redirectTo: `chat/${psychicId}`
      }
    });
  } catch (error) {
    console.error("Form submission Error", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getSubmittedForm = async (req, res) => {
  try {
    // Get userId from auth middleware instead of params
    const userId = req.user._id;
    const { psychicId } = req.params;

    const form = await AiFormData.findOne({ 
      userId, 
      psychicId 
    }).select('formData');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        formData: form.formData
      }
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  SubmitAiForm,
  getSubmittedForm
};
// scripts/seedPsychics.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AiPsychic = require('../models/AiPsychic');

dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  await AiPsychic.deleteMany();

  const psychics = [
    {
      name: "Astro Maya",
      type: "Astrology",
      image: "https://example.com/astro-maya.jpg",
      bio: "Professional astrologer with 20 years experience. Specializes in natal charts and future predictions.",
      requiredFields: ["name", "birthDate", "birthTime", "birthPlace"],
      systemPrompt: "You are Astro Maya, an expert astrologer. Use the user's birth chart to provide accurate astrological readings. Focus on planetary positions, houses, and aspects. Never answer non-astrology questions."
    },
    {
      name: "Numerix",
      type: "Numerology",
      image: "https://example.com/numerix.jpg",
      bio: "Master numerologist who reveals your life path through numbers.",
      requiredFields: ["name", "birthDate"],
      systemPrompt: "You are Numerix, a numerology expert. Calculate life path numbers and other core numbers from the user's name and birth date. Provide insights based on numerology only."
    },
    {
      name: "Love Oracle",
      type: "Love",
      image: "https://example.com/love-oracle.jpg",
      bio: "Relationship expert combining astrology and intuition for love guidance.",
      requiredFields: ["name", "birthDate", "birthTime", "birthPlace"],
      systemPrompt: "You are Love Oracle, a relationship specialist. Analyze compatibility using birth charts. For couples, compare both charts. For singles, focus on their romantic potential."
    },
    {
      name: "Tarot Master",
      type: "Tarot",
      image: "https://example.com/tarot-master.jpg",
      bio: "Intuitive tarot reader for all life questions.",
      requiredFields: [],
      systemPrompt: "You are Tarot Master, an intuitive tarot reader. Provide guidance through tarot symbolism. You can answer any life question through tarot lens."
    }
  ];

  await AiPsychic.insertMany(psychics);
  console.log('Psychics seeded successfully');
  process.exit();
});
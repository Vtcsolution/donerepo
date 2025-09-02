const emoji = require("node-emoji");
const emojiRegex = require("emoji-regex")();

// Expanded emoji-to-meaning mapping for WhatsApp-like emojis
const emojiMeanings = {
  "😊": "happiness, positivity",
  "😄": "joy, excitement",
  "😂": "laughter, amusement",
  "😢": "sadness, disappointment",
  "😔": "regret, melancholy",
  "😍": "admiration, attraction",
  "😘": "kiss, affection",
  "🥰": "love, adoration",
  "😤": "frustration, annoyance",
  "😣": "stress, worry",
  "😡": "anger, irritation",
  "😱": "shock, fear",
  "🙁": "disappointment, sadness",
  "🙏": "gratitude, prayer",
  "💔": "heartbreak, loss",
  "❤️": "love, affection",
  "💕": "romance, love",
  "💖": "sparkling love, excitement",
  "💞": "deep connection, love",
  "💌": "romantic message, love letter",
  "🌹": "romance, appreciation",
  "💍": "commitment, engagement",
  "🔥": "passion, intensity",
  "🌟": "hope, inspiration",
  "✨": "magic, wonder",
  "🎉": "celebration, joy",
  "🥳": "party, celebration",
  "🎁": "gift, surprise",
  "🌈": "hope, diversity",
  "☀️": "optimism, warmth",
  "🌙": "introspection, mystery",
  "⭐": "success, achievement",
  "🔮": "mysticism, intuition",
  "🃏": "chance, unpredictability",
  "💡": "idea, insight",
  "🔢": "numbers, calculation",
  "🌌": "cosmic, spiritual",
  "😇": "innocence, purity",
  "👥": "partnership, connection",
  "💪": "strength, determination",
  "🫶": "heart hands, love",
  "😎": "confidence, coolness",
  "🤗": "hug, comfort",
  "🙌": "praise, excitement",
  // Add more emojis as needed
};

// Detect emojis in a message and return their meanings
function processEmojis(message) {
  const emojis = message.match(emojiRegex) || [];
  return emojis.map(e => ({
    emoji: e,
    meaning: emojiMeanings[e] || "unknown",
  }));
}

// Add emojis to AI response based on context
function addContextualEmojis(text, psychicType) {
  let enhancedText = text;
  const emojiMap = {
    Astrology: ["🌟", "🌙", "☀️", "⭐", "🌌"],
    Love: ["❤️", "😍", "💞", "💖", "🌹", "🫶"],
    Tarot: ["🔮", "🃏", "✨", "🌟"],
    Numerology: ["🔢", "🌌", "💡", "⭐"],
  };

  // Add a random emoji from the psychic type's emoji set at the start or end
  const typeEmojis = emojiMap[psychicType] || ["😊"];
  const randomEmoji = typeEmojis[Math.floor(Math.random() * typeEmojis.length)];
  enhancedText = `${randomEmoji} ${enhancedText} ${randomEmoji}`;

  // Replace certain keywords with emojis for expressiveness
  enhancedText = enhancedText
    .replace(/love/gi, "love ❤️")
    .replace(/happy/gi, "happy 😊")
    .replace(/sad/gi, "sad 😢")
    .replace(/hope/gi, "hope 🌟")
    .replace(/romance/gi, "romance 🌹")
    .replace(/joy/gi, "joy 🎉")
    .replace(/strength/gi, "strength 💪")
    .replace(/intuition/gi, "intuition 🔮");

  return enhancedText;
}

module.exports = { processEmojis, addContextualEmojis };
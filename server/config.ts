// Telegram bot configuration
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
export const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// Categories for medical quizzes
export const CATEGORIES = {
  "Anatomy": [
    "Head and Neck",
    "Upper Limb",
    "Thorax",
    "Lower Limb",
    "Pelvis and Perineum",
    "Neuroanatomy",
    "Abdomen"
  ],
  "Physiology": [
    "Cell",
    "Nerve and Muscle",
    "Blood",
    "Endocrine",
    "Reproductive",
    "Gastrointestinal Tract",
    "Renal",
    "Cardiovascular System",
    "Respiration",
    "Medical Genetics",
    "Neurophysiology"
  ]
};
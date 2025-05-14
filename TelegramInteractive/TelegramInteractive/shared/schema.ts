import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  telegramId: integer("telegram_id").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: boolean("answer").notNull(),
  explanation: text("explanation"),
  aiExplanation: text("ai_explanation"),
  referenceData: jsonb("reference_data"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
});

// Image quiz data
export const imageQuizData = pgTable("image_quiz_data", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  imageUrl: text("image_url").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: jsonb("options").notNull(),
  explanation: text("explanation"),
});

// User stats
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalAttempts: integer("total_attempts").default(0),
  correctAnswers: integer("correct_answers").default(0),
  streak: integer("streak").default(0),
  maxStreak: integer("max_streak").default(0),
  lastQuizDate: text("last_quiz_date"),
  categoryStats: jsonb("category_stats"),
});

// Quiz sessions
export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  questionsCompleted: integer("questions_completed").default(0),
  totalQuestions: integer("total_questions").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true),
});

// User activity
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(), // 'quiz', 'image_quiz', 'ask_ai'
  category: text("category"),
  subcategory: text("subcategory"),
  result: text("result"), // 'success', 'failure', etc.
  score: integer("score"),
  timestamp: timestamp("timestamp").defaultNow(),
  details: jsonb("details"),
});

// Telegram webhook data
export const telegramWebhooks = pgTable("telegram_webhooks", {
  id: serial("id").primaryKey(),
  telegramId: integer("telegram_id").notNull(),
  data: jsonb("data").notNull(),
  processedAt: timestamp("processed_at"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertImageQuizDataSchema = createInsertSchema(imageQuizData).omit({ id: true });
export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true });
export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({ 
  id: true, 
  startedAt: true,
  isActive: true
});
export const insertUserActivitySchema = createInsertSchema(userActivity).omit({ 
  id: true, 
  timestamp: true 
});
export const insertTelegramWebhookSchema = createInsertSchema(telegramWebhooks).omit({ 
  id: true, 
  processedAt: true,
  timestamp: true 
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type ImageQuizData = typeof imageQuizData.$inferSelect;
export type InsertImageQuizData = z.infer<typeof insertImageQuizDataSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;

export type UserActivity = typeof userActivity.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export type TelegramWebhook = typeof telegramWebhooks.$inferSelect;
export type InsertTelegramWebhook = z.infer<typeof insertTelegramWebhookSchema>;

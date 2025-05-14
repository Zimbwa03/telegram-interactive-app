import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupTelegramWebhook, telegramBot, telegramWebhookMiddleware } from "./telegram";
import { z } from "zod";
import { insertQuestionSchema, insertUserSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup Telegram webhook
  await setupTelegramWebhook();

  // User routes
  app.get("/api/user", async (req, res) => {
    // Get user from session or create a guest user
    const userId = req.session?.userId;
    
    if (!userId) {
      // Return guest user info
      return res.json({
        id: 0,
        name: "Guest User",
        isGuest: true
      });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      name: user.firstName || user.username,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isGuest: false
    });
  });

  // Login route
  app.post("/api/login", async (req, res) => {
    const loginSchema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });
    
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      req.session.userId = user.id;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
      
      res.json({
        id: user.id,
        name: user.firstName || user.username,
        username: user.username,
        isGuest: false
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } else {
      res.json({ message: "Already logged out" });
    }
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Create initial stats for user
      await storage.createUserStats({
        userId: newUser.id,
        totalAttempts: 0,
        correctAnswers: 0,
        streak: 0,
        maxStreak: 0
      });
      
      // Set user in session
      req.session.userId = newUser.id;
      
      res.status(201).json({
        id: newUser.id,
        name: newUser.firstName || newUser.username,
        username: newUser.username
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Categories route
  app.get("/api/categories", (req, res) => {
    res.json({
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
    });
  });

  // User stats route
  app.get("/api/stats", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.json({
        totalQuizzes: 0,
        correctAnswers: 0,
        accuracy: 0,
        currentStreak: 0,
        bestStreak: 0,
        recentActivity: []
      });
    }
    
    const stats = await storage.getUserStats(userId);
    const activity = await storage.getUserActivity(userId, 10); // Get 10 recent activities
    
    if (!stats) {
      return res.status(404).json({ message: "User stats not found" });
    }
    
    const accuracy = stats.totalAttempts > 0
      ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100)
      : 0;
    
    res.json({
      totalQuizzes: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      accuracy,
      currentStreak: stats.streak,
      bestStreak: stats.maxStreak,
      recentActivity: activity
    });
  });

  // Category stats route
  app.get("/api/stats/category", async (req, res) => {
    const userId = req.session?.userId;
    const category = req.query.category as string;
    
    if (!userId) {
      return res.json({
        category,
        totalQuizzes: 0,
        correctAnswers: 0,
        accuracy: 0,
        subcategories: []
      });
    }
    
    const stats = await storage.getUserCategoryStats(userId, category);
    
    res.json(stats);
  });

  // User progress route
  app.get("/api/progress", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.json({});
    }
    
    const progress = await storage.getUserProgress(userId);
    
    res.json(progress);
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    const category = req.query.category as string;
    
    const leaderboard = await storage.getLeaderboard(category);
    
    res.json(leaderboard);
  });

  // Quiz routes
  app.get("/api/quiz", async (req, res) => {
    const category = req.query.category as string;
    const subcategory = req.query.subcategory as string | undefined;
    
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    
    const questions = await storage.getQuestions(category, subcategory);
    
    res.json({ questions });
  });

  app.post("/api/quiz/start", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const { category, subcategory } = req.body;
    
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    
    // End any active sessions
    await storage.endActiveQuizSessions(userId);
    
    // Create a new session
    const session = await storage.createQuizSession({
      userId,
      category,
      subcategory,
      questionsCompleted: 0,
      totalQuestions: 10 // Default to 10 questions per quiz
    });
    
    res.json({ sessionId: session.id });
  });

  app.post("/api/quiz/answer", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const { questionId, answer } = req.body;
    
    if (questionId === undefined || answer === undefined) {
      return res.status(400).json({ message: "Question ID and answer are required" });
    }
    
    const result = await storage.recordAnswer(userId, questionId, answer);
    
    res.json(result);
  });

  app.post("/api/quiz/end", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    await storage.endActiveQuizSessions(userId);
    
    res.json({ message: "Quiz session ended" });
  });

  // Get current session
  app.get("/api/session/current", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.json(null);
    }
    
    const session = await storage.getActiveQuizSession(userId);
    
    if (!session) {
      return res.json(null);
    }
    
    res.json({
      id: session.id,
      category: session.category,
      subcategory: session.subcategory,
      completed: session.questionsCompleted,
      total: session.totalQuestions,
      title: session.subcategory 
        ? `${session.subcategory} Quiz`
        : `${session.category} Quiz`
    });
  });

  // Image quiz routes
  app.get("/api/image-quiz/categories", async (req, res) => {
    const categories = await storage.getImageQuizCategories();
    
    res.json(categories);
  });

  app.get("/api/image-quiz/images", async (req, res) => {
    const category = req.query.category as string | undefined;
    
    const images = await storage.getImageQuizData(category);
    
    // Format the data for the frontend
    const formattedImages = images.map(img => ({
      id: img.id.toString(),
      imageUrl: img.imageUrl,
      options: Array.isArray(img.options) ? img.options : [],
      category: img.category
    }));
    
    res.json({ images: formattedImages });
  });

  app.post("/api/image-quiz/start", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const { category } = req.body;
    
    // End any active sessions
    await storage.endActiveQuizSessions(userId);
    
    // Create a new session for image quiz
    const session = await storage.createQuizSession({
      userId,
      category: 'ImageQuiz',
      subcategory: category,
      questionsCompleted: 0,
      totalQuestions: 10 // Default to 10 images per quiz
    });
    
    res.json({ sessionId: session.id });
  });

  app.post("/api/image-quiz/answer", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const { imageId, answer } = req.body;
    
    if (!imageId || !answer) {
      return res.status(400).json({ message: "Image ID and answer are required" });
    }
    
    const result = await storage.recordImageAnswer(userId, parseInt(imageId), answer);
    
    res.json(result);
  });

  // Recent activity route
  app.get("/api/activity", async (req, res) => {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.json([]);
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const activities = await storage.getUserActivity(userId, limit);
    
    res.json(activities);
  });

  // Ask AI tutor route
  app.post("/api/ask", async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }
    
    try {
      const response = await storage.askAITutor(question);
      
      // Record activity if user is logged in
      const userId = req.session?.userId;
      if (userId) {
        await storage.recordUserActivity({
          userId,
          activityType: 'ask_ai',
          details: { question, response }
        });
      }
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Telegram webhook endpoint
  app.post('/api/telegram/webhook', async (req, res) => {
    if (telegramBot && telegramWebhookMiddleware) {
      // Use the grammY webhook middleware to process updates
      await telegramWebhookMiddleware(req, res);
    } else {
      res.sendStatus(200);
    }
  });

  // Telegram login endpoint
  app.get('/api/telegram/login', (req, res) => {
    // Generate a random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Initialize the session if it doesn't exist yet
    if (!req.session) {
      req.session = {} as any;
    }
    
    // Store the state in the session
    req.session.telegramState = state;
    
    // Save the session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ message: 'Session error' });
      }
      
      // Get the bot username
      const botUsername = process.env.BOT_USERNAME || 'docdotbot';
      
      // Create the deep linking URL with the state
      const deepLinkUrl = `https://t.me/${botUsername}?start=auth_${state}`;
      
      res.redirect(deepLinkUrl);
    });
  });

  // Telegram auth callback endpoint
  app.get('/api/telegram/callback', async (req, res) => {
    const { state, id, redirect } = req.query as { state?: string; id?: string; redirect?: string };
    
    // For direct callback (from /web command), we may not have a state saved in session
    // This is a simplified auth flow for better UX
    if (!id) {
      return res.status(400).json({ message: "Missing Telegram ID" });
    }
    
    const telegramId = parseInt(id);
    if (isNaN(telegramId)) {
      return res.status(400).json({ message: "Invalid Telegram ID" });
    }
    
    try {
      // Find user by Telegram ID
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        // Create a new user for this Telegram user if not exists
        user = await storage.createUser({
          username: `telegram_${telegramId}`,
          password: crypto.randomBytes(16).toString('hex'), // Random password
          telegramId,
          firstName: `Telegram User ${telegramId}`
        });
        
        // Create initial stats for the user
        await storage.createUserStats({
          userId: user.id,
          totalAttempts: 0,
          correctAnswers: 0,
          streak: 0,
          maxStreak: 0
        });
      }
      
      // Set user in session
      req.session.userId = user.id;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
      
      // Clear the state if it exists
      if (state && req.session.telegramState) {
        delete req.session.telegramState;
      }
      
      // Redirect to the specified location or dashboard
      if (redirect && redirect.startsWith('/') && !redirect.includes('//')) {
        // Security check to prevent open redirect attacks
        res.redirect(redirect);
      } else {
        // Default redirect to dashboard
        res.redirect('/');
      }
    } catch (error) {
      console.error("Telegram auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  return httpServer;
}

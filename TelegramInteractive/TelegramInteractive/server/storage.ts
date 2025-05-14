import {
  users,
  questions,
  imageQuizData,
  userStats,
  quizSessions,
  userActivity,
  telegramWebhooks,
  type User,
  type InsertUser,
  type Question,
  type InsertQuestion,
  type ImageQuizData,
  type InsertImageQuizData,
  type UserStats,
  type InsertUserStats,
  type QuizSession,
  type InsertQuizSession,
  type UserActivity,
  type InsertUserActivity,
  type TelegramWebhook,
  type InsertTelegramWebhook
} from "@shared/schema";
import { BOT_TOKEN, OPENROUTER_API_KEY, CATEGORIES } from "./config";
import { z } from "zod";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Questions methods
  getQuestions(category: string, subcategory?: string, limit?: number): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Image quiz methods
  getImageQuizCategories(): Promise<string[]>;
  getImageQuizData(category?: string, limit?: number): Promise<ImageQuizData[]>;
  getImageQuizDataById(id: number): Promise<ImageQuizData | undefined>;
  createImageQuizData(data: InsertImageQuizData): Promise<ImageQuizData>;

  // User stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats | undefined>;
  getUserCategoryStats(userId: number, category: string): Promise<any>;
  getUserProgress(userId: number): Promise<Record<string, { attempts: number; correct: number }>>;

  // Quiz session methods
  getActiveQuizSession(userId: number): Promise<QuizSession | undefined>;
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(id: number, sessionData: Partial<QuizSession>): Promise<QuizSession | undefined>;
  endActiveQuizSessions(userId: number): Promise<void>;

  // User activity methods
  getUserActivity(userId: number, limit?: number): Promise<any[]>;
  recordUserActivity(activity: InsertUserActivity): Promise<UserActivity>;

  // Quiz interaction methods
  recordAnswer(userId: number, questionId: number, answer: boolean): Promise<any>;
  recordImageAnswer(userId: number, imageId: number, answer: string): Promise<any>;

  // Telegram webhook methods
  saveTelegramWebhook(webhook: InsertTelegramWebhook): Promise<TelegramWebhook>;
  getUnprocessedWebhooks(limit?: number): Promise<TelegramWebhook[]>;
  markWebhookProcessed(id: number): Promise<void>;

  // Leaderboard
  getLeaderboard(category?: string): Promise<any[]>;

  // AI Tutor
  askAITutor(question: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private imageQuizData: Map<number, ImageQuizData>;
  private userStats: Map<number, UserStats>;
  private quizSessions: Map<number, QuizSession>;
  private userActivities: Map<number, UserActivity[]>;
  private telegramWebhooks: Map<number, TelegramWebhook>;
  private currentIds: {
    user: number;
    question: number;
    imageQuizData: number;
    userStats: number;
    quizSession: number;
    userActivity: number;
    telegramWebhook: number;
  };

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.imageQuizData = new Map();
    this.userStats = new Map();
    this.quizSessions = new Map();
    this.userActivities = new Map();
    this.telegramWebhooks = new Map();
    this.currentIds = {
      user: 1,
      question: 1,
      imageQuizData: 1,
      userStats: 1,
      quizSession: 1,
      userActivity: 1,
      telegramWebhook: 1
    };

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create sample questions for each category
    Object.entries(CATEGORIES).forEach(([category, subcategories]) => {
      subcategories.forEach(subcategory => {
        // Create 5 questions for each subcategory
        for (let i = 0; i < 5; i++) {
          this.createQuestion({
            question: `Sample ${category} ${subcategory} question ${i + 1}`,
            answer: Math.random() > 0.5,
            explanation: `This is an explanation for the ${category} ${subcategory} question ${i + 1}`,
            aiExplanation: `AI explanation for ${category} ${subcategory} question ${i + 1}`,
            referenceData: { source: "Medical textbook" },
            category,
            subcategory
          });
        }
      });
    });

    // Create sample image quiz data
    const sampleImageCategories = ["Head and Neck", "Thorax", "Abdomen", "Neuroanatomy"];
    sampleImageCategories.forEach(category => {
      for (let i = 0; i < 3; i++) {
        this.createImageQuizData({
          category: "Anatomy",
          subcategory: category,
          imageUrl: `https://via.placeholder.com/500x300?text=${category}+Image+${i + 1}`,
          correctAnswer: `Structure ${i + 1}`,
          options: [`Structure ${i + 1}`, `Structure ${i + 2}`, `Structure ${i + 3}`, `Structure ${i + 4}`],
          explanation: `This is an explanation for the ${category} structure ${i + 1}`
        });
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByTelegramId(telegramId: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Questions methods
  async getQuestions(category: string, subcategory?: string, limit?: number): Promise<Question[]> {
    let filteredQuestions = Array.from(this.questions.values());

    if (category !== "All Categories" && category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
      
      if (subcategory) {
        filteredQuestions = filteredQuestions.filter(q => q.subcategory === subcategory);
      }
    }

    // Shuffle the questions
    filteredQuestions.sort(() => Math.random() - 0.5);

    if (limit && limit > 0) {
      filteredQuestions = filteredQuestions.slice(0, limit);
    }

    return filteredQuestions;
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const id = this.currentIds.question++;
    const question: Question = { ...questionData, id };
    this.questions.set(id, question);
    return question;
  }

  // Image quiz methods
  async getImageQuizCategories(): Promise<string[]> {
    const categories = new Set<string>();
    Array.from(this.imageQuizData.values()).forEach(data => {
      if (data.subcategory) {
        categories.add(data.subcategory);
      } else if (data.category) {
        categories.add(data.category);
      }
    });
    return Array.from(categories);
  }

  async getImageQuizData(category?: string, limit?: number): Promise<ImageQuizData[]> {
    let filteredData = Array.from(this.imageQuizData.values());

    if (category) {
      filteredData = filteredData.filter(data => 
        data.category === category || data.subcategory === category
      );
    }

    // Shuffle the data
    filteredData.sort(() => Math.random() - 0.5);

    if (limit && limit > 0) {
      filteredData = filteredData.slice(0, limit);
    }

    return filteredData;
  }

  async getImageQuizDataById(id: number): Promise<ImageQuizData | undefined> {
    return this.imageQuizData.get(id);
  }

  async createImageQuizData(data: InsertImageQuizData): Promise<ImageQuizData> {
    const id = this.currentIds.imageQuizData++;
    const imageData: ImageQuizData = { ...data, id };
    this.imageQuizData.set(id, imageData);
    return imageData;
  }

  // User stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return this.userStats.get(userId);
  }

  async createUserStats(statsData: InsertUserStats): Promise<UserStats> {
    const id = this.currentIds.userStats++;
    const stats: UserStats = { 
      ...statsData, 
      id,
      categoryStats: statsData.categoryStats || {} 
    };
    this.userStats.set(statsData.userId, stats);
    return stats;
  }

  async updateUserStats(userId: number, statsData: Partial<UserStats>): Promise<UserStats | undefined> {
    const stats = await this.getUserStats(userId);
    if (!stats) return undefined;

    const updatedStats = { ...stats, ...statsData };
    this.userStats.set(userId, updatedStats);
    return updatedStats;
  }

  async getUserCategoryStats(userId: number, category: string): Promise<any> {
    const stats = await this.getUserStats(userId);
    if (!stats) {
      return {
        category,
        totalQuizzes: 0,
        correctAnswers: 0,
        accuracy: 0,
        subcategories: []
      };
    }

    const categoryStats = stats.categoryStats as Record<string, any> || {};
    const subcategories: any[] = [];
    let totalAttempts = 0;
    let totalCorrect = 0;

    // Parse stats for all subcategories
    Object.entries(categoryStats).forEach(([key, value]) => {
      if (category === 'all' || key.startsWith(`${category}-`)) {
        const subcategoryName = key.split('-')[1] || 'General';
        totalAttempts += value.attempts || 0;
        totalCorrect += value.correct || 0;
        
        subcategories.push({
          name: subcategoryName,
          attempts: value.attempts || 0,
          correct: value.correct || 0,
          accuracy: value.attempts > 0 ? Math.round((value.correct / value.attempts) * 100) : 0
        });
      }
    });

    return {
      category,
      totalQuizzes: totalAttempts,
      correctAnswers: totalCorrect,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      subcategories
    };
  }

  async getUserProgress(userId: number): Promise<Record<string, { attempts: number; correct: number }>> {
    const stats = await this.getUserStats(userId);
    if (!stats) return {};

    const categoryStats = stats.categoryStats as Record<string, any> || {};
    
    // Convert the category stats to the expected format
    const progress: Record<string, { attempts: number; correct: number }> = {};
    
    Object.entries(categoryStats).forEach(([key, value]) => {
      progress[key] = {
        attempts: value.attempts || 0,
        correct: value.correct || 0
      };
    });

    return progress;
  }

  // Quiz session methods
  async getActiveQuizSession(userId: number): Promise<QuizSession | undefined> {
    return Array.from(this.quizSessions.values()).find(
      session => session.userId === userId && session.isActive
    );
  }

  async createQuizSession(sessionData: InsertQuizSession): Promise<QuizSession> {
    const id = this.currentIds.quizSession++;
    const session: QuizSession = { 
      ...sessionData, 
      id, 
      startedAt: new Date(),
      endedAt: null,
      isActive: true
    };
    this.quizSessions.set(id, session);
    return session;
  }

  async updateQuizSession(id: number, sessionData: Partial<QuizSession>): Promise<QuizSession | undefined> {
    const session = this.quizSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...sessionData };
    this.quizSessions.set(id, updatedSession);
    return updatedSession;
  }

  async endActiveQuizSessions(userId: number): Promise<void> {
    const activeSessions = Array.from(this.quizSessions.values()).filter(
      session => session.userId === userId && session.isActive
    );

    for (const session of activeSessions) {
      await this.updateQuizSession(session.id, { 
        isActive: false,
        endedAt: new Date()
      });
    }
  }

  // User activity methods
  async getUserActivity(userId: number, limit?: number): Promise<any[]> {
    const activities = this.userActivities.get(userId) || [];
    
    // Sort by timestamp descending
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Format activities for frontend
    const formattedActivities = sortedActivities.map(activity => {
      const details = activity.details as Record<string, any> || {};
      
      let title = 'Activity';
      let description = '';
      let type = 'default';
      let badge = '';
      
      if (activity.activityType === 'quiz') {
        const isCorrect = activity.result === 'success';
        type = isCorrect ? 'success' : 'failure';
        title = isCorrect ? 'Completed Quiz' : 'Challenging Quiz';
        description = isCorrect 
          ? `You scored well on ${activity.category} ${activity.subcategory || ''} quiz`
          : `You might need more practice with ${activity.category} ${activity.subcategory || ''}`;
        badge = isCorrect ? `+${details.streak || 1} streak` : 'Streak reset';
      } else if (activity.activityType === 'image_quiz') {
        type = 'image';
        title = 'Attempted Image Quiz';
        description = `You identified ${details.score || 0}/${details.total || 10} anatomical structures correctly`;
        badge = `+${details.streak || 1} streak`;
      } else if (activity.activityType === 'ask_ai') {
        type = 'success';
        title = 'AI Tutor Question';
        description = `You asked about: ${details.question?.substring(0, 50)}...`;
        badge = 'Knowledge';
      }
      
      return {
        id: activity.id,
        type,
        title,
        description,
        badge,
        timestamp: activity.timestamp || new Date().toISOString()
      };
    });

    return limit ? formattedActivities.slice(0, limit) : formattedActivities;
  }

  async recordUserActivity(activityData: InsertUserActivity): Promise<UserActivity> {
    const id = this.currentIds.userActivity++;
    const activity: UserActivity = { 
      ...activityData, 
      id, 
      timestamp: new Date()
    };
    
    const userActivities = this.userActivities.get(activityData.userId) || [];
    userActivities.push(activity);
    this.userActivities.set(activityData.userId, userActivities);
    
    return activity;
  }

  // Quiz interaction methods
  async recordAnswer(userId: number, questionId: number, answer: boolean): Promise<any> {
    // Get the question
    const question = await this.getQuestionById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Get user stats
    let stats = await this.getUserStats(userId);
    if (!stats) {
      // Create new stats if they don't exist
      stats = await this.createUserStats({
        userId,
        totalAttempts: 0,
        correctAnswers: 0,
        streak: 0,
        maxStreak: 0,
        categoryStats: {}
      });
    }

    // Update session if active
    const session = await this.getActiveQuizSession(userId);
    if (session) {
      await this.updateQuizSession(session.id, {
        questionsCompleted: (session.questionsCompleted || 0) + 1
      });
    }

    // Check if answer is correct
    const isCorrect = answer === question.answer;
    
    // Update stats
    const categoryKey = question.subcategory 
      ? `${question.category}-${question.subcategory}`
      : question.category;
    
    const categoryStats = stats.categoryStats as Record<string, any> || {};
    
    if (!categoryStats[categoryKey]) {
      categoryStats[categoryKey] = { attempts: 0, correct: 0 };
    }
    
    categoryStats[categoryKey].attempts = (categoryStats[categoryKey].attempts || 0) + 1;
    
    if (isCorrect) {
      categoryStats[categoryKey].correct = (categoryStats[categoryKey].correct || 0) + 1;
      stats.correctAnswers = (stats.correctAnswers || 0) + 1;
      stats.streak = (stats.streak || 0) + 1;
      stats.maxStreak = Math.max(stats.maxStreak || 0, stats.streak || 0);
    } else {
      stats.streak = 0;
    }
    
    stats.totalAttempts = (stats.totalAttempts || 0) + 1;
    stats.lastQuizDate = new Date().toISOString().split('T')[0];
    
    await this.updateUserStats(userId, {
      totalAttempts: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      streak: stats.streak,
      maxStreak: stats.maxStreak,
      lastQuizDate: stats.lastQuizDate,
      categoryStats
    });

    // Record activity
    await this.recordUserActivity({
      userId,
      activityType: 'quiz',
      category: question.category,
      subcategory: question.subcategory,
      result: isCorrect ? 'success' : 'failure',
      score: isCorrect ? 1 : 0,
      details: {
        questionId,
        userAnswer: answer,
        correctAnswer: question.answer,
        streak: stats.streak
      }
    });

    return {
      isCorrect,
      explanation: question.explanation || question.aiExplanation || 'No explanation available',
      correctAnswer: question.answer
    };
  }

  async recordImageAnswer(userId: number, imageId: number, answer: string): Promise<any> {
    // Get the image data
    const imageData = await this.getImageQuizDataById(imageId);
    if (!imageData) {
      throw new Error('Image data not found');
    }

    // Get user stats
    let stats = await this.getUserStats(userId);
    if (!stats) {
      // Create new stats if they don't exist
      stats = await this.createUserStats({
        userId,
        totalAttempts: 0,
        correctAnswers: 0,
        streak: 0,
        maxStreak: 0,
        categoryStats: {}
      });
    }

    // Update session if active
    const session = await this.getActiveQuizSession(userId);
    if (session) {
      await this.updateQuizSession(session.id, {
        questionsCompleted: (session.questionsCompleted || 0) + 1
      });
    }

    // Check if answer is correct
    const isCorrect = answer === imageData.correctAnswer;
    
    // Update stats
    const categoryKey = `ImageQuiz-${imageData.subcategory || imageData.category}`;
    
    const categoryStats = stats.categoryStats as Record<string, any> || {};
    
    if (!categoryStats[categoryKey]) {
      categoryStats[categoryKey] = { attempts: 0, correct: 0 };
    }
    
    categoryStats[categoryKey].attempts = (categoryStats[categoryKey].attempts || 0) + 1;
    
    if (isCorrect) {
      categoryStats[categoryKey].correct = (categoryStats[categoryKey].correct || 0) + 1;
      stats.correctAnswers = (stats.correctAnswers || 0) + 1;
      stats.streak = (stats.streak || 0) + 1;
      stats.maxStreak = Math.max(stats.maxStreak || 0, stats.streak || 0);
    } else {
      stats.streak = 0;
    }
    
    stats.totalAttempts = (stats.totalAttempts || 0) + 1;
    stats.lastQuizDate = new Date().toISOString().split('T')[0];
    
    await this.updateUserStats(userId, {
      totalAttempts: stats.totalAttempts,
      correctAnswers: stats.correctAnswers,
      streak: stats.streak,
      maxStreak: stats.maxStreak,
      lastQuizDate: stats.lastQuizDate,
      categoryStats
    });

    // Record activity
    await this.recordUserActivity({
      userId,
      activityType: 'image_quiz',
      category: 'ImageQuiz',
      subcategory: imageData.subcategory || imageData.category,
      result: isCorrect ? 'success' : 'failure',
      score: isCorrect ? 1 : 0,
      details: {
        imageId,
        userAnswer: answer,
        correctAnswer: imageData.correctAnswer,
        streak: stats.streak
      }
    });

    return {
      isCorrect,
      explanation: imageData.explanation || 'No explanation available',
      correctAnswer: imageData.correctAnswer
    };
  }

  // Telegram webhook methods
  async saveTelegramWebhook(webhookData: InsertTelegramWebhook): Promise<TelegramWebhook> {
    const id = this.currentIds.telegramWebhook++;
    const webhook: TelegramWebhook = { 
      ...webhookData, 
      id, 
      processedAt: null,
      timestamp: new Date()
    };
    this.telegramWebhooks.set(id, webhook);
    return webhook;
  }

  async getUnprocessedWebhooks(limit?: number): Promise<TelegramWebhook[]> {
    const webhooks = Array.from(this.telegramWebhooks.values()).filter(
      webhook => !webhook.processedAt
    );
    
    return limit ? webhooks.slice(0, limit) : webhooks;
  }

  async markWebhookProcessed(id: number): Promise<void> {
    const webhook = this.telegramWebhooks.get(id);
    if (webhook) {
      webhook.processedAt = new Date();
      this.telegramWebhooks.set(id, webhook);
    }
  }

  // Leaderboard
  async getLeaderboard(category?: string): Promise<any[]> {
    const allStats = Array.from(this.userStats.values());
    
    const leaderboardEntries = await Promise.all(
      allStats.map(async (stats) => {
        const user = await this.getUser(stats.userId);
        if (!user) return null;
        
        let accuracy = 0;
        let totalQuizzes = 0;
        let score = 0;
        
        if (category && category !== 'all') {
          const categoryStats = await this.getUserCategoryStats(stats.userId, category);
          accuracy = categoryStats.accuracy || 0;
          totalQuizzes = categoryStats.totalQuizzes || 0;
          score = accuracy * Math.log(totalQuizzes + 1); // Weight by attempts
        } else {
          // Overall stats
          accuracy = stats.totalAttempts > 0 
            ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) 
            : 0;
          totalQuizzes = stats.totalAttempts || 0;
          score = accuracy * Math.log(totalQuizzes + 1); // Weight by attempts
        }
        
        return {
          id: user.id,
          name: user.firstName || user.username,
          username: user.username,
          accuracy,
          totalQuizzes,
          score: Math.round(score)
        };
      })
    );
    
    // Filter out null entries and sort by score descending
    return leaderboardEntries
      .filter(entry => entry !== null)
      .sort((a, b) => {
        // Sort by accuracy if scores are equal
        if (b.score === a.score) {
          return b.accuracy - a.accuracy;
        }
        return b.score - a.score;
      });
  }

  // AI Tutor
  async askAITutor(question: string): Promise<string> {
    try {
      // Make an API request to OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-opus', // Using Claude 3 Opus for high quality medical responses
          messages: [
            {
              role: 'system',
              content: 'You are an AI medical tutor helping medical students learn. Provide accurate, educational responses to medical questions. Be thorough but concise. Include key facts and concepts that would be important for a medical student to know.'
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        console.error('AI API Error:', await response.text());
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error in askAITutor:', error);
      return "I'm sorry, I'm having trouble processing your question right now. Please try again later.";
    }
  }
}

export const storage = new MemStorage();

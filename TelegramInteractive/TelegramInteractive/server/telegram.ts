import { Bot, webhookCallback } from "grammy";
import { BOT_TOKEN, OPENROUTER_API_KEY, WEBHOOK_URL, CATEGORIES } from "./config";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";

// Create a bot instance
export const telegramBot = BOT_TOKEN ? new Bot(BOT_TOKEN) : null;

// Setup webhook for the Telegram bot
export async function setupTelegramWebhook() {
  if (!telegramBot) {
    console.warn("Telegram bot not initialized: BOT_TOKEN is missing");
    return;
  }

  if (!WEBHOOK_URL) {
    console.warn("Webhook URL is not configured, telegram webhook will not be set up");
    return;
  }
  
  // In development or without proper webhook URL, just log instead of trying to set it up
  if (!WEBHOOK_URL.includes('https://')) {
    console.log("Running in development mode: Telegram webhook setup skipped");
    return;
  }
  
  try {
    // Delete any existing webhook
    await telegramBot.api.deleteWebhook();
    
    // Set up the new webhook - ensure no double slashes
    let baseUrl = WEBHOOK_URL;
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const webhookUrl = `${baseUrl}/api/telegram/webhook`;
    await telegramBot.api.setWebhook(webhookUrl);
    
    console.log(`Telegram webhook set to: ${webhookUrl}`);
    
    // Register bot commands
    await telegramBot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "quiz", description: "Take a quiz" },
      { command: "stats", description: "View your stats" },
      { command: "categories", description: "Browse quiz categories" },
      { command: "help", description: "Get help" },
      { command: "ask", description: "Ask the AI medical tutor" },
      { command: "web", description: "Open web interface" }
    ]);

    // Set up command handlers
    setupBotCommands();
    
    // Process unprocessed webhooks periodically
    setInterval(processUnprocessedWebhooks, 60000); // Every minute
  } catch (error) {
    console.error("Failed to set up Telegram webhook:", error);
  }
}

// Setup bot command handlers
function setupBotCommands() {
  if (!telegramBot) return;

  // Handle /start command
  telegramBot.command("start", async (ctx) => {
    try {
      if (!ctx.from) {
        console.error("No ctx.from available in start command");
        return;
      }
      
      const telegramId = ctx.from.id;
      const startParam = ctx.message?.text.split(' ')[1]; // Get the parameter after /start
      
      // Handle authentication flow if start parameter begins with auth_
      if (startParam && startParam.startsWith('auth_')) {
        const state = startParam.replace('auth_', '');
        
        // Generate callback URL with the telegram ID and state
        const callbackUrl = `${WEBHOOK_URL}/api/telegram/callback?id=${telegramId}&state=${state}`;
        
        await ctx.reply(
          `🔐 *Linking Your Telegram Account* 🔐\n\n` +
          "We're connecting your Telegram account to the Docdot web interface.\n\n" +
          "Click the button below to complete the authentication:",
          { 
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "Complete Authentication", url: callbackUrl }]
              ]
            }
          }
        );
        return;
      }
      
      // Regular start command (first-time user)
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        // Create a new user for this Telegram user
        user = await storage.createUser({
          username: ctx.from.username || `user_${telegramId}`,
          password: Math.random().toString(36).substring(2, 15), // Random password
          telegramId,
          firstName: ctx.from.first_name || "Telegram User",
          lastName: ctx.from.last_name
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
      
      await ctx.reply(
        `🩺 *Hi, ${ctx.from.first_name || "there"}! Welcome to Docdot* 🩺\n\n` +
        "━━━━━━━━━━━━━━━━━━━━━\n" +
        "Your interactive medical learning companion!\n\n" +
        "🎯 *KEY FEATURES*\n" +
        "📚 Comprehensive Anatomy & Physiology Quizzes\n" +
        "📊 Performance Tracking\n" +
        "🧠 AI-Powered Explanations\n" +
        "💭 Ask Medical Questions\n\n" +
        "⚡️ *QUICK COMMANDS*\n" +
        "📋 /stats - Your Performance\n" +
        "🗂 /categories - Browse Topics\n" +
        "❓ /help - Get Assistance\n" +
        "💬 /ask - Ask Medical Questions\n" +
        "🌐 /web - Open Web Interface\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━\n" +
        "*Ready to test your medical knowledge?*",
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Error in /start command:", error);
      await ctx.reply("Sorry, there was an error processing your request. Please try again.");
    }
  });

  // Handle /web command
  telegramBot.command("web", async (ctx) => {
    try {
      if (!ctx.from) {
        console.error("No ctx.from available in web command");
        return;
      }
      
      // Fix URL format
      let baseUrl = WEBHOOK_URL;
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const webUrl = baseUrl.replace('/api/telegram/webhook', '');
      
      // Generate a state for authentication
      const state = Math.random().toString(36).substring(2, 15);
      const telegramId = ctx.from.id;
      
      // Create an authenticated link
      const authUrl = `${webUrl}/api/telegram/callback?id=${telegramId}&state=${state}`;
      
      await ctx.reply(
        "🌐 *Access the Docdot Web Interface* 🌐\n\n" +
        "Continue your learning on our web platform with more features and a better viewing experience.",
        { 
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🖥️ Open Web Interface", url: webUrl }],
              [{ text: "🔑 Login Automatically", url: authUrl }]
            ]
          }
        }
      );
    } catch (error) {
      console.error("Error in /web command:", error);
      await ctx.reply("Sorry, there was an error processing your request. Please try again.");
    }
  });

  // Handle /help command
  telegramBot.command("help", async (ctx) => {
    try {
      if (!ctx.from) {
        console.error("No ctx.from available in help command");
        return;
      }
      
      const telegramId = ctx.from.id;
      const webUrl = WEBHOOK_URL.replace('/api/telegram/webhook', '');
      const authUrl = `${webUrl}/api/telegram/callback?id=${telegramId}&state=${Math.random().toString(36).substring(2, 15)}`;
      
      await ctx.reply(
        "❓ *Docdot Help Guide* ❓\n\n" +
        "Welcome to Docdot, your medical learning companion! Here's how to use this bot:\n\n" +
        "📋 */stats* - View your learning statistics\n" +
        "🗂 */categories* - Browse quiz categories\n" +
        "💬 */ask* [question] - Ask an AI tutor a medical question\n" +
        "🌐 */web* - Access the web interface\n" +
        "❓ */help* - Show this help message\n\n" +
        "*Example:*\n" +
        "/ask What are the branches of the facial nerve?\n\n" +
        "*Web Interface*\nOur web interface offers additional features like image quizzes, detailed statistics, and more intuitive navigation:",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🌐 Open Web Interface", url: authUrl }]
            ]
          }
        }
      );
    } catch (error) {
      console.error("Error in /help command:", error);
      await ctx.reply("Sorry, there was an error showing the help. Please try again.");
    }
  });

  // Handle /categories command
  telegramBot.command("categories", async (ctx) => {
    try {
      if (!ctx.from) {
        console.error("No ctx.from available in categories command");
        return;
      }
      
      const telegramId = ctx.from.id;
      const categories = Object.keys(CATEGORIES);
      
      const message = 
        "🗂 *Medical Quiz Categories* 🗂\n\n" +
        "Choose a category to test your knowledge:\n\n" +
        categories.map(category => `• *${category}*`).join("\n") + 
        "\n\nFor a better experience with subcategories and detailed content, use our web interface:";
      
      // Generate auth URL for web interface - fix URL format
      let baseUrl = WEBHOOK_URL;
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const webUrl = baseUrl.replace('/api/telegram/webhook', '');
      const authUrl = `${webUrl}/api/telegram/callback?id=${telegramId}&state=${Math.random().toString(36).substring(2, 15)}`;
      
      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Open Web Interface", url: authUrl + "&redirect=/categories" }]
          ]
        }
      });
    } catch (error) {
      console.error("Error in /categories command:", error);
      await ctx.reply("Sorry, there was an error retrieving the categories. Please try again.");
    }
  });

  // Handle /stats command
  telegramBot.command("stats", async (ctx) => {
    try {
      if (!ctx.from) {
        console.error("No ctx.from available in stats command");
        return;
      }
      
      const telegramId = ctx.from.id;
      const user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        await ctx.reply(
          "⚠️ *User not found* ⚠️\n\n" +
          "It seems like you haven't started any quizzes yet.\n" +
          "Use the /categories command to browse topics and start learning!",
          { parse_mode: "Markdown" }
        );
        return;
      }
      
      const stats = await storage.getUserStats(user.id);
      
      if (!stats) {
        await ctx.reply(
          "📊 *Your Statistics* 📊\n\n" +
          "You haven't attempted any quizzes yet.\n" +
          "Use the /categories command to start learning!",
          { parse_mode: "Markdown" }
        );
        return;
      }
      
      const totalAttempts = stats.totalAttempts || 0;
      const correctAnswers = stats.correctAnswers || 0;
      const accuracy = totalAttempts > 0 
        ? Math.round((correctAnswers / totalAttempts) * 100) 
        : 0;
      
      // Generate the stats message
      const statsMessage = 
        "📊 *Your Learning Statistics* 📊\n\n" +
        `Total Quizzes: *${totalAttempts}*\n` +
        `Correct Answers: *${correctAnswers}*\n` +
        `Accuracy: *${accuracy}%*\n` +
        `Current Streak: *${stats.streak || 0}*\n` +
        `Best Streak: *${stats.maxStreak || 0}*\n\n` +
        "Keep up the good work! Regular practice is key to mastering medical knowledge.";
      
      // Add a button to view detailed stats on the web
      const webUrl = WEBHOOK_URL.replace('/api/telegram/webhook', '');
      const authUrl = `${webUrl}/api/telegram/callback?id=${telegramId}&state=${Math.random().toString(36).substring(2, 15)}`;
      
      await ctx.reply(statsMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📈 View Detailed Stats on Web", url: authUrl + "&redirect=/stats" }]
          ]
        }
      });
    } catch (error) {
      console.error("Error in /stats command:", error);
      await ctx.reply("Sorry, there was an error retrieving your statistics. Please try again.");
    }
  });

  // Handle /ask command
  telegramBot.command("ask", async (ctx) => {
    try {
      if (!ctx.message?.text) {
        await ctx.reply("Sorry, I couldn't process your command. Please try again.");
        return;
      }
      
      const question = ctx.message.text.replace(/^\/ask\s+/i, "").trim();
      
      if (!question) {
        await ctx.reply(
          "Please provide a medical question after the /ask command.\n\n" +
          "Example: /ask What are the branches of the brachial plexus?"
        );
        return;
      }
      
      await ctx.reply("Thinking... I'll have an answer for you shortly.");
      
      const response = await askAI(question);
      
      await ctx.reply(response, { parse_mode: "Markdown" });
      
      // Record this activity for syncing with web if user is authenticated
      if (ctx.from) {
        try {
          const telegramId = ctx.from.id;
          const user = await storage.getUserByTelegramId(telegramId);
          
          if (user) {
            await storage.recordUserActivity({
              userId: user.id,
              activityType: 'ask_ai',
              details: JSON.stringify({ question, response })
            });
          }
        } catch (err) {
          console.error("Error recording user activity:", err);
        }
      }
    } catch (error) {
      console.error("Error in /ask command:", error);
      await ctx.reply("Sorry, I couldn't process your question. Please try again later.");
    }
  });

  // Save all incoming updates to database for processing
  telegramBot.on("message", async (ctx) => {
    try {
      await storage.saveTelegramWebhook({
        telegramId: ctx.from.id,
        data: ctx.update
      });
    } catch (error) {
      console.error("Error saving Telegram webhook:", error);
    }
  });
}

// Process unprocessed webhooks
async function processUnprocessedWebhooks() {
  try {
    const webhooks = await storage.getUnprocessedWebhooks(10);
    
    for (const webhook of webhooks) {
      try {
        // Process webhook here
        // This is where you would handle quiz answers, etc.
        
        // Mark as processed
        await storage.markWebhookProcessed(webhook.id);
      } catch (error) {
        console.error(`Error processing webhook ${webhook.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in processUnprocessedWebhooks:", error);
  }
}

// Ask a question to the AI
async function askAI(question: string): Promise<string> {
  try {
    if (!OPENROUTER_API_KEY) {
      return "Sorry, the AI tutor is not available at the moment.";
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-opus',
        messages: [
          {
            role: 'system',
            content: 'You are an AI medical tutor helping medical students learn. Provide accurate, educational responses to medical questions. Be thorough but concise. Include key facts and concepts that would be important for a medical student to know. Format your response using Markdown.'
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

    const data = await response.json() as { 
      choices: Array<{ 
        message: { 
          content: string 
        } 
      }> 
    };
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from AI service');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in askAI:', error);
    return "I'm sorry, I'm having trouble processing your question right now. Please try again later.";
  }
}

// Middleware for handling Telegram webhook
// Using Express-specific middleware with error handling
export const telegramWebhookMiddleware = telegramBot 
  ? webhookCallback(telegramBot, 'express')
  : null;

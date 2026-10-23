// =====================================================
// AI Integration Route using Groq API
// Uses Groq's LLM (LLaMA model) for student queries
// Demonstrates: External API call, async/await, 
//               error handling, chat history storage
// =====================================================

const express = require('express');
const Groq = require('groq-sdk');
const { pool } = require('../db');
require('dotenv').config();

const router = express.Router();

// Initialize Groq client with API key from .env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// -----------------------------------------------
// POST /api/ai/chat
// Sends a question to Groq LLM and returns answer
// Also saves Q&A to database for history
// -----------------------------------------------
router.post('/chat', async (req, res) => {
    try {
        const { question, userId } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required'
            });
        }

        // Check if Groq API key is configured
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(503).json({
                success: false,
                message: 'Groq API key not configured. Add it to the .env file.'
            });
        }

        // Call Groq API - using active model on Groq
        const selectedModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful college assistant. Answer questions about academics, courses, student life, and general knowledge. Keep answers concise and helpful (2-3 paragraphs max).'
                },
                {
                    role: 'user',
                    content: question
                }
            ],
            model: selectedModel,
            temperature: 0.7,
            max_tokens: 500
        });

        const answer = chatCompletion.choices[0]?.message?.content || 'No response generated.';

        // Save to database for chat history (non-blocking if foreign key missing)
        if (userId) {
            try {
                await pool.execute(
                    'INSERT INTO ai_chat_history (user_id, question, answer) VALUES (?, ?, ?)',
                    [userId, question, answer]
                );
            } catch (dbErr) {
                console.warn('Warning: Could not save chat to DB history:', dbErr.message);
            }
        }

        res.json({
            success: true,
            data: {
                question: question,
                answer: answer,
                model: selectedModel,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('AI Chat error:', error.message);
        res.status(500).json({
            success: false,
            message: 'AI service error: ' + error.message
        });
    }
});

// -----------------------------------------------
// GET /api/ai/history/:userId
// Retrieves chat history for a user
// -----------------------------------------------
router.get('/history/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM ai_chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.params.userId]
        );

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

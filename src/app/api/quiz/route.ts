import { NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';

export async function GET() {
  try {
    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Quiz: OPENROUTER_API_KEY is missing');
      throw new Error('AI service not configured - using fallback questions');
    }

    const text = await generateText(`
      Generate 10 multiple-choice quiz questions about community living, civic responsibility, environment awareness, waste management, road safety, water conservation, and public hygiene. 
      
      Rules:
      - Questions should be VERY EASY and suitable for common people (not experts)
      - Questions should be relevant to daily life in Indian cities
      - Topics: recycling, water saving, road safety, pollution, community reporting, cleanliness, public transport, tree plantation, noise pollution, civic duties
      - Each question must have exactly 1 correct answer and 3 wrong answers
      - Wrong answers should be clearly wrong (even funny) so it's obvious
      - Keep language simple and conversational
      
      Respond ONLY with valid JSON array in this exact format:
      [
        {
          "question": "What should you do with plastic waste?",
          "correct_answer": "Recycle it",
          "incorrect_answers": ["Burn it", "Throw in river", "Bury it"],
          "category": "Environment",
          "difficulty": "easy"
        }
      ]
      
      Generate exactly 10 questions. Only respond with the JSON array, nothing else.
    `);

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanedText);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Quiz generation error:', error.message);
    // Fallback to hardcoded questions if AI fails
    const fallbackQuestions = [
      {
        question: 'What is the best way to dispose of plastic bottles?',
        correct_answer: 'Recycle them',
        incorrect_answers: ['Burn them', 'Throw in river', 'Bury in ground'],
        category: 'Environment',
        difficulty: 'easy',
      },
      {
        question: 'Which color dustbin is used for dry waste in India?',
        correct_answer: 'Blue',
        incorrect_answers: ['Green', 'Red', 'Yellow'],
        category: 'Waste Management',
        difficulty: 'easy',
      },
      {
        question: 'What does the 3R principle stand for?',
        correct_answer: 'Reduce, Reuse, Recycle',
        incorrect_answers: ['Run, Rest, Repeat', 'Read, React, Reply', 'Remove, Replace, Repair'],
        category: 'Environment',
        difficulty: 'easy',
      },
      {
        question: 'What is the main cause of potholes on roads?',
        correct_answer: 'Water seeping into cracks',
        incorrect_answers: ['Too much sunlight', 'Heavy wind', 'Planting trees nearby'],
        category: 'Infrastructure',
        difficulty: 'easy',
      },
      {
        question: 'What should you do if you see a broken streetlight?',
        correct_answer: 'Report it to the local municipality',
        incorrect_answers: ['Ignore it', 'Try to fix it yourself', 'Put a candle there'],
        category: 'Community',
        difficulty: 'easy',
      },
      {
        question: 'Which of these saves the most water at home?',
        correct_answer: 'Fixing leaky taps',
        incorrect_answers: ['Using a bigger bucket', 'Washing clothes daily', 'Keeping taps running'],
        category: 'Water Conservation',
        difficulty: 'easy',
      },
      {
        question: 'What does AQI stand for?',
        correct_answer: 'Air Quality Index',
        incorrect_answers: ['Air Quantity Index', 'Area Quality Inspector', 'Atmosphere Quick Info'],
        category: 'Environment',
        difficulty: 'easy',
      },
      {
        question: 'Which of these is a renewable source of energy?',
        correct_answer: 'Solar energy',
        incorrect_answers: ['Coal', 'Petrol', 'Natural gas'],
        category: 'Environment',
        difficulty: 'easy',
      },
      {
        question: 'Why are trees important in cities?',
        correct_answer: 'They provide clean air and shade',
        incorrect_answers: ['They block mobile signals', 'They attract mosquitoes', 'They damage buildings'],
        category: 'Environment',
        difficulty: 'easy',
      },
      {
        question: 'Which of these reduces air pollution?',
        correct_answer: 'Using public transport or cycling',
        incorrect_answers: ['Burning crackers', 'Using diesel generators', 'Keeping car engine on while parked'],
        category: 'Environment',
        difficulty: 'easy',
      },
    ];

    return NextResponse.json({ questions: fallbackQuestions });
  }
}

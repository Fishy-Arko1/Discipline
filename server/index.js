import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

dotenv.config({ path: envPath });

const app = express();
const port = Number(process.env.OTP_SERVER_PORT || 8787);
const otpStore = new Map();
const refreshEnv = () => dotenv.config({ path: envPath, override: true });
const isGroqConfigured = () => Boolean(process.env.GROQ_API_KEY);
const getGroqModel = (kind = 'general') =>
  process.env[kind === 'vision' ? 'GROQ_VISION_MODEL' : 'GROQ_MODEL'] ||
  process.env.GROQ_MODEL ||
  (kind === 'vision' ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile');

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '12mb' }));

const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const buildOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

app.get('/api/health', (_request, response) => {
  refreshEnv();
  response.json({
    ok: true,
    smtpConfigured,
    groqConfigured: isGroqConfigured(),
    sender: process.env.SMTP_FROM || process.env.SMTP_USER || null,
  });
});

const buildLocalCompanionReply = ({ message, profile, dailyLog, recentMessages }) => {
  const normalized = String(message || '').toLowerCase();
  const completedTasks = dailyLog?.completedWorkoutTasks?.length || 0;
  const studyHours = Number(((dailyLog?.studyMinutes || 0) / 60).toFixed(1));
  const variants = {
    study: [
      `You are at ${studyHours} study hours today. Start one 45-minute focus block right now, then take a short break and repeat.`,
      `Your study target is ${profile?.dailyTargets?.studyHours || 0} hours. The fastest win is one distraction-free session before checking anything else.`,
    ],
    workout: [
      `You have completed ${completedTasks} workout tasks so far. Finish the next task before looking at the full plan again.`,
      `Today's workout target is ${profile?.dailyTargets?.workoutMinutes || 0} minutes. Start with the easiest checklist item to build momentum.`,
    ],
    calories: [
      `You are at ${dailyLog?.caloriesConsumed || 0} kcal today with a target of ${profile?.dailyTargets?.calories || 0} kcal. Keep the next meal simple and protein-focused.`,
      `Calories gained today: ${dailyLog?.caloriesConsumed || 0}. Calories burned today: ${dailyLog?.caloriesBurned || 0}. Balance the next choice, don't chase perfection.`,
    ],
    water: [
      `Hydration is at ${Number(((dailyLog?.waterIntakeMl || 0) / 1000).toFixed(2))}L. Drink a glass now and another after your next task block.`,
      `Your water target is ${profile?.dailyTargets?.waterLiters || 0}L. Keep the bottle next to you so the habit happens automatically.`,
    ],
    general: [
      `Your next best move is simple: finish one workout task, complete one study block, and log your next meal right away.`,
      `Momentum beats motivation. Pick the smallest unfinished task and finish it before starting something new.`,
      `You already asked ${recentMessages.length} things today. Don't collect more advice until you complete one action.`,
    ],
  };

  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  if (normalized.includes('study')) return pick(variants.study);
  if (normalized.includes('workout') || normalized.includes('exercise') || normalized.includes('gym')) return pick(variants.workout);
  if (normalized.includes('calorie') || normalized.includes('food') || normalized.includes('eat')) return pick(variants.calories);
  if (normalized.includes('water') || normalized.includes('drink')) return pick(variants.water);
  return pick(variants.general);
};

const extractJsonObject = (text) => {
  const trimmed = String(text || '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found.');
  }

  return JSON.parse(trimmed.slice(start, end + 1));
};

const extractGroqResponseText = (data) => {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputText = Array.isArray(data?.output)
    ? data.output
        .flatMap((item) => {
          if (typeof item?.text === 'string') return [item.text];
          if (typeof item?.content === 'string') return [item.content];
          if (!Array.isArray(item?.content)) return [];

          return item.content.flatMap((contentItem) => {
            if (typeof contentItem === 'string') return [contentItem];
            if (typeof contentItem?.text === 'string') return [contentItem.text];
            if (typeof contentItem?.content === 'string') return [contentItem.content];
            return [];
          });
        })
        .map((value) => String(value).trim())
        .filter(Boolean)
        .join('\n')
        .trim()
    : '';

  if (outputText) {
    return outputText;
  }

  const choicesText = data?.choices
    ?.flatMap((choice) => {
      const messageContent = choice?.message?.content;
      if (typeof messageContent === 'string') return [messageContent];
      if (Array.isArray(messageContent)) {
        return messageContent
          .map((item) => (typeof item?.text === 'string' ? item.text : ''))
          .filter(Boolean);
      }
      return [];
    })
    .join('\n')
    .trim();

  if (choicesText) {
    return choicesText;
  }

  return '';
};

const sanitizeAssistantText = (text) =>
  String(text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/\r\n/g, '\n')
    .trim();

const extractGroqChatText = (data) => {
  const messageContent = data?.choices?.[0]?.message?.content;

  if (typeof messageContent === 'string') {
    return sanitizeAssistantText(messageContent);
  }

  if (Array.isArray(messageContent)) {
    return sanitizeAssistantText(
      messageContent
      .map((item) => {
        if (typeof item === 'string') return item;
        if (typeof item?.text === 'string') return item.text;
        return '';
      })
      .filter(Boolean)
      .join('\n')
    );
  }

  return '';
};

const buildCompanionRequestBody = (model, messages, maxCompletionTokens = 320) => {
  const base = {
    model,
    messages,
    temperature: 0.7,
    stream: false,
    max_completion_tokens: maxCompletionTokens,
  };

  if (String(model).startsWith('openai/gpt-oss')) {
    return {
      ...base,
      include_reasoning: false,
    };
  }

  return base;
};

app.post('/api/auth/send-otp', async (request, response) => {
  const identifier = String(request.body?.identifier || '').trim().toLowerCase();

  if (!identifier || !identifier.includes('@')) {
    return response.status(400).json({ message: 'A valid email address is required.' });
  }

  if (!smtpConfigured || !transporter) {
    return response.status(503).json({ message: 'SMTP is not configured.' });
  }

  const code = buildOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(identifier, {
    code,
    expiresAt,
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: identifier,
      subject: 'Your OKRA OTP Code',
      text: `OKRA login code: ${code}. It expires in 10 minutes.`,
      html: `
        <div style="margin:0; padding:32px 16px; background:#070707; background-image:
          radial-gradient(circle at top left, rgba(249,115,22,0.18), transparent 24%),
          radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 18%),
          linear-gradient(180deg, #050505 0%, #0a0a0a 42%, #130d07 100%);
          font-family: 'Segoe UI', Arial, sans-serif; color:#f5f5f5;">
          <div style="max-width:640px; margin:0 auto;">
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:24px;">
              <div style="height:52px; width:52px; border-radius:18px; display:inline-flex; align-items:center; justify-content:center; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.18em; background:linear-gradient(135deg, #f97316 0%, #fbbf24 48%, #3b82f6 100%); box-shadow:0 16px 32px rgba(249,115,22,0.28);">O</div>
              <div>
                <div style="font-size:28px; line-height:1; font-weight:700; letter-spacing:0.32em; color:#fff7ed;">OKRA</div>
                <div style="margin-top:6px; font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,237,213,0.72);">Discipline AI Tracker</div>
              </div>
            </div>

            <div style="border:1px solid rgba(251,146,60,0.22); border-radius:32px; padding:28px; background:rgba(11,11,11,0.86); box-shadow:0 24px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(251,146,60,0.12);">
              <div style="font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:rgba(255,237,213,0.78);">Secure Login</div>
              <h2 style="margin:14px 0 10px; font-size:40px; line-height:1.05; font-weight:700; color:#ffffff;">Your OTP is ready.</h2>
              <p style="margin:0; font-size:16px; line-height:1.7; color:#d4d4d8;">
                Use the verification code below to sign in to OKRA and continue your discipline streak.
              </p>

              <div style="margin:28px 0 22px; border-radius:26px; padding:22px 24px; background:linear-gradient(135deg, rgba(249,115,22,0.16), rgba(59,130,246,0.12)); border:1px solid rgba(251,146,60,0.18);">
                <div style="font-size:12px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,237,213,0.78);">One-Time Password</div>
                <div style="margin-top:14px; font-size:44px; font-weight:800; letter-spacing:0.42em; color:#ffffff;">${code}</div>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:18px;">
                <div style="border-radius:999px; padding:10px 14px; background:rgba(249,115,22,0.12); color:#fed7aa; font-size:13px;">Expires in 10 minutes</div>
                <div style="border-radius:999px; padding:10px 14px; background:rgba(59,130,246,0.12); color:#bfdbfe; font-size:13px;">Ignore if this was not you</div>
              </div>
            </div>

            <p style="margin:16px 8px 0; font-size:12px; line-height:1.6; color:rgba(255,255,255,0.5);">
              This code is for your OKRA account access. Never share it with anyone.
            </p>
          </div>
        </div>
      `,
    });

    return response.json({ sent: true });
  } catch (error) {
    console.error('Failed to send OTP email', error);
    otpStore.delete(identifier);
    return response.status(500).json({ message: 'Failed to send OTP email.' });
  }
});

app.post('/api/auth/verify-otp', (request, response) => {
  const identifier = String(request.body?.identifier || '').trim().toLowerCase();
  const code = String(request.body?.code || '').trim();
  const pending = otpStore.get(identifier);

  if (!pending || pending.expiresAt < Date.now() || pending.code !== code) {
    return response.status(401).json({ verified: false });
  }

  otpStore.delete(identifier);
  return response.json({
    verified: true,
    userId: `user-${identifier.replace(/[^a-z0-9]/gi, '').slice(0, 18) || 'email'}`,
  });
});

app.post('/api/ai/companion', async (request, response) => {
  const message = String(request.body?.message || '').trim();
  const profile = request.body?.profile ?? null;
  const dailyLog = request.body?.dailyLog ?? null;
  const conversation = Array.isArray(request.body?.conversation) ? request.body.conversation : [];

  if (!message) {
    return response.status(400).json({ message: 'Message is required.' });
  }

  refreshEnv();

  if (!isGroqConfigured()) {
    return response.json({
      reply: buildLocalCompanionReply({
        message,
        profile,
        dailyLog,
        recentMessages: conversation,
      }),
      source: 'local-fallback',
    });
  }

  try {
    const contextSummary = [
      `Name: ${profile?.name || 'User'}`,
      `Goal: ${profile?.goal || 'Unknown'}`,
      `Workout target: ${profile?.dailyTargets?.workoutMinutes || 0} minutes`,
      `Study target: ${profile?.dailyTargets?.studyHours || 0} hours`,
      `Water target: ${profile?.dailyTargets?.waterLiters || 0} liters`,
      `Calories target: ${profile?.dailyTargets?.calories || 0} kcal`,
      `Today's study: ${dailyLog?.studyMinutes || 0} minutes`,
      `Today's water: ${dailyLog?.waterIntakeMl || 0} ml`,
      `Today's calories consumed: ${dailyLog?.caloriesConsumed || 0} kcal`,
      `Today's calories burned: ${dailyLog?.caloriesBurned || 0} kcal`,
      `Completed workout tasks: ${(dailyLog?.completedWorkoutTasks || []).join(', ') || 'none'}`,
    ].join('\n');

    const recentConversation = conversation
      .slice(-6)
      .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.text}`)
      .join('\n');

    const messages = [
      {
        role: 'system',
        content:
          'You are a disciplined, supportive AI fitness and productivity companion. Give practical, non-repetitive guidance tailored to the user. Prefer action-oriented coaching over generic motivational quotes. Do not reveal chain-of-thought, hidden reasoning, notes, or planning. Never use markdown tables, long separators, or dense formatting. Give a complete answer and never stop mid-sentence. Use either a short paragraph or 2 to 5 short bullet points when helpful.',
      },
      {
        role: 'system',
        content: `User context:\n${contextSummary}`,
      },
      ...conversation.slice(-6).map((entry) => ({
        role: entry.role,
        content: entry.text,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const preferredModel = getGroqModel('general');
    const modelCandidates = [...new Set([preferredModel, 'llama-3.3-70b-versatile'])];
    const tokenCandidates = [320, 640];
    let reply = '';
    let lastData = null;
    let lastFinishReason = null;

    for (const model of modelCandidates) {
      for (const maxCompletionTokens of tokenCandidates) {
        const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify(buildCompanionRequestBody(model, messages, maxCompletionTokens)),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(errorText || 'Groq request failed');
        }

        const data = await aiResponse.json();
        lastData = data;
        lastFinishReason = data?.choices?.[0]?.finish_reason ?? null;
        reply = extractGroqChatText(data) || extractGroqResponseText(data);

        if (reply && lastFinishReason !== 'length') {
          break;
        }
      }

      if (reply && lastFinishReason !== 'length') {
        break;
      }
    }

    if (!reply) {
      console.error('Groq companion response missing text', {
        status: lastData?.status,
        keys: Object.keys(lastData || {}),
        outputTypes: Array.isArray(lastData?.output) ? lastData.output.map((item) => item?.type || 'unknown') : [],
        choiceCount: Array.isArray(lastData?.choices) ? lastData.choices.length : 0,
        choicePreview: JSON.stringify(lastData?.choices?.[0] ?? null)?.slice(0, 1200),
        finishReason: lastFinishReason,
      });
      throw new Error('No AI response text returned');
    }

    return response.json({
      reply,
      source: 'groq',
    });
  } catch (error) {
    console.error('Groq companion request failed', error);
    return response.status(502).json({
      source: 'groq-error',
      message: 'Groq companion request failed.',
      detail: error instanceof Error ? error.message : 'Unknown Groq error.',
    });
  }
});

app.post('/api/ai/scan-food', async (request, response) => {
  const imageDataUrl = String(request.body?.imageDataUrl || '').trim();
  const fileName = String(request.body?.fileName || '').trim();
  const attempt = Number(request.body?.attempt || 0);

  if (!imageDataUrl.startsWith('data:image/')) {
    return response.status(400).json({ message: 'A valid image is required.' });
  }

  refreshEnv();

  if (!isGroqConfigured()) {
    return response.status(503).json({ message: 'Groq is not configured.' });
  }

  try {
    const avoidGuessInstruction =
      attempt > 0
        ? 'The previous guess was wrong. Re-evaluate carefully and do not reuse the same mistake.'
        : 'Be careful and prefer broad, correct food names over overly specific but wrong guesses.';

    const aiResponse = await fetch('https://api.groq.com/openai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: getGroqModel('vision'),
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  'You identify food from meal images. Return only strict JSON with keys: name, calories, confidence. Use a practical food label like "Pizza" or "Vegetable Sandwich". Calories should be an integer estimate for the visible serving, not per 100g.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Analyze this meal image from file "${fileName || 'upload'}". ${avoidGuessInstruction} If uncertain, choose a safer broad label like "Pizza", "Burger", "Rice Meal", "Pasta", or "Salad Bowl".`,
              },
              {
                type: 'input_image',
                image_url: imageDataUrl,
              },
            ],
          },
        ],
        max_output_tokens: 180,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(errorText || 'Groq food scan request failed');
    }

    const data = await aiResponse.json();
    const outputText = extractGroqResponseText(data);

    if (!outputText) {
      console.error('Groq food scan response missing text', {
        status: data?.status,
        keys: Object.keys(data || {}),
        outputTypes: Array.isArray(data?.output) ? data.output.map((item) => item?.type || 'unknown') : [],
      });
      throw new Error('Groq food scan returned no readable text.');
    }

    const parsed = extractJsonObject(outputText);
    const safeName = String(parsed.name || 'Detected Meal').trim();
    const safeCalories = Math.max(1, Math.round(Number(parsed.calories || 250)));

    return response.json({
      name: safeName,
      calories: safeCalories,
      confidence: Number(parsed.confidence || 0.7),
      source: 'groq',
    });
  } catch (error) {
    console.error('Groq food scan request failed', error);
    return response.status(502).json({
      source: 'groq-error',
      message: 'AI food scan failed.',
      detail: error instanceof Error ? error.message : 'Unknown Groq error.',
    });
  }
});

app.listen(port, () => {
  console.log(`OTP server listening on http://localhost:${port}`);
});

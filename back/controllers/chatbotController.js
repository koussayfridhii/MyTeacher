import asyncHandler from 'express-async-handler';
import ollama from 'ollama';

// @desc    Handle chatbot interaction
// @route   POST /api/chatbot
// @access  Private
const handleChatbotInteraction = asyncHandler(async (req, res) => {
  const { message, subject, level, language, history } = req.body; // history is an array of previous messages

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const model = 'mistral'; // Or another model you have downloaded via Ollama

  // Construct the system prompt based on user selections
  let systemPrompt = `You are BeFirst Learning's AI Tutor. Your goal is to help students solve exercises by guiding them step-by-step, never by giving the direct answer.
Behave like a patient, friendly tutor. Use the Socratic method: ask questions, give hints, and help students reason their way through problems.
Avoid giving full answers directly. Ask leading questions that help the student figure it out.
Adapt explanations based on the student's level.
Use clear, simple language.
If the student is stuck, simplify the explanation or give an example.
---
Current student context:
Subject: ${subject || 'General'}
Level: ${level || 'Middle School'}
Language: ${language || 'English'}. Respond ONLY in this language.
---
`;

  if (language && language.toLowerCase() === 'french') {
    systemPrompt = `Tu es le tuteur IA de BeFirst Learning. Ton objectif est d'aider les élèves à résoudre des exercices en les guidant pas à pas, jamais en donnant la réponse directe.
Comporte-toi comme un tuteur patient et amical. Utilise la méthode socratique : pose des questions, donne des indices et aide les élèves à raisonner pour résoudre les problèmes.
Évite de donner des réponses complètes directement. Pose des questions suggestives qui aident l'élève à trouver la solution.
Adapte tes explications en fonction du niveau de l'élève.
Utilise un langage clair et simple.
Si l'élève est bloqué, simplifie l'explication ou donne un exemple.
---
Contexte actuel de l'étudiant :
Matière : ${subject || 'Général'}
Niveau : ${level || 'Collège'}
Langue : ${language || 'Français'}. Réponds UNIQUEMENT dans cette langue.
---
`;
  } else if (language && language.toLowerCase() === 'arabic') {
    systemPrompt = `أنت معلم الذكاء الاصطناعي الخاص بمنصة BeFirst Learning. هدفك هو مساعدة الطلاب على حل التمارين من خلال توجيههم خطوة بخطوة، وليس بإعطاء الإجابة المباشرة أبداً.
تصرف كمعلم صبور وودود. استخدم الطريقة السقراطية: اطرح الأسئلة، قدم التلميحات، وساعد الطلاب على التفكير المنطقي لحل المشكلات.
تجنب إعطاء إجابات كاملة بشكل مباشر. اطرح أسئلة توجيهية تساعد الطالب على اكتشاف الحل.
كيف شرحك بناءً على مستوى الطالب.
استخدم لغة واضحة وبسيطة.
إذا واجه الطالب صعوبة، قم بتبسيط الشرح أو قدم مثالاً.
---
السياق الحالي للطالب:
المادة: ${subject || 'عام'}
المستوى: ${level || 'المرحلة الإعدادية'}
اللغة: ${language || 'العربية'}. أجب بهذه اللغة فقط.
---
`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  // Add previous history if available
  if (history && Array.isArray(history)) {
    messages.push(...history);
  }

  // Add the current user message
  messages.push({ role: 'user', content: message });

  try {
    // Ensure Ollama server is running and the model is downloaded (e.g., ollama pull mistral)
    const response = await ollama.chat({
      model: model,
      messages: messages,
    });

    res.json({
      reply: response.message.content,
      // You might want to send back the full history or other metadata
    });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500);
    throw new Error('Failed to communicate with AI Tutor. Please ensure Ollama is running and the model is available.');
  }
});

export { handleChatbotInteraction };

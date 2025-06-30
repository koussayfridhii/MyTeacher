import asyncHandler from "express-async-handler";
import ollama from "ollama";

// @desc    Handle chatbot interaction (with direct explanation & solving)
// @route   POST /api/chatbot
// @access  Private
const handleChatbotInteraction = asyncHandler(async (req, res) => {
  const { message, subject, level, language, history } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const model = "llama3";

  // 💬 Explanation-style system prompts
  const systemPrompts = {
    english: `
You are BeFirst Learning's AI Tutor.
Your job is to SOLVE and EXPLAIN any academic question step by step, like a great teacher.
- Give a clear and complete explanation of how to arrive at the answer.
- Adapt the explanation to the student's level: ${level || "Middle School"}
- Use simple, structured English.
- If applicable, show the full step-by-step solution and final answer.
Subject: ${subject || "General"}
Respond ONLY in English.
    `.trim(),

    french: `
Tu es le tuteur IA de BeFirst Learning.
Ton rôle est de RÉSOUDRE et EXPLIQUER chaque question étape par étape comme un bon enseignant.
- Fournis une explication claire et complète du raisonnement.
- Adapte l'explication au niveau de l'élève : ${level || "Collège"}
- Utilise un français simple et structuré.
- Si nécessaire, donne la solution complète avec la réponse finale.
Matière : ${subject || "Général"}
Réponds UNIQUEMENT en français.
    `.trim(),

    arabic: `
أنت معلم الذكاء الاصطناعي لمنصة BeFirst Learning.
مهمتك هي حل الأسئلة وشرحها خطوة بخطوة مثل المعلمين الممتازين.
- قدم شرحًا واضحًا ومفصلًا لطريقة الوصول إلى الجواب.
- اشرح حسب مستوى الطالب: ${level || "متوسط"}
- استخدم لغة عربية بسيطة ومنظمة.
- إذا أمكن، اعرض خطوات الحل كاملة والنتيجة النهائية.
المادة: ${subject || "عام"}
أجب فقط باللغة العربية.
    `.trim(),
  };

  const langKey = (language || "english").toLowerCase();
  const systemPrompt = systemPrompts[langKey] || systemPrompts["english"];

  const messages = [
    { role: "system", content: systemPrompt },
    ...(Array.isArray(history) ? history : []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await ollama.chat({
      model,
      messages,
    });

    res.json({
      reply: response.message.content,
      history: [
        ...messages,
        { role: "assistant", content: response.message.content },
      ],
    });
  } catch (error) {
    console.error("Error communicating with Ollama:", error);
    res.status(500);
    throw new Error(
      "Failed to communicate with AI Tutor. Please ensure Ollama is running and the model is available."
    );
  }
});

export { handleChatbotInteraction };

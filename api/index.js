
const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  // Headers para permitir la comunicación
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'Error de configuración del servidor: La clave de API no está disponible.' });
    }

    const ai = new GoogleGenAI({apiKey: API_KEY});
    const { documentType, area, topic, focus, objective, company } = req.body;

    const prompt = `
      **ROLE & CONTEXT:** You are a senior academic advisor and research methodologist with global expertise. Your task is to transform a student's basic ideas into a formal, professional, and compelling academic research title. The user can be from anywhere in the world.

      **CORE TASK:** Analyze the user's input not as literal words to be combined, but as concepts to be elevated. Your output must be a single, well-formed research title that is specific, measurable, and methodologically sound.

      **ANALYSIS & REFINEMENT RULES:**
      1.  **Deconstruct the Input:** Identify the core variables (independent/dependent), the population or context, and the intended academic action (e.g., analyze, design, evaluate, compare).
      2.  **Elevate Language:** Replace simplistic terms with precise academic vocabulary. (e.g., "help" becomes "facilitate," "problems with kids" becomes "challenges in early childhood development").
      3.  **Imply Methodology:** The title's structure should hint at the research approach. "Analysis of the Impact of X on Y" suggests a quantitative or qualitative study. "Design of a Framework for..." suggests a constructive/design science approach. "A Comparative Study of..." implies a comparative methodology.
      4.  **Syntactic Precision:** Ensure perfect grammar, punctuation, and formal structure. Use connectors like "for the," "in the context of," "and its impact on," to create a coherent and professional title.
      5.  **Global Perspective:** Do NOT assume any specific country. The title must be universally understandable. If a company is mentioned for a "Proyecto de Grado", integrate it formally (e.g., "...in the Company X, S.A.").

      **STRICT OUTPUT FORMAT:**
      - Respond ONLY with the generated title.
      - NO explanations, NO greetings, NO preambles, NO quotation marks. Just the plain text of the title.

      **EXAMPLE OF QUALITY TRANSFORMATION:**
      -   **User Input:**
          -   Area: "Marketing"
          -   Topic: "Using AI for stores"
          -   Focus: "Online shops"
          -   Objective: "Make a model"
      -   **Your Output (Exemplary Title):** Design and Implementation of an AI-Powered Predictive Analytics Model for Customer Behavior in E-commerce Platforms.

      **USER'S RAW INPUT TO BE TRANSFORMED:**
      -   Document Type: ${documentType}
      -   Area of Study: ${area}
      -   Topic/Problem: ${topic}
      -   Research Focus: ${focus}
      -   Main Objective: ${objective}
      -   Specific Company (if applicable): ${company || 'N/A'}

      **GENERATE THE ACADEMIC TITLE NOW:**
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
    });
    
    const generatedText = response.text;

    if (!generatedText) {
       let errorMessage = 'La IA no pudo generar una respuesta. Motivo: La solicitud fue bloqueada por seguridad. Revisa el texto que enviaste.';
       return res.status(500).json({ error: errorMessage });
    }
    
    res.status(200).json({ title: generatedText.trim() });

  } catch (error) {
    console.error('Error inesperado en la función del servidor:', error);
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
};

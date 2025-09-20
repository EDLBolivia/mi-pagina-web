const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
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
      console.error("CRITICAL ERROR: API_KEY no está configurada.");
      return res.status(500).json({ error: 'Error de configuración del servidor: La clave de API no está disponible.' });
    }

    const ai = new GoogleGenAI({apiKey: API_KEY});

    const { documentType, area, topic, focus, objective, company } = req.body;

    if (!documentType || !area || !topic || !focus || !objective) {
      return res.status(400).json({ error: 'Faltan campos requeridos en la solicitud.' });
    }

    const prompt = `
      **Your Role & Goal:** You are an expert thesis advisor for 'Escuela de Líderes - Bolivia'. Your goal is to generate a professional, impactful, and methodologically sound academic title. Analyze the user's input deeply.
      **Title Quality Rules:** Eliminate spatial delimitation by default. Use professional & concise language. Balance simplicity & complexity.
      **Methodological Structure:** The final title must clearly articulate: The What (problem), The Who/Where (object of study), The For What (goal).
      **Example:** User Input: Problem: "Uso de la IA en marketing", Focus: "Tiendas virtuales", Objective: "Diseñar un modelo". Improved Title: "Diseño de un modelo de gestión comercial potenciado con Inteligencia Artificial para el desarrollo de tiendas virtuales."
      **Strict Output Rules:** Assume Bolivian context but DO NOT mention "Bolivia" in the title unless essential. Max 20 words (excluding connectors). If 'Proyecto de Grado' and company is provided, incorporate it. Respond ONLY with the generated title text. No explanations.
      **User's Input:**
      - Document Type: ${documentType}
      - Area of Study: ${area}
      - Topic/Problem: ${topic}
      - Research Focus: ${focus}
      - Main Objective: ${objective}
      - Specific Company: ${company || 'N/A'}
      **Generate the Final Title Now.**
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
    });
    
    const generatedText = response.text;

    if (!generatedText) {
      console.error('Respuesta de la API de Gemini bloqueada o sin texto:', JSON.stringify(response, null, 2));
      let errorMessage = 'La IA no pudo generar una respuesta.';
       if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason !== 'STOP') {
          errorMessage += ` Motivo: La solicitud fue bloqueada por seguridad (${response.candidates[0].finishReason}). Revisa el texto que enviaste.`;
      }
      return res.status(500).json({ error: errorMessage });
    }
    
    res.status(200).json({ title: generatedText.trim() });

  } catch (error) {
    console.error('Error inesperado en la función del servidor:', error);
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
};

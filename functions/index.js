// ESTA ES LA VERSIÓN FINAL Y CORRECTA DEL SERVIDOR.
module.exports = async (req, res) => {
  // Configuración para permitir que tu página web hable con este motor.
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
      console.error("CRITICAL ERROR: API_KEY no está configurada en Vercel.");
      return res.status(500).json({ error: 'Error de configuración del servidor.' });
    }

    const { documentType, area, topic, focus, objective, company } = req.body;

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

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const apiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok || !responseData.candidates || responseData.candidates.length === 0) {
      console.error('Respuesta inválida de la API de Gemini:', JSON.stringify(responseData));
      return res.status(500).json({ error: 'La IA no pudo generar una respuesta.' });
    }
    
    const title = responseData.candidates[0].content.parts[0].text;
    res.status(200).json({ title: title.trim() });

  } catch (error) {
    console.error('Error inesperado en la función del servidor:', error);
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
};

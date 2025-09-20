// ESTA ES LA VERSIÓN FINAL Y CORRECTA DEL SERVIDOR.
// NO USA NINGUNA HERRAMIENTA EXTERNA, SOLO LAS QUE YA TIENE VERCEL.
const https = require('https');

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

    const postData = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          if (apiRes.statusCode >= 400 || !responseData.candidates || responseData.candidates.length === 0) {
            console.error('Error from Gemini API:', data);
            return res.status(500).json({ error: 'La IA no pudo generar una respuesta.' });
          }
          const title = responseData.candidates[0].content.parts[0].text;
          res.status(200).json({ title: title.trim() });
        } catch (e) {
          console.error('Error parsing Gemini response:', data);
          res.status(500).json({ error: 'Error al procesar la respuesta de la IA.' });
        }
      });
    });

    apiReq.on('error', (e) => {
      console.error('Error with API request:', e);
      res.status(500).json({ error: 'Fallo en la comunicación con la IA.' });
    });

    apiReq.write(postData);
    apiReq.end();

  } catch (error) {
    console.error('Error inesperado en la función del servidor:', error);
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
};

const https = require('https');

// Esta es la función del servidor, corregida para funcionar en Vercel.
module.exports = async (req, res) => {
  // Configuración para permitir que tu página web hable con este motor.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejo de una solicitud de prueba que hace el navegador.
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Verifica que los datos se están enviando correctamente.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Obtiene la clave secreta de Vercel.
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'La clave de API no está configurada.' });
  }

  const { documentType, area, topic, focus, objective, company } = req.body;

  // Validación de que todos los campos llegaron.
  if (!documentType || !area || !topic || !focus || !objective) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  const prompt = `
      **Your Role & Goal:**
      You are an expert thesis advisor for 'Escuela de Líderes - Bolivia'. Your goal is to generate a professional, impactful, and methodologically sound academic title. Analyze the user's input deeply, don't just combine keywords. The user is in Bolivia.
      
      **Title Quality Rules (Apply Rigorously):**
      1.  **Eliminate Spatial Delimitation (by default):** DO NOT include a location (e.g., Bolivia, La Paz) unless the research topic is intrinsically tied to a specific geography. If the user provides a company for a 'Proyecto de Grado', that is the only exception where a specific entity is named.
      2.  **Professional & Concise Language:** Use precise, academic language appropriate for the field.
      3.  **Balance Simplicity & Complexity:** The title must be easily understood but also reflect academic rigor.

      **Methodological Structure:**
      The final title must clearly articulate: The What (problem), The Who/Where (object of study), The For What (goal).

      **Example:**
      *   User Input: Problem: "Uso de la IA en marketing", Focus: "Tiendas virtuales", Objective: "Diseñar un modelo".
      *   Improved Title: "Diseño de un modelo de gestión comercial potenciado con Inteligencia Artificial para el desarrollo de tiendas virtuales."

      **Strict Output Rules:**
      1.  **Geo-context:** Assume Bolivian context for legal/social topics, but DO NOT mention "Bolivia" in the title unless essential.
      2.  **Length:** Max 20 words, excluding common connectors.
      3.  **Project-specific:** If 'Proyecto de Grado' and company is provided, incorporate it.
      4.  **Format:** Respond ONLY with the generated title text. No explanations.

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
      parts: [{
        text: prompt
      }]
    }],
    systemInstruction: {
        parts: [{
            text: "You are an expert thesis advisor applying principles of research methodology to create professional, specialized, and context-aware academic titles for Bolivian university students."
        }]
    }
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
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    apiRes.on('end', () => {
      try {
        if (apiRes.statusCode >= 400) {
            console.error('Error from Gemini API:', data);
            return res.status(500).json({ error: 'Error from Gemini API.' });
        }
        const responseData = JSON.parse(data);
        const title = responseData.candidates[0].content.parts[0].text;
        res.status(200).json({ title: title.trim() });
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
        res.status(500).json({ error: 'Could not parse Gemini response.' });
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('Error with API request:', e);
    res.status(500).json({ error: 'Failed to make API request.' });
  });

  apiReq.write(postData);
  apiReq.end();
}; 

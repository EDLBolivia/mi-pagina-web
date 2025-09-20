// Este es el único archivo que necesita usar 'require' porque está en el servidor.
const fetch = require('node-fetch');

// Esta función es el "motor" que se ejecuta en el servidor.
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

  try {
    // 1. Obtiene la clave secreta de Vercel.
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      console.error("ERROR: La variable API_KEY no está definida en Vercel.");
      return res.status(500).json({ error: 'Error de configuración del servidor: Falta la clave de API.' });
    }

    // 2. Obtiene los datos del formulario que envió el usuario.
    const { documentType, area, topic, focus, objective, company } = req.body;
    if (!documentType || !area || !topic || !focus || !objective) {
      return res.status(400).json({ error: 'Faltan campos requeridos del formulario.' });
    }

    // 3. Crea el prompt para la IA.
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

    // 4. Prepara la solicitud para enviarla a Google.
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    // 5. Envía la solicitud y espera la respuesta.
    const apiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const responseData = await apiResponse.json();

    // 6. Revisa si la respuesta de la IA es válida y tiene contenido.
    if (!apiResponse.ok || !responseData.candidates || responseData.candidates.length === 0 || !responseData.candidates[0].content) {
      console.error('Respuesta inválida de la API de Gemini:', JSON.stringify(responseData));
      return res.status(500).json({ error: 'La IA no pudo generar una respuesta. Esto puede ser por un problema de seguridad o una solicitud inválida.' });
    }
    
    // 7. Extrae el título y envíalo de vuelta al navegador del usuario.
    const title = responseData.candidates[0].content.parts[0].text;
    res.status(200).json({ title: title.trim() });

  } catch (error) {
    // Esto atrapará cualquier otro error inesperado.
    console.error('Error inesperado en la función del servidor:', error);
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
};

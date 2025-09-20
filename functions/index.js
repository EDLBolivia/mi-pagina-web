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

  // Obtiene la clave secreta de Vercel.
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'La clave de API no está configurada en el servidor.' });
  }

  const { documentType, area, topic, focus, objective, company } = req.body;

  // Validación de que todos los campos llegaron.
  if (!documentType || !area || !topic || !focus || !objective) {
    return res.status(400).json({ error: 'Faltan campos requeridos en la solicitud.' });
  }

  const prompt = `
      **Your Role & Goal:**
      You are an expert thesis advisor for 'Escuela de Líderes - Bolivia'. Your goal is to generate a professional, impactful, and methodologically sound academic title. Analyze the user's input deeply, don't just combine keywords. The user is in Bolivia.

      **Title Quality Rules (Apply Rigorously):**
      1.  **Eliminate Spatial Delimitation (by default):** DO NOT include a location (e.g., Bolivia, La Paz) unless the research topic is intrinsically tied to a specific geography (e.g., a local law, a specific ecosystem). If the user provides a company for a 'Proyecto de Grado', that is the only exception where a specific entity is named. For most general topics, the title should be universally applicable.
      2.  **Professional & Concise Language:** Use precise, academic language appropriate for the field. The title must be direct and assertive.
      3.  **Balance Simplicity & Complexity:** The title must be easily understood but also reflect academic rigor.

      **Methodological Structure (Arias & Sampieri):**
      The final title must clearly articulate:
      - **The What:** The core phenomenon or problem.
      - **The Who/Where:** The object of study or unit of analysis.
      - **The For What:** The research's primary goal (e.g., analyze, design, propose, evaluate).

      **Example of Your Thought Process (Applying New Rules):**
      *   **User Input:** Problem: "Uso de la Inteligencia Artificial en el marketing", Focus: "Tiendas virtuales", Objective: "Diseñar un modelo de gestión".
      *   **Your Analysis:** A literal combination like "Diseño de un modelo de gestión de ventas con IA para tiendas virtuales en Bolivia" is weak. First, I must remove "en Bolivia" as it's not necessary. Second, "gestión de ventas" can be more professional. "Modelo de gestión comercial" is better. Let's integrate "Inteligencia Artificial" more elegantly.
      *   **Improved Title:** "Diseño de un modelo de gestión comercial potenciado con Inteligencia Artificial para el desarrollo de tiendas virtuales."

      **Strict Output Rules:**
      1.  **Geo-context:** Assume the context is Bolivia for cultural and legal nuances, but DO NOT mention "Bolivia" or any city in the title unless absolutely necessary (as explained in the quality rules).
      2.  **Normative Analysis (for Law):** If the area is 'Derecho', the title must reflect an awareness of the Bolivian legal framework, but again, without explicitly naming the country.
      3.  **Length Constraint:** The final title MUST NOT exceed 20 words. EXCLUDE these connectors from the count: "y", "de", "del", "al", "el", "la", "los", "las", "un", "una", "unos", "unas", "en", "con", "para", "por", "que", "se", "o".
      4.  **Project-specific Logic:** If the Document Type is 'Proyecto de Grado' and a company/place is mentioned, you MUST incorporate it into the title.
      5.  **Final Output Format:** Your response must be ONLY the generated title text. No introductions, explanations, or quotes. Just the title.

      **User's Input:**
      - Document Type: ${documentType}
      - Area of Study: ${area}
      - Topic/Problem: ${topic}
      - Research Focus (Population/Object): ${focus}
      - Main Objective: ${objective}
      - Specific Company/Place (for 'Proyecto de Grado'): ${company || 'N/A'}

      **Generate the Final Title Now.**
  `;

  try {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    const requestBody = {
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
    };

    const apiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      console.error('Error from Gemini API:', errorBody);
      throw new Error('La respuesta de la API de Gemini no fue exitosa.');
    }

    const responseData = await apiResponse.json();
    const title = responseData.candidates[0].content.parts[0].text;
    
    res.status(200).json({ title: title.trim() });

  } catch (error) {
    console.error("Error al generar el título en el backend:", error);
    res.status(500).json({ error: "No se pudo generar el título desde el modelo de IA." });
  }
};

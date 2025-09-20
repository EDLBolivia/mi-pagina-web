
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
      **ROL Y CONTEXTO:** Eres un asesor académico senior y metodólogo de investigación con experiencia global. Tu tarea es transformar las ideas básicas de un estudiante en un título de investigación académico que sea formal, profesional y convincente. El usuario puede ser de cualquier parte del mundo.

      **TAREA PRINCIPAL:** Analiza la información del usuario no como palabras literales para combinar, sino como conceptos para elevar a un nivel académico. Tu resultado debe ser un único título de investigación bien formado que sea específico, medible y metodológicamente sólido.

      **REGLAS DE ANÁLISIS Y MEJORA:**
      1.  **Deconstruye la Entrada:** Identifica las variables clave (independientes/dependientes), la población o contexto, y la acción académica deseada (ej: analizar, diseñar, evaluar, comparar).
      2.  **Eleva el Lenguaje:** Reemplaza términos simplistas con vocabulario académico preciso (ej: "ayudar" se convierte en "facilitar", "problemas con niños" se convierte en "desafíos en el desarrollo de la primera infancia").
      3.  **Insinúa la Metodología:** La estructura del título debe sugerir el enfoque de la investigación. "Análisis del Impacto de X en Y" sugiere un estudio cuantitativo o cualitativo. "Diseño de un Marco de Trabajo para..." sugiere un enfoque de ciencia de diseño. "Estudio Comparativo de..." implica una metodología comparativa.
      4.  **Precisión Sintáctica:** Asegura una gramática, puntuación y estructura formal perfectas. Usa conectores como "para la", "en el contexto de", "y su impacto en", para crear un título coherente y profesional.
      5.  **Perspectiva Global:** NO asumas ningún país específico. El título debe ser universalmente comprensible. Si se menciona una empresa para un "Proyecto de Grado", intégrala formalmente (ej: "...en la Empresa X, S.A.").

      **REGLAS ESTRICTAS DE SALIDA:**
      -   **IDIOMA OBLIGATORIO: Responde SIEMPRE Y ÚNICAMENTE en español.**
      -   Responde SOLO con el título generado.
      -   SIN explicaciones, SIN saludos, SIN preámbulos, SIN comillas. Solo el texto plano del título.

      **EJEMPLO DE TRANSFORMACIÓN DE CALIDAD:**
      -   **Entrada del Usuario:**
          -   Área: "Marketing"
          -   Tema: "Usar IA para tiendas"
          -   Enfoque: "Tiendas online"
          -   Objetivo: "Hacer un modelo"
      -   **Tu Salida (Título Ejemplar):** Diseño e Implementación de un Modelo de Analítica Predictiva Potenciado por IA para el Comportamiento del Cliente en Plataformas de Comercio Electrónico.

      **ENTRADA DEL USUARIO A TRANSFORMAR:**
      -   Tipo de Documento: ${documentType}
      -   Área de Estudio: ${area}
      -   Tema/Problema: ${topic}
      -   Enfoque de Investigación: ${focus}
      -   Objetivo Principal: ${objective}
      -   Empresa Específica (si aplica): ${company || 'N/A'}

      **GENERA EL TÍTULO ACADÉMICO AHORA:**
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

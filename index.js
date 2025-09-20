// ESTA ES LA VERSIÓN FINAL Y CORRECTA DE LA PÁGINA PRINCIPAL
async function generateTitle(documentType, area, topic, focus, objective, company) {
    setLoading(true);
    const resultContainer = document.getElementById("result-content");
    if (resultContainer) resultContainer.textContent = '';
    
    try {
        const response = await fetch('/api/generateTitle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentType, area, topic, focus, objective, company }),
        });

        // INTENTA LEER LA RESPUESTA COMO JSON
        const data = await response.json();

        // SI LA RESPUESTA ES UN ERROR (como 400 o 500), USA EL MENSAJE DE ERROR DEL JSON
        if (!response.ok) {
            throw new Error(data.error || 'Ocurrió un error desconocido en el servidor.');
        }
        
        const title = data.title;
        if (resultContainer) {
            resultContainer.textContent = title;
        }

    } catch (error) {
        // SI LA RESPUESTA NO ES JSON O HAY OTRO PROBLEMA, MUESTRA UN MENSAJE GENÉRICO
        console.error("Error al generar el título:", error);
        if (resultContainer) {
            resultContainer.textContent = "Se produjo un error al generar el título. Por favor, inténtalo de nuevo.";
        }
    } finally {
        setLoading(false);
    }
}

function setLoading(loading) {
    const loader = document.getElementById("loader");
    const generateButton = document.getElementById("generate-btn");
    
    if (loader) {
        loader.style.display = loading ? "block" : "none";
    }
    
    if (generateButton) {
        generateButton.disabled = loading;
        generateButton.textContent = loading ? "Generando..." : "Generar Título";
    }
}

function App() {
    const root = document.getElementById('root');
    if (!root) return;

    root.innerHTML = `
        <header>
            <h1>ESCUELA DE LÍDERES<span>Bolivia</span></h1>
        </header>
        <main>
            <section class="card about-card" aria-labelledby="about-heading">
                <h2 id="about-heading">¡Tu éxito académico es nuestra misión!</h2>
                <p>
                    Desde nuestra fundación el 28 de febrero de 2008, la <strong class="strong-blue">Escuela de Líderes - Bolivia</strong> ha sido el aliado estratégico de cientos de estudiantes en su camino hacia la titulación. Con oficinas en La Paz y Cochabamba, contamos con un equipo de docentes universitarios especializados en un amplio abanico de disciplinas.
                </p>
                <p>
                    Somos tu apoyo en la asesoría y elaboración de <strong class="strong-green">Tesis, Proyectos de Grado, Monografías y Artículos de Investigación Científica</strong>. Nuestro compromiso es guiarte para que tu proyecto sea de excelencia, asegurando resultados que superen tus expectativas.
                </p>
                <p>
                    <strong class="strong-blue">¿Listo para dar el primer paso?</strong> Contáctanos ahora mismo por <strong class="strong-green">WhatsApp al 79115511</strong> y descubre cómo podemos ayudarte a alcanzar tu titulación en el menor tiempo posible.
                </p>
            </section>
            
            <section class="card" aria-labelledby="generator-heading">
                <h3 id="generator-heading">Define Tu Investigación en 5 Pasos Clave:</h3>
                <p class="form-intro">
                    Con los datos que nos proporciones en los siguientes pasos, te ayudaremos a estructurar un título de investigación sólido y pertinente.
                    <br><br>
                    Si en algún momento no tienes claro qué poner, no te preocupes. Simplemente escribe <strong class="strong-green">"No tengo una idea"</strong> o <strong class="strong-green">"Quiero una sugerencia"</strong> en el campo correspondiente, y nuestros expertos se encargarán de guiarte para encontrar el tema ideal para ti.
                </p>
                <form id="title-form">
                    <div class="form-group">
                        <label for="document-type">Paso 1: ¿Qué tipo de documento vas a elaborar?</label>
                        <select id="document-type" name="document-type" required>
                            <option value="" disabled selected>Selecciona un tipo de documento</option>
                            <option value="Tesis de Grado">Tesis de Grado</option>
                            <option value="Proyecto de Grado">Proyecto de Grado</option>
                            <option value="Monografía">Monografía</option>
                            <option value="Artículo de Investigación Científica">Artículo de Investigación Científica</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="area">Paso 2: ¿Cuál es tu área de estudio o disciplina principal?</label>
                        <input type="text" id="area" name="area" placeholder="Ej: Derecho, Ciencias de la Salud, Educación..." required>
                    </div>
                    <div class="form-group">
                        <label for="topic">Paso 3: ¿Qué fenómeno, problema o tema específico deseas investigar?</label>
                        <input type="text" id="topic" name="topic" placeholder="Ej: Impacto de la IA en la educación, Gestión de residuos..." required>
                    </div>
                    <div class="form-group">
                        <label for="focus">Paso 4: ¿A quiénes o a qué cosa te enfocas en tu investigación?</label>
                        <input type="text" id="focus" name="focus" placeholder="Ej: Estudiantes universitarios, microempresas del sector textil..." required>
                    </div>
                    <div class="form-group">
                        <label for="objective">Paso 5: ¿Qué objetivo principal o tipo de relación buscas establecer?</label>
                        <input type="text" id="objective" name="objective" placeholder="Ej: Analizar causas, Proponer soluciones, Evaluar efectividad..." required>
                    </div>
                    <div class="form-group hidden" id="company-group">
                        <label for="company">Paso 6 (Opcional): Si aplica, menciona la empresa o lugar específico para tu proyecto.</label>
                        <input type="text" id="company" name="company" placeholder="Ej: Banco Nacional de Bolivia, Gobierno Municipal de El Alto...">
                    </div>
                    <button type="submit" id="generate-btn">Generar Título</button>
                </form>
            </section>

            <section class="card" id="result-card" aria-live="polite">
                 <div id="loader" class="loader" role="status" aria-label="Loading title"></div>
                 <p id="result-content">El título de tu investigación aparecerá aquí...</p>
            </section>

            <a href="https://wa.link/otimvx" id="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-27.2l-4.2-2.5-72.2 18.9L92.7 351.5l-2.8-4.4c-19.6-31.8-30.4-68.2-30.4-105.7 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.8-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
                ¡Contáctanos para tu Tesis!
            </a>
            
            <a href="https://www.facebook.com/profile.php?id=10007

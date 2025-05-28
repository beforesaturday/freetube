/*
  This is your site JavaScript code - you can add interactivity!
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello 🌎");

/* 
Make the "Click me!" button move when the visitor clicks it:
- First add the button to the page by following the steps in the TODO 🚧
*/
const btn = document.querySelector("button"); // Get the button from the page
if (btn) { // Detect clicks on the button
  btn.onclick = function () {
    // The 'dipped' class in style.css changes the appearance on click
    btn.classList.toggle("dipped");
  };
}


// ----- GLITCH STARTER PROJECT HELPER CODE -----

// Open file when the link in the preview is clicked
let goto = (file, line) => {
  window.parent.postMessage(
    { type: "glitch/go-to-line", payload: { filePath: file, line: line } }, "*"
  );
};
// Get the file opening button from its class name
const filer = document.querySelectorAll(".fileopener");
filer.forEach((f) => {
  f.onclick = () => { goto(f.dataset.file, f.dataset.line); };
});


// --- NUEVA LÓGICA PARA CARGAR, ORDENAR Y MOSTRAR VIDEOS ---


// Función para ordenar videos según combo reconocido, novedad y vistas
function ordenarVideos(videos, combosReconocidos) {
  return videos.sort((a, b) => {
    const aReconocido = combosReconocidos.includes(a.combo);
    const bReconocido = combosReconocidos.includes(b.combo);

    // Videos con combo reconocido primero
    if (aReconocido && !bReconocido) return -1;
    if (!aReconocido && bReconocido) return 1;

    // Dentro de reconocidos o no reconocidos, ordenar por fecha subida (más nuevo primero)
    if (b.uploadedAt !== a.uploadedAt) {
      return b.uploadedAt - a.uploadedAt;
    }

    // Finalmente, entre videos con la misma fecha, ordenar por vistas ascendente
    return a.views - b.views;
  });
}

// Función para mostrar el tiempo desde la subida
function tiempoDesde(timestamp) {
  const ahora = Date.now();
  const diffMs = ahora - timestamp;
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const dias = Math.floor(horas / 24);
  return `${dias} días y ${horas % 24} horas`;
}

// Cargar y mostrar videos ordenados
function cargarVideos() {
  fetch("/videosData")
    .then(res => res.json())
    .then(videos => {
      // Aquí actualiza con todos los combos válidos que manejes
      const combosReconocidos = ["5F 2D j.214C", "comboEjemplo1", "comboEjemplo2"];

      const videosOrdenados = ordenarVideos(videos, combosReconocidos);

      const container = document.getElementById("videos");
      if (!container) return;

      container.innerHTML = "";

      videosOrdenados.forEach((video, index) => {
        const comboReconocido = combosReconocidos.includes(video.combo);
        const comboMostrar = comboReconocido ? video.combo : "desconocido";

        container.innerHTML += `
          <div>
            <p>Video ${index + 1}: ${video.title}</p>
            <p>Truco/Combo: ${comboMostrar}</p>
            <video width="320" controls onplay="sumarVista('${video.filename}')">
              <source src="/videos/${video.filename}" type="video/mp4">
              Tu navegador no soporta el video.
            </video>
            <p>Vistas: ${video.views}</p>
            <p>Subido hace: ${tiempoDesde(video.uploadedAt)}</p>
            <hr />
          </div>
        `;
      });
    });
}

// Función para sumar vista al video
function sumarVista(filename) {
  fetch("/view/" + filename, { method: "POST" });
}

// Ejecutar al cargar el script
cargarVideos();

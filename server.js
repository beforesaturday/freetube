const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Carpeta para subir videos
const uploadFolder = path.join(__dirname, 'videos');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Archivo para persistir datos
const dataFile = path.join(__dirname, 'videos.json');

// Cargar videos desde archivo si existe
let videos = [];
if (fs.existsSync(dataFile)) {
  try {
    const fileContent = fs.readFileSync(dataFile, 'utf-8');
    videos = JSON.parse(fileContent);
  } catch (err) {
    console.error('Error al leer videos.json:', err);
    videos = [];
  }
}

// Función para guardar videos en disco
function guardarVideos() {
  fs.writeFile(dataFile, JSON.stringify(videos, null, 2), (err) => {
    if (err) {
      console.error('Error al guardar videos.json:', err);
    }
  });
}

// Middleware para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/videos', express.static(uploadFolder));
app.use(express.static('public'));

// Ruta para subir video
app.post('/upload', upload.single('video'), (req, res) => {
  const { title, combo } = req.body;
  if (!title || !combo || !req.file) {
    return res.status(400).send('Faltan datos');
  }

  const newVideo = {
    id: videos.length + 1,
    title,
    combo: combo.trim(),
    filename: req.file.filename,
    uploadedAt: Date.now(),
    views: 0
  };

  videos.push(newVideo);
  guardarVideos(); // Persistencia
  res.status(200).json({ success: true });
});

// Ruta para obtener lista de videos
app.get('/videosData', (req, res) => {
  res.json(videos);
});

// Ruta para registrar vista
app.post('/view/:filename', (req, res) => {
  const filename = req.params.filename;
  const video = videos.find(v => v.filename === filename);
  if (video) {
    video.views++;
    guardarVideos(); // Actualizar persistencia
    res.sendStatus(200);
  } else {
    res.status(404).send('Video no encontrado');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

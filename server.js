const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configurar almacenamiento con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, name);
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Ruta para subir video
app.post('/upload', upload.single('video'), (req, res) => {
  const { title, combo, isUnderground, isTutorial } = req.body;
  const videoUrl = `/uploads/${req.file.filename}`;

  const newVideo = {
    title,
    combo,
    url: videoUrl,
    isUnderground: isUnderground === 'true',
    isTutorial: isTutorial === 'true',
    views: 0,
    date: new Date().toISOString()
  };

  const dataPath = path.join(__dirname, 'videos.json');
  let videos = [];

  if (fs.existsSync(dataPath)) {
    videos = JSON.parse(fs.readFileSync(dataPath));
  }

  videos.push(newVideo);
  fs.writeFileSync(dataPath, JSON.stringify(videos, null, 2));

  res.json({ success: true, video: newVideo });
});

// Ruta para obtener los videos
app.get('/videos', (req, res) => {
  const dataPath = path.join(__dirname, 'videos.json');

  if (fs.existsSync(dataPath)) {
    let videos = JSON.parse(fs.readFileSync(dataPath));

    // Simula aumento de visitas cada vez que se visualiza la lista
    videos = videos.map(v => ({ ...v, views: (v.views || 0) + 1 }));

    // Guardar aumento
    fs.writeFileSync(dataPath, JSON.stringify(videos, null, 2));
    res.json(videos);
  } else {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

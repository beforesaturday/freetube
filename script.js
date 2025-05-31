document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const videosDiv = document.getElementById('videos');
  const tabTutorials = document.getElementById('tabTutorials');
  const tabUnderground = document.getElementById('tabUnderground');

  let allVideos = [];
  let currentTab = 'underground';

  const loadVideos = async () => {
    const res = await fetch('/videos');
    allVideos = await res.json();
    renderVideos();
  };

  function renderVideos() {
    let filtered = allVideos;

    if (currentTab === 'tutorials') {
      filtered = filtered.filter(v => v.isTutorial);
    } else {
      filtered = filtered.filter(v => v.isUnderground);
    }

    videosDiv.innerHTML = '';
    if (filtered.length === 0) {
      videosDiv.innerHTML = '<p>No videos found.</p>';
      return;
    }

    filtered.forEach((video, index) => {
      const div = document.createElement('div');
      div.className = 'video-item';
      div.innerHTML = `
        <p><strong>Title:</strong> ${video.title}</p>
        <p><strong>Combo:</strong> ${video.combo}</p>
        <p><strong>Type:</strong> ${video.isTutorial ? 'Tutorial' : 'Underground Clip'}</p>
        <video controls src="${video.url}"></video>
        <button class="delete-button" data-index="${index}">Solicitar eliminación</button>
      `;
      videosDiv.appendChild(div);
    });
  }

  uploadForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    formData.set('isUnderground', document.getElementById('isUnderground').checked);
    formData.set('isTutorial', document.getElementById('isTutorial').checked);

    const res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      this.reset();
      loadVideos();
    }
  });

  tabTutorials.addEventListener('click', () => {
    currentTab = 'tutorials';
    tabTutorials.classList.add('active');
    tabUnderground.classList.remove('active');
    renderVideos();
  });

  tabUnderground.addEventListener('click', () => {
    currentTab = 'underground';
    tabUnderground.classList.add('active');
    tabTutorials.classList.remove('active');
    renderVideos();
  });

  // Inicializar
  tabUnderground.classList.add('active');
  loadVideos();
});

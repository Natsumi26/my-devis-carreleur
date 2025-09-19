// Au chargement → toujours prendre le thème système
let systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Appliquer le thème Bootstrap
document.documentElement.setAttribute('data-bs-theme', systemTheme);

// Synchroniser ton bouton si besoin
document.getElementById('darkMode').checked = systemTheme === 'dark';

// Bouton Dark Mode (toggle manuel)
document.getElementById('darkMode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle();
  const theme = isDarkMode ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', theme);
});

function notifier(message, title = "Notification") {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '../assets/logo_entreprise.png'
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '../assets/logo_entreprise.png'
        });
      }
    });
  }
}

//Function concernant le contextMenu et les boutons d'action--------------
const contextMenu = document.getElementById('contextmenu');
let selectedId = null;
function showContextMenu(event){
  event.preventDefault();
  
  // Cherche l'élément le plus proche avec l'attribut data-client-id
  const row = event.target.closest('[data-id]');

  if (row) {
    selectedId = row.getAttribute('data-id');
    console.log("Client ID sélectionné :", selectedId);
    // Positionne et affiche le menu
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.classList.remove('d-none');
    }
}
document.getElementById('bodyTable').addEventListener('contextmenu', function(event){
  showContextMenu(event);
})

document.addEventListener('click', function() {
  contextMenu.classList.add('d-none');
});
// GEstion des boutons pour le DArk Mode

// Au chargement de la page
let savedTheme = localStorage.getItem('theme');
console.log(savedTheme)
if (!savedTheme) {
  // Premier démarrage → on suit le thème du système
  savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  localStorage.setItem('theme', savedTheme);
  console.log(savedTheme)
}
console.log(savedTheme)
// Appliquer le thème Bootstrap
document.documentElement.setAttribute('data-bs-theme', savedTheme);

document.getElementById('darkMode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle();
  const theme = isDarkMode ? 'dark' : 'light';

  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);
});
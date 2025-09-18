async function verifierBoutonCreation() {
  const exist = await window.api.fetchAll('SELECT COUNT(*) AS total FROM entreprise');
  if (exist[0].total > 0) {
    document.getElementById('btnCreerEntreprise').style="display:none";
    document.getElementById('typeForm').value='update';
  }
}
window.addEventListener('DOMContentLoaded', verifierBoutonCreation);


document.getElementById('inputLogo').addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('previewLogo').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

//GET entreprise
async function chargerCoordonnees() {
    const result = await window.api.fetchAll('SELECT * FROM entreprise LIMIT 1');
    if (result.length === 0) return;
  
    const data = result[0];
    entrepriseId = data.id;

    const logoFullPath = await window.api.joinPath(await window.api.getUserDataPath(), 'logo_entreprise', data.logo_path);
    document.getElementById('logoEntreprise').src = logoFullPath;
    document.getElementById('nomEntreprise').textContent = data.name;
    document.getElementById('telEntreprise').textContent = data.telephone;
    document.getElementById('adresseEntreprise').textContent = data.adresse;
  }
chargerCoordonnees();

//Activer l'edition
function activerEdition() {
    document.getElementById('formEdition').style.display = 'block';
    document.getElementById('inputLogo').value = '';
    document.getElementById('inputNom').value = document.getElementById('nomEntreprise').textContent;
    document.getElementById('inputTel').value = document.getElementById('telEntreprise').textContent;
    document.getElementById('inputAdresse').value = document.getElementById('adresseEntreprise').textContent;
  }

//Créaction de l'entreprise
async function addEntreprise(){
    activerEdition()

  document.getElementById('formEdition').onsubmit = async function (e) {
    e.preventDefault();

  const fileInput = document.getElementById('inputLogo');
    const file = fileInput.files[0];
  
    let logoPath = null;

    if (file) {

      const timestamp = Date.now();
      const ext = await window.api.extname(file.name);
      const newFileName = `logo_${timestamp}${ext}`;
    
      // Dossier cible dans userData
      const userDataPath = await window.api.getUserDataPath();
      console.log('Chemin userDataPath :', userDataPath); // ← ici

      const logoDir = await window.api.joinPath(userDataPath, 'logo_entreprise');
      const destPath = await window.api.joinPath(logoDir, newFileName);
    
      // Créer le dossier s’il n’existe pas
      await window.api.ensureDir(logoDir);
    
      // Copier le fichier
      const buffer = await file.arrayBuffer();
      await window.api.writeFile(destPath, new Uint8Array(buffer));
    
      // Supprimer les anciens logos
      const files = await window.api.readdir(logoDir);
      for (const fileName of files) {
        if (fileName !== newFileName) {
          const filePath = await window.api.joinPath(logoDir, fileName);
          await window.api.unlink(filePath);
        }
      }
    
      // Stocker uniquement le nom du fichier
      logoPath = newFileName;
    }
  // Exemple de données par défaut — à adapter selon ton formulaire
  const nom = document.getElementById('inputNom').value;
  const tel = document.getElementById('inputTel').value;
  const adresse = document.getElementById('inputAdresse').value;
  const logo_path = logoPath; // ou un logo par défaut

  await window.api.eQuery(
    'INSERT INTO entreprise (name, telephone, adresse, logo_path) VALUES (?, ?, ?, ?)',
    [nom, tel, adresse, logo_path]
  );

  nom='';
  tel='';
  adresse='';
  notifier("Entreprise créée avec succès.", "Création");
  await chargerCoordonnees(); // recharge l'affichage
};
};

//Enregistrer les modifications
async function enregistrerCoordonnees(e) {
    e.preventDefault();

    const fileInput = document.getElementById('inputLogo');
    const file = fileInput.files[0];
  
    let logoPath = null;

    if (file) {

      const timestamp = Date.now();
      const ext = await window.api.extname(file.name);
      const newFileName = `logo_${timestamp}${ext}`;
    
      // Dossier cible dans userData
      const userDataPath = await window.api.getUserDataPath();
      console.log('Chemin userDataPath :', userDataPath); // ← ici

      const logoDir = await window.api.joinPath(userDataPath, 'logo_entreprise');
      const destPath = await window.api.joinPath(logoDir, newFileName);
    
      // Créer le dossier s’il n’existe pas
      await window.api.ensureDir(logoDir);
    
      // Copier le fichier
      const buffer = await file.arrayBuffer();
      await window.api.writeFile(destPath, new Uint8Array(buffer));
    
      // Supprimer les anciens logos
      const files = await window.api.readdir(logoDir);
      for (const fileName of files) {
        if (fileName !== newFileName) {
          const filePath = await window.api.joinPath(logoDir, fileName);
          await window.api.unlink(filePath);
        }
      }
    
      // Stocker uniquement le nom du fichier
      logoPath = newFileName;
    } else {
      // Aucun nouveau logo : garder l'ancien
      const entreprise = await window.api.fetchOne('SELECT logo_path FROM entreprise WHERE id = ?', [entrepriseId]);
      logoPath = entreprise[0].logo_path;
    }
  
    const nom = document.getElementById('inputNom').value;
    const tel = document.getElementById('inputTel').value;
    const adresse = document.getElementById('inputAdresse').value;
  
    await window.api.eQuery(
      'UPDATE entreprise SET name = ?, telephone = ?, adresse = ?, logo_path = ? WHERE id = ?',
      [nom, tel, adresse, logoPath, entrepriseId]
    );
    const logoFullPath = await window.api.joinPath(await window.api.getUserDataPath(), 'logo_entreprise', logoPath);
    document.getElementById('logoEntreprise').src = logoFullPath;

    document.getElementById('nomEntreprise').textContent = nom;
    document.getElementById('telEntreprise').textContent = tel;
    document.getElementById('adresseEntreprise').textContent = adresse;
    document.getElementById('formEdition').style.display = 'none';

    notifier("Les coordonnées ont été mises à jour avec succès.", "Entreprise");

  }
//Annuler les modifications
function annulerEdition() {
    document.getElementById('formEdition').style.display = 'none';
  }

//CHOISIR entre add ou update
document.getElementById('btnCreerEntreprise').onclick = async function(event) {
      event.preventDefault()
      const mode = document.getElementById('typeForm').value;
  
      if(mode === "add") {
          await addEntreprise();       // fonction qui gère l'ajout
      } else if(mode === "update") {
          const id = document.getElementById('id').value;
          await enregistrerCoordonnees();  // fonction qui gère la mise à jour
      }
  }
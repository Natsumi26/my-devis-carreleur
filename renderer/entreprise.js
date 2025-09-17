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

    document.getElementById('logoEntreprise').src = `../${data.logo_path}`;
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
//Enregistrer les modifications
async function enregistrerCoordonnees(e) {
    e.preventDefault();

    const fileInput = document.getElementById('inputLogo');
    const file = fileInput.files[0];
  
    let logoPath = null;

    if (file) {

      const timestamp = Date.now();
      const logoDir = window.api.joinPath('assets', 'logo_entreprise');
      const ext = window.api.extname(file.name);
      const newFileName = `logo_${timestamp}${ext}`;
      const destPath = window.api.joinPath('assets/logo_entreprise', newFileName);
  
      // Lire le fichier et l’écrire dans assets
      const buffer = await file.arrayBuffer();
      await window.api.writeFile(destPath, new Uint8Array(buffer));

      // Supprimer les autres fichiers du dossier
      const files = await window.api.readdir(logoDir);
      if (Array.isArray(files)) {
        for (const fileName of files) {
          if (fileName !== newFileName) {
            const filePath = window.api.joinPath(logoDir, fileName);
            await window.api.unlink(filePath);
          }
        }
      }

      logoPath = destPath;
      logoPath = logoPath.replace(/\\/g, '/');
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
    document.getElementById('logoEntreprise').src = `../${logoPath}`;
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


  
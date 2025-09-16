//GET entreprise
async function chargerCoordonnees() {
    const result = await window.api.fetchAll('SELECT * FROM entreprise LIMIT 1');
    if (result.length === 0) return;
  
    const data = result[0];
    entrepriseId = data.id;
    document.getElementById('nomEntreprise').textContent = data.name;
    document.getElementById('telEntreprise').textContent = data.telephone;
    document.getElementById('adresseEntreprise').textContent = data.adresse;
  }
chargerCoordonnees();
//Activer l'edition
function activerEdition() {
    document.getElementById('formEdition').style.display = 'block';
    document.getElementById('inputNom').value = document.getElementById('nomEntreprise').textContent;
    document.getElementById('inputTel').value = document.getElementById('telEntreprise').textContent;
    document.getElementById('inputAdresse').value = document.getElementById('adresseEntreprise').textContent;
  }
//Enregistrer les modifications
async function enregistrerCoordonnees(e) {
    e.preventDefault();
  
    const nom = document.getElementById('inputNom').value;
    const tel = document.getElementById('inputTel').value;
    const adresse = document.getElementById('inputAdresse').value;
  
    await window.api.eQuery(
      'UPDATE entreprise SET name = ?, telephone = ?, adresse = ? WHERE id = ?',
      [nom, tel, adresse, entrepriseId]
    );
  
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


  
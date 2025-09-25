//Fonction pour le search
window.Search = async function(){
    // Declare variables
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
//Function pour tri par date
const sortDirections = {};

window.sortTable = function(colIndex) {
  const table = document.getElementById("myTable");
  const rows = Array.from(table.rows).slice(1); // exclut le header
  const direction = sortDirections[colIndex] === "asc" ? "desc" : "asc";
  sortDirections[colIndex] = direction;

  rows.sort((a, b) => {
    let x = a.cells[colIndex].innerText.trim();
    let y = b.cells[colIndex].innerText.trim();

    // Si c’est une date (colonne 2)
    if (colIndex === 2) {
      x = new Date(x.split('/').reverse().join('/')).getTime();
      y = new Date(y.split('/').reverse().join('/')).getTime();
    }

    if (x === y && colIndex === 2) {
      // Comparaison secondaire sur la colonne numéro (index 1)
      const xSecondary = a.cells[1].innerText.trim();
      const ySecondary = b.cells[1].innerText.trim();
      return direction === "asc"
        ? xSecondary.localeCompare(ySecondary)
        : ySecondary.localeCompare(xSecondary);
    }

    return direction === "asc"
      ? x > y ? 1 : -1
      : x < y ? 1 : -1;
  });

  // Réinjection des lignes triées
  rows.forEach(row => table.tBodies[0].appendChild(row));

  // Mise à jour visuelle des flèches
  const headers = document.querySelectorAll("#myTable th");
  headers.forEach((th, i) => {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (i === colIndex) {
      th.classList.add(`sorted-${direction}`);
    }
  });
};



//Fonction pour afficher le PDF dans la modal
function openModalWithPDF(base64) {
    const modal = document.getElementById('factureModal');
    const iframe = document.getElementById('pdfPreview');
    iframe.src = `data:application/pdf;base64,${base64}`;
    modal.style.display = 'block';
  }
  //telecharger depuis la modal
  window.downloadPDF = function () {
    const base64 = document.getElementById('pdfPreview').src.split(',')[1];
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64}`;
    link.download = `${currentFactureNumber}.pdf`;
    link.click();
    notifier("Facture télechargée avec succès", "Factures");
  };
//Fermer la modal
  window.closeModal = function () {
    document.getElementById('factureModal').style.display = 'none';
  };

// construction des données pour le pdf
  async function buildFactureData({ facture, prestations, acomptes }){
      // Construction des données
          return {
                facture: {
                    id: facture[0].id,
                    number: facture[0].number,
                    date_facture: facture[0].date_facture,
                    total_HT: facture[0].total_HT,
                    total_TTC: facture[0].total_TTC,
                    taux_tva: facture[0].taux_tva, 
                    },
                devis: {
                    number: facture[0].devis_number,
                },
                clients: {
                    nom: facture[0].nom,
                    adresse: facture[0].adresse,
                    telephone: facture[0].telephone
                },
                facture_prestation: prestations
                .map(fp => ({
                    id: fp.fp_id,
                    prestation_id: fp.prestation_id,
                    prestation: {
                        name: fp.name,
                        pu: fp.pu
                    },
                    quantity: fp.quantity,
                    sous_total: fp.sous_total
                })),
                acomptes: acomptes
                .map(ac => ({
                    id: ac.id,
                    facture_id: ac.facture_id,
                    date_acompte: ac.date_acompte,
                    montant: ac.montant,
                    mode_payement: ac.mode_payement
                  })),
            };
    }

//Recuperation des données pour la génération des PDF

    async function getDataFactures(id) {
        const facture = await window.api.fetchAll('SELECT factures.id, factures.number, factures.date_facture, factures.total_HT, factures.total_TTC, factures.taux_tva,devis.number AS devis_number, factures.client_id AS client, clients.nom, clients.adresse, clients.telephone FROM `factures` LEFT JOIN clients ON (clients.id=factures.client_id) LEFT JOIN devis ON (devis.id=factures.devis_id) WHERE factures.id= ?', [id]);
        const prestations = await window.api.fetchAll('SELECT fp.id AS fp_id, fp.prestation_id, p.pu, p.name, fp.quantity, fp.unite, fp.sous_total FROM facture_prestation fp LEFT JOIN prestation p ON fp.prestation_id = p.id WHERE fp.facture_id = ?', [id])
        const acomptes = await window.api.fetchAll('SELECT * FROM acomptes WHERE facture_id = ?', [id])
        console.log(facture)
        console.log(prestations)
        console.log(acomptes)
        return { facture, prestations, acomptes };
    }
    async function getEntrepriseData() {
        const result = await window.api.fetchAll('SELECT * FROM entreprise');
        return result;
    }

//Generation des PDF pour téléchargement
    async function generateFacturesFromId(id) {
        const result = await getDataFactures(id);
        const entrepriseData = await getEntrepriseData();
        if(!result || result.length === 0) {
            console.error("aucune facture trouvé");
            return;
        }
        const factureData = await buildFactureData(result);
        factureData.entreprise = entrepriseData;
        const response = await window.pdfAPI.generateFacture(factureData, `${factureData.facture.number}.pdf`);
    }
    let currentFactureNumber = null;

// Fonction pour avoir les factures
async function getFactures() {
    const factures = await window.api.fetchAll("SELECT factures.id, factures.number, factures.date_facture, factures.total_HT, factures.taux_tva, factures.total_TTC, devis.number AS devis_number, clients.nom AS client_name FROM `factures` LEFT JOIN devis ON (devis.id=factures.devis_id) LEFT JOIN clients ON (clients.id=factures.client_id)");
    const tbody = document.getElementById('bodyTable');
    tbody.innerHTML='';

    factures.forEach(facture => {
        const date = new Date(facture.date_facture);
        const dateFr = date.toLocaleDateString("fr-FR");
        const row = document.createElement('tr');
        row.setAttribute('data-id', `${facture.id}`);

        row.innerHTML += `
                <td class="w-10">${facture.id}</td>
                <td class="w-20">${facture.number}</td>
                <td class="w-20">${dateFr}</td>
                <td class="w-10">${facture.total_TTC} €</td>
                <td class="w-20">${facture.devis_number}</td>
                <td class="w-20">${facture.client_name}</td>
        `;
        // Ajout de la ligne au tableau
        tbody.appendChild(row);
    });
}
getFactures();

//function bouton voir
      async function ShowFacture(id){
          const result = await getDataFactures(id);
          const entrepriseData = await getEntrepriseData();
          if (!result || result.length === 0) return;
          
            const factureData = await buildFactureData(result);
            factureData.entreprise = entrepriseData;
            const factureDataJson = JSON.parse(JSON.stringify(factureData));
            console.log(factureDataJson)
            currentFactureNumber = factureData.facture.number;
          window.factureAPI.previewFacture(factureDataJson); // Envoie au main process
        };

//Click bouton
document.addEventListener('click',async function(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');

  switch (action) {
    case 'voir':
      ShowFacture(id);
      break;
    case 'telecharger':
      await generateFacturesFromId(id)
      break;
  }

  contextMenu.classList.add('d-none'); // Masquer le menu après action
});

//supprimer une facture
    window.deleteFacture = async function(id) {
        await window.api.eQuery("DELETE FROM factures WHERE id=?", [id]);
        notifier("Facture supprimée avec succès", "Factures");
        getFactures();
    }

// 📥 Réception du PDF depuis le main process
window.factureAPI.onPreview((base64) => {
    openModalWithPDF(base64);
});

//------------function addEvent ---------------

document.getElementById('addEventModal').addEventListener('show.bs.modal', async function (event) {
  const trigger = event.relatedTarget;
  const id = trigger.getAttribute('data-id');
  const result = await window.api.fetchOne(`SELECT client_id FROM factures WHERE id=?`, [id])
  const client = result[0].client_id;
  document.getElementById('factureId').value = id;
  document.getElementById('clientIdHidden').value = client;

});


// Function addEvent
async function addEvent(){
  const id = document.getElementById('factureId').value;
  const client = document.getElementById('clientIdHidden').value;
  const dateStart = document.getElementById('dateStart').value;
  const dateEnd = document.getElementById('dateEnd').value;
  const titre = document.getElementById('titre').value;


  await window.api.eQuery("INSERT INTO planning (start_date, end_date, description, clients_id, facture_id) VALUES (?, ?, ?, ?, ?)", 
    [dateStart, dateEnd, titre, client, id]);
    notifier("Planning créé avec succès pour la facture" + id, "Planning");

  // Réinitialiser le formulaire
  document.getElementById('addEventForm').reset();

  // Fermer la modal
  const modalEl = document.getElementById('addEventModal');
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance.hide();
}
document.getElementById('addEventForm').addEventListener('submit', function (e) {
  e.preventDefault();
  addEvent();
});

//-------------get Planning------------
const resultPlanning = window.api.fetchAll(`SELECT * FROM planning`)
    console.log(resultPlanning)


//------------function addAcompte ---------------

document.getElementById('addAcompteModal').addEventListener('show.bs.modal', function (event) {
  const trigger = event.relatedTarget;
  const id = trigger.getAttribute('data-id');
  document.getElementById('factureIdHidden').value = id;
  console.log(id)
});


// Function addAcompte
async function addAcompte(){
  const id = document.getElementById('factureIdHidden').value;
  const date = document.getElementById('dateAcompte').value;
  const montant = document.getElementById('montantAcompte').value;
  const modePayement = document.getElementById('modePayement').value;
  console.log(id)

  await window.api.eQuery("INSERT INTO acomptes (date_acompte, montant, mode_payement, facture_id) VALUES (?, ?, ?, ?)", 
    [date, montant, modePayement, id]);
    notifier("Acompte créé avec succès pour la facture" + id, "Acompte");

  // Réinitialiser le formulaire
  document.getElementById('addAcompteForm').reset();

  // Fermer la modal
  const modalEl = document.getElementById('addAcompteModal');
  const modalInstance = bootstrap.Modal.getInstance(modalEl);
  modalInstance.hide();
}
document.getElementById('addAcompteForm').addEventListener('submit', function (e) {
  e.preventDefault();
  addAcompte();
});

//-------------get Acompte------------
const resultAcomptes = window.api.fetchAll(`SELECT * FROM acomptes`)
    console.log(resultAcomptes)
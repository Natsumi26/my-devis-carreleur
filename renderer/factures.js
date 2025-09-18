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
  async function buildFactureData(result){
      // Construction des données
          return {
                facture: {
                    id: result[0].id,
                    number: result[0].number,
                    date_facture: result[0].date_facture,
                    total_HT: result[0].total_HT,
                    total_TTC: result[0].total_TTC,
                    taux_tva: result[0].taux_tva, 
                    },
                devis: {
                    number: result[0].devis_number,
                },
                clients: {
                    nom: result[0].nom,
                    adresse: result[0].adresse,
                    telephone: result[0].telephone
                },
                facture_prestation: result
                .filter(r => r.fp_id !== null)
                .map(r => ({
                    id: r.fp_id,
                    prestation_id: r.prestation_id,
                    prestation: {
                        name: r.name,
                        pu: r.pu
                    },
                    quantity: r.quantity,
                    sous_total: r.sous_total
                }))
            };
    }

//Recuperation des données pour la génération des PDF

    async function getDataFactures(id) {
        const result = await window.api.fetchAll('SELECT factures.id, factures.number, factures.date_facture, factures.total_HT, factures.total_TTC, factures.taux_tva,devis.number AS devis_number, factures.client_id AS client, clients.nom, clients.adresse, clients.telephone, prestation.pu, prestation.name, prestation.id AS prestation_id, facture_prestation.id AS fp_id, facture_prestation.quantity, prestation.pu, facture_prestation.sous_total FROM `factures` LEFT JOIN clients ON (clients.id=factures.client_id) LEFT JOIN facture_prestation ON (factures.id=facture_prestation.facture_id) LEFT JOIN prestation ON (prestation.id=facture_prestation.prestation_id) LEFT JOIN devis ON (devis.id=factures.devis_id) WHERE factures.id= ?', [id]);
        
        return result;
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
    const tbody = document.getElementById('facturesTable');
    tbody.innerHTML='';

    factures.forEach(facture => {
        const date = new Date(facture.date_facture);
        const dateFr = date.toLocaleDateString("fr-FR");
        const row = document.createElement('tr');

        row.innerHTML += `
                <td>${facture.id}</td>
                <td>${facture.number}</td>
                <td>${dateFr}</td>
                <td>${facture.total_TTC} €</td>
                <td>${facture.devis_number}</td>
                <td>${facture.client_name}</td>
                <td>
                    <button class="btn btn-sm btn-outline-warning me-4" id="voir-${facture.id}"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-success me-4" id="telecharger-${facture.id}"><i class="bi bi-download"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFacture(${facture.id})"><i class="bi bi-trash3"></i></button>
                    </td>
        `;
        // Ajout de la ligne au tableau
        tbody.appendChild(row);
        // Bouton Voir
        document.getElementById(`voir-${facture.id}`).addEventListener('click', async () => {
          const result = await getDataFactures(facture.id);
          const entrepriseData = await getEntrepriseData();
          if (!result || result.length === 0) return;
      
            const factureData = await buildFactureData(result);
            factureData.entreprise = entrepriseData;
            const factureDataJson = JSON.parse(JSON.stringify(factureData));

            currentFactureNumber = factureData.facture.number;
          window.factureAPI.previewFacture(factureDataJson); // Envoie au main process
        });
        // Bouton Télécharger
        document.getElementById(`telecharger-${facture.id}`).addEventListener('click', async () => await generateFacturesFromId(facture.id));
    });
}
getFactures();

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



    
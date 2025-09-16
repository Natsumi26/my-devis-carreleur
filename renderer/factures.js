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
                statue: result[0].statue
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
// Fonction pour avoir les factures
async function getFactures() {
    const factures = await window.api.fetchAll("SELECT factures.id, factures.number, factures.date_facture, factures.total_HT, factures.taux_tva, factures.total_TTC, devis.number AS devis_number, clients.nom AS client_name FROM `factures` LEFT JOIN devis ON (devis.id=factures.devis_id) LEFT JOIN clients ON (clients.id=factures.client_id)");
    console.log(factures);

    const tbody = document.getElementById('facturesTable');
    tbody.innerHTML='';
    factures.forEach(facture => {
        const row = document.createElement('tr');

        row.innerHTML += `
                <td>${facture.id}</td>
                <td>${facture.number}</td>
                <td>${facture.date_facture}</td>
                <td>${facture.total_TTC}</td>
                <td>${facture.devis_number}</td>
                <td>${facture.client_name}</td>
                <td>
                <button class="btn btn-sm btn-primary me-1" id="voir-${facture.id}"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-success me-1" id="telecharger-${facture.id}"><i class="bi bi-download"></i></button>

                </td>
        `;
        // Ajout de la ligne au tableau
        tbody.appendChild(row);
        // Bouton Voir
        document.getElementById(`voir-${facture.id}`).addEventListener('click', async () => {
          const result = await getDataFactures(facture.id);
          if (!result || result.length === 0) return;
      
          const factureData = buildFactureData(result);
          window.factureAPI.voirFacture(factureData); // Appel via preload
        });
        // Bouton Télécharger
        document.getElementById(`telecharger-${facture.id}`).addEventListener('click', async () => await generateFacturesFromId(facture.id));
    });
}
getFactures();

//Recuperation des données pour la génération des PDF

    async function getDataFactures(id) {
        const result = await window.api.fetchAll('SELECT factures.id, factures.number, factures.date_facture, factures.total_HT, factures.total_TTC, factures.taux_tva,devis.number AS devis_number, factures.client_id AS client, clients.nom, clients.adresse, clients.telephone, prestation.pu, prestation.name, prestation.id AS prestation_id, facture_prestation.id AS fp_id, facture_prestation.quantity, prestation.pu, facture_prestation.sous_total FROM `factures` LEFT JOIN clients ON (clients.id=factures.client_id) LEFT JOIN facture_prestation ON (factures.id=facture_prestation.facture_id) LEFT JOIN prestation ON (prestation.id=facture_prestation.prestation_id) LEFT JOIN devis ON (devis.id=factures.devis_id) WHERE factures.id= ?', [id]);
        return result;
    }

//Generation des PDF pour téléchargement
    async function generateFacturesFromId(id) {
        const result = await getDataFactures(id);
        if(!result || result.length === 0) {
            console.error("aucune facture trouvé");
            return;
        }
        const factureData = await buildFactureData(result);
        
        const response = await window.pdfAPI.generateFacture(factureData, `${factureData.facture.number}.pdf`);
    if(response.success) {
        console.log(`Facture sauvegardé : ${response.path}`);
    }

    }

    
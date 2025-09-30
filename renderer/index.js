
// gestion des données se trouvant sur le dashbord

//fetch du total facturer par mois
async function getFacturationMensuelle() {
    const result = await window.api.fetchAll(`
      SELECT 
        strftime('%Y-%m', date_facture) AS mois,
        SUM(total_TTC) AS total_mensuel
      FROM factures
      GROUP BY mois
      ORDER BY mois ASC
    `);
    return result;
    
  }

  //fetch du total des devis par mois
async function getDevisMensuelle() {
    const result = await window.api.fetchAll(`
      SELECT 
        strftime('%Y-%m', date_devis) AS mois,
        SUM(total_TTC) AS total_devis
      FROM devis
      GROUP BY mois
      ORDER BY mois ASC
    `);
    return result;
    
  }


//fetch devis en attente
async function getDevisAttente() {
    const result = await window.api.fetchAll(`
        SELECT COUNT(*) AS nb
        FROM devis
        WHERE statut="En attente"
      `);
      return result[0].nb;
}

async function nbDevisAttente(){
    const nb = await getDevisAttente();
document.getElementById('devis-attente').textContent=nb;
}
nbDevisAttente()

//fetch Nbr de Clients
async function getNbrClients(){
    const result = await window.api.fetchAll(
        `SELECT COUNT(*) AS nb
        FROM clients
        `);
        return result[0].nb;
}
async function nbClients(){
    const nb = await getNbrClients();
    document.getElementById('clients-actifs').textContent=nb
}
nbClients();

//fetch sur la facturation du mois en cours
async function getFactureMois(){
    const result = await window.api.fetchAll(`
        SELECT SUM(total_TTC) AS total_mois
        FROM factures
        WHERE strftime('%Y-%m', date_facture) = strftime('%Y-%m', 'now')
        `);
        return result[0].total_mois ?? 0;
}
async function afficherFacturationMois() {
    const total = await getFactureMois();
    document.getElementById('montant-facture').textContent = total + ' €';
  }
  
  afficherFacturationMois();

  //fetch sur devis du mois en cours
async function getDevisMois(){
    const result = await window.api.fetchAll(`
        SELECT SUM(total_TTC) AS total_mois
        FROM devis
        WHERE strftime('%Y-%m', date_devis) = strftime('%Y-%m', 'now')
        `);
        return result[0].total_mois ?? 0;
}
async function afficherDevisMois() {
    const total = await getDevisMois();
    document.getElementById('montant-devis').textContent = total + ' €';
  }
  
  afficherDevisMois();


//chart.js---------------------

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

async function renderFacturationChart() {
  const factures = await getFacturationMensuelle(); // { mois, total_mensuel }
  console.log(factures)
  const devis = await getDevisMensuelle(); // { mois, total_devis }
  console.log(devis)
  
  const tousLesMois = [...new Set([
    ...factures.map(f => f.mois),
    ...devis.map(d => d.mois)
  ])].sort();
  console.log(tousLesMois)

  const labels = tousLesMois.map(mois => {
    const date = new Date(mois);
    const moisFr = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date);
    return capitalizeFirstLetter(moisFr);
  });
  console.log(labels)

  const dataFactures = tousLesMois.map(mois => {
    const f = factures.find(f => f.mois === mois);
    return f ? f.total_mensuel : 0;
  });
  console.log(dataFactures)

  const dataDevis = tousLesMois.map(mois => {
    const d = devis.find(d => d.mois === mois);
    return d ? d.total_devis : 0;
  });
  console.log(dataDevis)

    const ctx = document.getElementById('chartCA').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
              {
                label: 'Facturation mensuelle (€)',
                data: dataFactures,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
              label: 'Montant des devis (€)',
              data: dataDevis,
              backgroundColor: 'rgba(255, 206, 86, 0.7)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
          },
          ]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}
renderFacturationChart()
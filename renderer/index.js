
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

//fetch devis en attente
async function getDevisAttente() {
    const result = await window.api.fetchAll(`
        SELECT COUNT(*) AS nb
        FROM devis
        WHERE statue="En attente"
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
    console.log("Facturation du mois en cours :", total);
  }
  
  afficherFacturationMois();

//chart.js
async function renderFacturationChart() {
    const data = await getFacturationMensuelle();
  
    const labels = data.map(row => row.mois);
    const values = data.map(row => row.total_mensuel);

    const ctx = document.getElementById('chartCA').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Facturation mensuelle (€)',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}
renderFacturationChart()
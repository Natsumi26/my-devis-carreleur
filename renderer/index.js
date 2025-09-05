
// gestion des données se trouvant sur le dashbord
//fetch du total facturer par mois



//chart.js
const ctx = document.getElementById('chartCA').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
        datasets: [{
            label: 'Montant facturé (€)',
            data: [5000, 8000, 12000, 7000, 15000, 11000, 9000],
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
function openAddEventModal(date = null) {
    const modal = document.getElementById('addEventModal');
    modal.style.display = 'block';
    getFacture()
    if (date) {
        const inputDate = document.getElementById('dateStart');
        if (inputDate) inputDate.value = date;
    }
}

function closeAddEventModal() {
    const modal = document.getElementById('addEventModal');
    modal.style.display = 'none';
}  
//Remplir le select pour la facture
async function getFacture(){
    const factures = await window.api.fetchAll(`SELECT factures.id, factures.date_facture, factures.client_id, clients.nom FROM factures LEFT JOIN clients ON factures.client_id= clients.id `)
    console.log(factures)
    const inputClient = document.getElementById('clientIdHidden')
    const selectFacture = document.getElementById('factureId')
    selectFacture.innerHTML='';
    factures.forEach(facture => {
        const date = new Date(facture.date_facture);
        const dateFr = new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
            }).format(date);
        selectFacture.innerHTML += `
            <option value="${facture.id}">${dateFr} ${facture.nom} </option>
        `
    });
    selectFacture.onchange = () => {
        const selectedId = selectFacture.value;
        const selectedFacture = factures.find(f => f.id == selectedId);
        inputClient.value = selectedFacture?.client_id || '';
      };

      // Déclencher une mise à jour immédiate si une facture est déjà sélectionnée
    selectFacture.dispatchEvent(new Event('change'));

}
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

}

document.getElementById('addEventForm').addEventListener('submit', function () {
    addEvent();
    closeAddEventModal()
  });
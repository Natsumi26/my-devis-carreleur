function openAddEventModal(date = null) {
    enableFormFields()
    const modal = document.getElementById('addEventModal');
    modal.style.display = 'block';
    const savebtn = document.getElementById('saveBtn');
    savebtn.style.display = 'none';
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
    
    const factureId  = document.getElementById('factureId').value;
    const client = document.getElementById('clientIdHidden').value;
    const dateStart = document.getElementById('dateStart').value;
    const hourStart = document.getElementById('hourStart').value;
    const dateEnd = document.getElementById('dateEnd').value;
    const hourEnd = document.getElementById('hourEnd').value;
    const titre = document.getElementById('titre').value;
    const description = document.getElementById('description').value;
        // INSERT
        await window.api.eQuery("INSERT INTO planning (start_date, start_hour, end_date,end_hour, title, description, clients_id, facture_id) VALUES (?,?,?, ?, ?, ?, ?, ?)", 
        [dateStart,hourStart, dateEnd,hourEnd, titre, description, client, factureId ]);
        notifier("Planning créé avec succès pour la facture" + factureId, "Planning");
    document.getElementById('addEventForm').reset();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addEventModal')).hide();
  }

document.getElementById('addEventForm').addEventListener('submit', function () {
    addEvent();
    closeAddEventModal()
  });
 
//Fonction show
function showEventInModal(event) {
    const addEvent = document.getElementById('addEvent');
    addEvent.style.display = 'none';
    console.log('getFacture() appelé');
    getFacture()
    const modalEl = document.getElementById('addEventModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  
    // Remplir les champs
    const endDate = event.endStr || event.startStr;
    document.getElementById('eventIdHidden').value = event.id;
    document.getElementById('dateStart').value = event.startStr;
    document.getElementById('hourStart').value = event.extendedProps.start_hour;
    document.getElementById('dateEnd').value = endDate;
    document.getElementById('hourEnd').value = event.extendedProps.end_hour;
    document.getElementById('titre').value = event.title;
    document.getElementById('description').value = event.extendedProps.description;
    document.getElementById('factureId').value = event.extendedProps.facture_id || '';
    document.getElementById('clientIdHidden').value = event.extendedProps.clients_id || '';
  
    disableFormFields(); // ← mode lecture par défaut
    // Afficher la modal
    modalInstance.show();
  }

//Fonction active les champs du form
function enableFormFields() {
document.querySelectorAll('#addEventForm input, #addEventForm select').forEach(el => {
    el.disabled = false;
});
document.getElementById('editBtn').style.display = 'none';
document.getElementById('saveBtn').style.display = 'inline-block';
} 

//Fonction desactive les champs du form
function disableFormFields() {
document.querySelectorAll('#addEventForm input, #addEventForm select').forEach(el => {
    el.disabled = true;
});
document.getElementById('editBtn').style.display = 'inline-block';
document.getElementById('saveBtn').style.display = 'none';
}

// Evenement des boutons
document.getElementById('editBtn').addEventListener('click', enableFormFields);
document.getElementById('saveBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await updateEvent(); // ta fonction d’update
});

//Fonction update event
async function updateEvent(){
    const id = document.getElementById('eventIdHidden').value;
    const factureId  = document.getElementById('factureId').value;
    const client = document.getElementById('clientIdHidden').value;
    const dateStart = document.getElementById('dateStart').value;
    const hourStart = document.getElementById('hourStart').value;
    const dateEnd = document.getElementById('dateEnd').value;
    const hourEnd = document.getElementById('hourEnd').value;
    const titre = document.getElementById('titre').value;
    const description = document.getElementById('description').value;
    // UPDATE
    await window.api.eQuery(
        "UPDATE planning SET start_date = ?, start_hour=?, end_date = ?, end_hour=?, title=?, description = ?, clients_id = ?, facture_id = ? WHERE id = ?",
        [dateStart,hourStart, dateEnd,hourEnd, titre, description, client, factureId, id]
    );
    notifier("Événement mis à jour", "Planning");

    document.getElementById('addEventForm').reset();
    document.getElementById('eventIdHidden').value = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('addEventModal')).hide();
  }
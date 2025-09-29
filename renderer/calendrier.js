function openAddEventModal(date = null) {
    enableFormFields()
    const modal = document.getElementById('addEventModal');
    modal.style.display = 'block';
    const savebtn = document.getElementById('saveBtn');
    savebtn.style.display = 'none';
    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn.style.display = 'none';
    const addbtn = document.getElementById('addEvent');
    addbtn.style.display = 'block';
    getDevis()
    if (date) {
        const inputDate = document.getElementById('dateStart');
        if (inputDate) inputDate.value = date;
    }
}

function closeAddEventModal() {
    const modal = document.getElementById('addEventModal');
    modal.style.display = 'none';
}  
//Remplir le select pour le devis
async function getDevis(){
    const devis = await window.api.fetchAll(`SELECT devis.id, devis.date_devis, devis.client_id, clients.nom FROM devis LEFT JOIN clients ON devis.client_id= clients.id `)
    console.log(devis)
    const selectDevis = document.getElementById('devisId')
        // Supprimer toutes les options sauf la première
    while (selectDevis.options.length > 1) {
    selectDevis.remove(1);
    }
    devis.forEach(d => {
        const date = new Date(d.date_devis);
        const dateFr = new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
            }).format(date);

            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = `${dateFr} ${d.nom}`;
            selectDevis.appendChild(option);
    });
    return devis;

}
// Function addEvent
async function addEvent(){
    const selectEl = document.getElementById('devisId');

    const devisId  = (selectEl && selectEl.value !== '') ? selectEl.value : null;
    console.log(devisId)
    const dateStart = document.getElementById('dateStart').value;
    const hourStart = document.getElementById('hourStart').value;
    const dateEnd = document.getElementById('dateEnd').value;
    const hourEnd = document.getElementById('hourEnd').value;
    const titre = document.getElementById('titre').value;
    const description = document.getElementById('description').value;
        // INSERT
        await window.api.eQuery("INSERT INTO events (start_date, start_hour, end_date, end_hour, title, description, devis_id) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [dateStart, hourStart, dateEnd, hourEnd, titre, description, devisId ]);
        notifier("Events créé avec succès" + (devisId ? " pour le devis " + devisId : " sans devis"), "Events");
    document.getElementById('addEventForm').reset();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('addEventModal')).hide();
  }

document.getElementById('addEventForm').addEventListener('submit', function () {
    addEvent();
    closeAddEventModal()
  });
//Recuperer les heures dans la date
function formatHour(dateObj) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

//Date format google
function formatDateForGoogle(dateObj) {
    return dateObj.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

//Fonction show
async function showEventInModal(event) {
    const addEvent = document.getElementById('addEvent');
    addEvent.style.display = 'none';
    console.log('getDevis() appelé');
    await getDevis()
    const modalEl = document.getElementById('addEventModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);

    // Extraire date et heure
    const startDate = event.start.toISOString().split('T')[0]; // "2025-09-01"
    const endDate = event.end ? event.end.toISOString().split('T')[0] : startDate;
    const startHour = formatHour(event.start); // "00:01"
    const endHour = event.end ? formatHour(event.end) : '';

    // Remplir les champs
    document.getElementById('eventIdHidden').value = event.id;
    document.getElementById('dateStart').value = startDate;
    document.getElementById('hourStart').value = startHour;
    document.getElementById('dateEnd').value = endDate;
    document.getElementById('hourEnd').value = endHour;
    document.getElementById('titre').value = event.title;
    document.getElementById('description').value = event.extendedProps.description;
    document.getElementById('devisId').value = event.extendedProps.devis_id || '';
  
    document.getElementById('deleteBtn').setAttribute('data-event-id', event.id);

    // 🔗 Générer le lien Google Agenda
    const startGoogle = formatDateForGoogle(event.start);
    const endGoogle = formatDateForGoogle(event.end || event.start);
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.extendedProps.description || '');
    const googleLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startGoogle}/${endGoogle}&details=${description}&sf=true&output=xml`;

    document.getElementById('googleCalendarLink').href = googleLink;
    
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
    const devisId  = document.getElementById('devisId').value;
    const dateStart = document.getElementById('dateStart').value;
    const hourStart = document.getElementById('hourStart').value;
    const dateEnd = document.getElementById('dateEnd').value;
    const hourEnd = document.getElementById('hourEnd').value;
    const titre = document.getElementById('titre').value;
    const description = document.getElementById('description').value;
    // UPDATE
    await window.api.eQuery(
        "UPDATE events SET start_date = ?, start_hour=?, end_date = ?, end_hour=?, title=?, description = ?, devis_id = ? WHERE id = ?",
        [dateStart,hourStart, dateEnd,hourEnd, titre, description, devisId, id]
    );
    notifier("Événement mis à jour", "events");

    document.getElementById('addEventForm').reset();
    document.getElementById('eventIdHidden').value = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('addEventModal')).hide();
  }

  //Supprimer un event
document.getElementById('deleteBtn').addEventListener('click', async function(){
    const eventId =  this.getAttribute('data-event-id');
    
    await window.api.eQuery("DELETE FROM events WHERE id=?", [eventId]);
    // Rafraîchir la page
    location.reload();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('addEventModal')).hide();
})
//------------------------Export avec google agenda-------------------------------------
function createGoogleCalendarLink(event) {
    const formatDateForGoogle = (dateObj) => {
      return dateObj.toISOString().replace(/[-:]|\.\d{3}/g, '');
    };
  
    const start = formatDateForGoogle(event.start); // ex: 20250901T000100Z
    const end = formatDateForGoogle(event.end || event.start);
  
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.extendedProps.description || '');
    const location = encodeURIComponent(''); // ← tu peux ajouter une adresse ici
  
    const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}&sf=true&output=xml`;
  
    return link;
  }
  

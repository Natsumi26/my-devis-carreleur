window.addEventListener('DOMContentLoaded', () => {


    
document.getElementById('addClientModal').addEventListener('show.bs.modal', () => {
    addClientForm.reset();
});

async function getClients() {
    const clients = await window.api.fetchAll("SELECT * FROM clients");
    console.log(clients)
    const tbody = document.getElementById('clientsTable')
    tbody.innerHTML='';
    clients.forEach(client => {
        tbody.innerHTML +=`
            <tr>
                <td>${client.id}</td>
                <td>${client.nom}</td>
                <td>${client.telephone}</td>
                <td>${client.email}</td>
                <td>${client.adresse}</td>
                <td>
                    <button data-bs-toggle="modal" data-bs-target="#addClientModal" class="btn btn-sm btn-outline-primary me-4" onclick="updateClient(${client.id}, this)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteClient(${client.id})"><i class="bi bi-trash3"></i></button>
                </td>
            </tr>
        `;
    });
}
getClients();

//ajouter un client

async function addClient() {
    const client = {
        nom: document.getElementById('nom').value,
        telephone: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        adresse: document.getElementById('adresse').value,
    };
    // Convertir l'objet en tableau dans le bon ordre
    const values = [client.nom, client.telephone, client.email, client.adresse];
    await window.api.eQuery("INSERT INTO clients (nom, telephone, email, adresse) VALUES (?, ?, ?, ?)", values);
    notifier("Client créé avec succès", "Clients");
    getClients();

    // Réinitialiser le formulaire
        document.getElementById('typeForm').value = "add";
        document.getElementById('nom').value = "";
        document.getElementById('telephone').value = "";
        document.getElementById('email').value = "";
        document.getElementById('adresse').value = "";
}

//supprimer un clients
window.deleteClient = async function(id) {
    await window.api.eQuery("DELETE FROM clients WHERE id=?", [id]);
    notifier("Client supprimé avec succès", "Clients");
    getClients();
}
//Modifier un clients
window.updateClient = async function(id) {
    document.getElementById('typeForm').value = "update"; 
    document.getElementById('clientId').value = id;

    const clients = await window.api.fetchAll(
        "SELECT * FROM clients WHERE id=?", [id]
    );
    const c = clients[0];

    // Remplir les champs devis
        document.getElementById('nom').value = c.nom;
        document.getElementById('telephone').value = c.telephone;
        document.getElementById('email').value = c.email;
        document.getElementById('adresse').value = c.adresse;

    // Transformer le bouton Ajouter en bouton Mettre à jour
    const addBtn = document.getElementById('addClient');
    addBtn.textContent = "Mettre à jour";
    }

// ENREGISTREMENT DES MODIFICATIONS DE client
async function updateClientSubmit(id) {
    // Update de la client
        const client = {
        nom: document.getElementById(`nom`).value,
        telephone: document.getElementById(`telephone`).value,
        email: document.getElementById(`email`).value,
        adresse: document.getElementById(`adresse`).value,
        id: id
    };
    const values = [client.nom, client.telephone, client.email, client.adresse, id];
    await window.api.eQuery("UPDATE clients set nom=? , telephone=? , email=? , adresse=? WHERE id=? ", values);
    notifier("Client modifié avec succès", "Clients");
    await getClients();
    
    // Réinitialiser le formulaire
    document.getElementById('typeForm').value = "add";
    const addBtn = document.getElementById('addClient');
    addBtn.textContent = "Ajouter";
    }
    
    
//CHOISIR entre add ou update
    document.getElementById('addClient').onclick = async function(event) {
        event.preventDefault()
        const mode = document.getElementById('typeForm').value;
    
        if(mode === "add") {
            await addClient();       // fonction qui gère l'ajout
        } else if(mode === "update") {
            const id = document.getElementById('clientId').value;
            await updateClientSubmit(id);  // fonction qui gère la mise à jour
        }
        //Fermer la modale après succès
        const modalEl = document.getElementById('addClientModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl) 
            || new bootstrap.Modal(modalEl);
        modalInstance.hide();
    }
        
        });

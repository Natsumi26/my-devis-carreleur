window.addEventListener('DOMContentLoaded', () => {

document.getElementById('accueil').addEventListener('click', function() {
    window.location.href = 'index.html';
})
    
document.getElementById('NewClient').addEventListener('click', () => {
    document.getElementById('formNew').style.display= "block";
    document.getElementById('NewClient').style.display="none";
})

async function getClients() {
    const clients = await window.api.fetchAll("SELECT * FROM clients");
    console.log(clients)
    const tbody = document.getElementById('clientsTable')
    tbody.innerHTML='';
    clients.forEach(client => {
        tbody.innerHTML +=`
            <tr>
                <td>${client.id}</td>
                <td><input id="nom-${client.id}" value="${client.nom}" disabled></td>
                <td><input id="telephone-${client.id}" value="${client.telephone}" disabled></td>
                <td><input id="email-${client.id}" value="${client.email}" disabled></td>
                <td><input id="adresse-${client.id}" value="${client.adresse}" disabled></td>
                <td>
                    <button onclick="updateClient(${client.id}, this)">Modifier</button>
                    <button onclick="deleteClient(${client.id})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}
getClients();
//ajouter un client
document.getElementById('addClient').addEventListener('click', async function addClient() {
    const client = {
        nom: document.getElementById('nom').value,
        telephone: document.getElementById('telephone').value,
        email: document.getElementById('email').value,
        adresse: document.getElementById('adresse').value,
    };
    // Convertir l'objet en tableau dans le bon ordre
    const values = [client.nom, client.telephone, client.email, client.adresse];
    await window.api.eQuery("INSERT INTO clients (nom, telephone, email, adresse) VALUES (?, ?, ?, ?)", values);
    getClients();

    // Réinitialiser et cacher le formulaire
    document.getElementById('formNew').style.display = "none";
    document.getElementById('NewClient').style.display = "block";
    document.getElementById('nom').value = "";
    document.getElementById('telephone').value = "";
    document.getElementById('email').value = "";
    document.getElementById('adresse').value = "";
})
//supprimer un clients
window.deleteClient = async function(id) {
    await window.api.eQuery("DELETE FROM clients WHERE id=?", [id]);
    getClients();
}
//Modifier un clients
window.updateClient = async function(id, btn) {
    const inputs = [
        document.getElementById(`nom-${id}`),
        document.getElementById(`telephone-${id}`),
        document.getElementById(`email-${id}`),
        document.getElementById(`adresse-${id}`)
    ]

    if(btn.innerHTML === "Modifier" ) {
        inputs.forEach(input => input.disabled = false);
        btn.innerText = "Sauvegarder";
    } else {
        const client = {
        nom: document.getElementById(`nom-${id}`).value,
        telephone: document.getElementById(`telephone-${id}`).value,
        email: document.getElementById(`email-${id}`).value,
        adresse: document.getElementById(`adresse-${id}`).value,
    };
    const values = [client.nom, client.telephone, client.email, client.adresse, id];
    await window.api.eQuery("UPDATE clients set nom=? , telephone=? , email=? , adresse=? WHERE id=? ", values);
    inputs.forEach(input => input.disabled = true);
    btn.innerText = "Modifier";
    getClients();
    }
    
    
}

});
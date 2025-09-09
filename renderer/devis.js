window.addEventListener('DOMContentLoaded', async () => {
//-------------------
    document.getElementById('NewDevis').addEventListener('click', () => {
        addDevisForm.reset();
        document.getElementById('prestationsContainer').innerHTML = "";
    });

    
//Recuperation des données pour la génération des PDF

    async function getDataDevis(id) {
        const result = await window.api.fetchAll('SELECT devis.id, devis.number, devis.date_devis, devis.total, devis.statue, devis.client_id as client, clients.nom, clients.adresse, clients.telephone,prestation.pu ,prestation.name,prestation.id AS prestation_id, devis_prestation.id AS dp_id, devis_prestation.quantity,prestation.pu, devis_prestation.sous_total FROM `devis` LEFT JOIN clients ON (clients.id=devis.client_id) LEFT JOIN devis_prestation ON (devis.id=devis_prestation.devis_id) LEFT JOIN prestation ON (prestation.id=devis_prestation.prestation_id) WHERE devis.id= ?', [id]);
        return result;
    }

    async function generateDevisFromId(id) {
        const result = await getDataDevis(id);
        if(!result || result.length === 0) {
            console.error("aucun devis trouvé");
            return;
        }

        // Construction des données
        const devisData = {
            devis: {
              id: result[0].id,
              number: result[0].number,
              date_devis: result[0].date_devis,
              total: result[0].total,
              statue: result[0].statue
            },
            clients: {
              nom: result[0].nom,
              adresse: result[0].adresse,
              telephone: result[0].telephone
            },
            devis_prestation: result
            .filter(r => r.dp_id !== null)
            .map(r => ({
                id: r.dp_id,
                prestation_id: r.prestation_id,
                prestation: {
                    name: r.name,
                    pu: r.pu
                },
              quantity: r.quantity,
              sous_total: r.sous_total
            }))
        };
        console.log(devisData);

        const response = await window.pdfAPI.generateDevis(devisData, `${devisData.devis.number}.pdf`);
    if(response.success) {
        console.log(`Devis sauvegardé : ${response.path}`);
    }

    }
    



    // Remplir le select CLIENTS -----------------------------
    async function getClients() {
        const clients = await window.api.fetchAll("SELECT * FROM clients");
        console.log(clients)
        const selectClient = document.getElementById('clientListe')
        selectClient.innerHTML='';
        clients.forEach(client => {
            selectClient.innerHTML += `
                <option value="${client.id}">${client.nom}</option>
            `
        })
    }
    

    //rempli le select PRESTATIONS -----------------------------
    async function getPrestations() {
        const prestations = await window.api.fetchAll("SELECT * FROM prestation");
        console.log(prestations)
        const prestationSelectTemplate = document.getElementById('prestationsListeTemplate');
        prestationSelectTemplate.innerHTML='';
        prestations.forEach(prestation => {
            prestationSelectTemplate.innerHTML += `
                <option value="${prestation.id}" data-pu="${prestation.pu}">${prestation.name}</option>
            `
        })
    }
    

//Gestion du bouton NOUVEAU DEVIS
    document.getElementById('NewDevis').addEventListener('click', async () => {
        await generateDevisNumber();
        await getClients();
        await getPrestations();
        //Set le type de formulaire
        document.getElementById('typeForm').value = 'add';
        // date du jour pour le devis
        document.getElementById('date').value = new Date().toLocaleDateString('fr-FR');
    })

    //Creation du NUMERO de devis
    async function generateDevisNumber() {
        // On récupère le dernier numéro de devis
        const lastDevis = await window.api.fetchAll("SELECT number FROM devis ORDER BY id DESC LIMIT 1");
        
        let newNumber = "";
        const year = new Date().getFullYear();
    
        if (lastDevis.length === 0) {
            // Premier devis
            newNumber = `DEV-${year}-0001`;
        } else {
            const lastNumber = lastDevis[0].number; // ex: DV-2025-0004
            const lastNum = parseInt(lastNumber.split("-")[2], 10); // → 4
            const nextNum = String(lastNum + 1).padStart(4, "0"); // → 0005
            newNumber = `DEV-${year}-${nextNum}`;
        }
        document.getElementById('number').value = newNumber;
    }

    //Calcul du TOTAL DEVIS
    function calculateTotal() {
        let total = 0;
        const lines = document.querySelectorAll('#prestationsContainer .presta-line');
    
        lines.forEach(line => {
            const select = line.querySelector('select');
            const quantityInput = line.querySelector('.quantity');
            const sousTotalInput = line.querySelector('.sousTotal');
    
            const pu = parseFloat(select.options[select.selectedIndex].dataset.pu || 0);
            const quantity = parseInt(quantityInput.value || 0);
    
            const sousTotal = pu * quantity;
            sousTotalInput.value = sousTotal.toFixed(2);
    
            total += sousTotal;
        });
    
        document.getElementById('total').value = total.toFixed(2);
    }
    document.getElementById('prestationsContainer').addEventListener('input', calculateTotal);
    document.getElementById('prestationsContainer').addEventListener('change', calculateTotal);

//AJOUTER des inputs pour les PRESTATIONS 
    document.getElementById("addPrestaLine").addEventListener("click", (sousTotal) => {
        
        const container = document.getElementById('prestationsContainer');
        const line = document.createElement('div');
        line.classList.add('presta-line');
        line.innerHTML = `
            <select class="prestationsListe" >
            <option value=''>Choisir la prestation</option>
                ${document.getElementById('prestationsListeTemplate').innerHTML}
            </select>
            <div class="mb-3">
                <input type="number" class="form-control quantity" placeholder="Quantité">
            </div>
            <div class="mb-3">
                <input type="number" class="form-control pu"  placeholder="Prix unitaire" disabled> 
            </div>
            <div class="mb-3">
                <input type="number" class="form-control sousTotal"  placeholder="Sous-Total" value='0' disabled> 
            </div>
            <button type="button" class="removeLine btn btn-danger mb-2" ><i class="bi bi-trash3"></i></button>
        `;
        container.appendChild(line);
        //Recupere et update le pu de chaque prestation
        const select = line.querySelector('.prestationsListe');
        select.addEventListener('change', () => {
            const pu = select.options[select.selectedIndex].dataset.pu;
            line.querySelector('.pu').value = pu;
            calculateTotal();
        });

        // Supprimer la ligne
        line.querySelector('.removeLine').addEventListener('click', () => {
            container.removeChild(line);
        });
    })

    // GET tous les DEVIS -------------------------------
    async function getDevis() {
        const devis = await window.api.fetchAll("SELECT devis.id, devis.number, devis.total, devis.statue, devis.date_devis, clients.nom AS client_nom FROM devis JOIN clients ON devis.client_id = clients.id");
        
        const tbody = document.getElementById('devisTable')
        tbody.innerHTML='';
        devis.forEach(d => {
            tbody.innerHTML +=`
                <tr>
                    <td>${d.id}</td>
                    <td><input id="number-${d.id}" value="${d.number}" disabled></td>
                    <td><input id="total-${d.id}" value="${d.total}" disabled></td>
                    <td><input id="date-${d.id}" value="${d.date_devis}" disabled></td>
                    <td><input id="date-${d.id}" value="${d.statue}" disabled></td>
                    <td><input id="client-${d.id}" value="${d.client_nom}" disabled></td>
                    <td>
                        <button class="btn btn-sm btn-success me-1"><i class="bi bi-eye"></i></button>
                        <button data-bs-toggle="modal" data-bs-target="#addDevisModal" class="btn btn-sm btn-primary me-1" onclick="updateDevis(${d.id}, this)"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDevis(${d.id})"><i class="bi bi-trash3"></i></button>
                    </td>
                </tr>
            `;
            tbody.querySelector('.btn-success').addEventListener('click', () => generateDevisFromId(d.id));
        });
    }
    await getDevis();

    //AJOUTER un DEVIS -------------------------
async function addDevis() {
        const devis = {
            number: document.getElementById('number').value,
            total: document.getElementById('total').value,
            date_devis: document.getElementById('date').value,
            client_id: document.getElementById('clientListe').value,
            statue: document.getElementById('statue').value,
        };
        const valuesDevis = [devis.number, devis.total, devis.date_devis, devis.client_id, devis.statue];
        await window.api.eQuery("INSERT INTO devis (number, total, date_devis, client_id, statue) VALUES (?, ?, ?, ?, ?)", valuesDevis);

        const result = await window.api.fetchAll("SELECT id FROM devis ORDER BY id DESC LIMIT 1");
        if (!result || result.length === 0) {
            console.error("Aucun devis trouvé après insertion !");
            return;
        }
        const devis_id = result[0].id;
        console.log(devis_id)

        //recuperer les données de toutes les lignes prestations
        const lines = document.querySelectorAll('.presta-line');
        console.log("➡️ Lignes prestations détectées:", lines.length);
        
        for (let line of lines) {
            const prestation_id = line.querySelector('.prestationsListe').value;
            const quantity = parseFloat(line.querySelector('.quantity').value)|| 0;
            const sous_total = parseFloat(line.querySelector('.sousTotal').value) || 0;

            console.log("👉 Insertion prestation:", {
                devis_id,
                prestation_id,
                quantity,
                sous_total
            });

            await window.api.eQuery(
                "INSERT INTO devis_prestation (prestation_id, devis_id, quantity, sous_total) VALUES (?, ?, ?, ?)",
                [prestation_id, devis_id, quantity, sous_total]
            );

        }
        console.log("✅ Toutes les prestations ont été insérées.");
        await getDevis();
    
        // REINITIALISATION et cacher le FORMULAIRE
        document.getElementById('typeForm').value = "add";
        document.getElementById('number').value = "";
        document.getElementById('total').value = "";
        document.getElementById('date').value = "";
        document.getElementById('statue').value = "";
        document.getElementById('clientListe').value = "";
        document.getElementById('prestationsContainer').innerHTML = "";
    }

//SUPPRIMER un devis ----------------------------
window.deleteDevis = async function(id) {
        await window.api.eQuery("DELETE FROM devis WHERE id=?", [id]);
        await getDevis();
    }
    
    

//MODIFIER le devis--------------------
window.updateDevis = async function(id) {
    document.getElementById('typeForm').value = "update"; 
    document.getElementById('devisId').value = id;
    await getClients();
    await getPrestations();
    const devis = await window.api.fetchAll(
        "SELECT * FROM devis WHERE id=?", [id]
    );
    const d = devis[0];

    // Récupérer les devis_prestations liées
    const prestations = await window.api.fetchAll(
        "SELECT dp.id, dp.quantity, dp.sous_total, p.id AS prestation_id, p.name, p.pu " +
        "FROM devis_prestation dp JOIN prestation p ON dp.prestation_id = p.id WHERE dp.devis_id=?",
        [id]
    );

    // Remplir les champs devis
    document.getElementById('number').value = d.number;
    document.getElementById('total').value = d.total;
    document.getElementById('date').value = d.date_devis;
    document.getElementById('statue').value = d.statue;
    document.getElementById('clientListe').value = d.client_id;

    // Nettoyer le container prestations
    const container = document.getElementById('prestationsContainer');
    container.innerHTML = "";

    // Remplir les lignes prestations
    prestations.forEach(prestation => {
        const line = document.createElement('div');
        line.classList.add('presta-line');
        line.innerHTML = `
            <select class="prestationsListe">
                ${document.getElementById('prestationsListeTemplate').innerHTML}
            </select>
            <div class="mb-3">
                        <label for="quantite" class="form-label">Quantité</label>
                        <input type="number" id="quantite"  class="form-control quantity" value="${prestation.quantity}">
            </div>
            <div class="mb-3">
                        <label for="pu" class="form-label">Prix Unitaire</label>
                        <input type="number" id="pu" class="form-control pu" value="${prestation.pu}" disabled>
            </div>
            <div class="mb-3">
                        <label for="sousTotal" class="form-label">Sous-total</label>
                        <input type="number" id="sousTotal" class="form-control sousTotal" value="${prestation.sous_total}" disabled>
            </div>
            <button type="button" class="removeLine btn btn-danger">Supprimer</button>
        `;
        container.appendChild(line);

        // Sélectionner la bonne prestation
        const select = line.querySelector('select');
        select.value = prestation.prestation_id;

        // Supprimer la ligne si besoin
        line.querySelector('.removeLine').addEventListener('click', () => {
            container.removeChild(line);
            calculateTotal();
        });
    });

    // Transformer le bouton Ajouter en bouton Mettre à jour
    const addBtn = document.getElementById('addDevis');
    addBtn.textContent = "Mettre à jour";
};
// ENREGISTREMENT DES MODIFICATIONS DE DEVIS
async function updateDevisSubmit(id) {
        // Update du devis
        const devis = {
            number: document.getElementById('number').value,
            total: document.getElementById('total').value,
            date_devis: document.getElementById('date').value,
            client_id: document.getElementById('clientListe').value,
            statue: document.getElementById('statue').value,
            id: id
        };
        const valuesDevis = [devis.number, devis.total, devis.date_devis, devis.client_id, devis.statue, devis.id]
        console.log(devis);
        console.log(valuesDevis)
        await window.api.eQuery(
            "UPDATE devis SET number=?, total=?, date_devis=?, client_id=?, statue=? WHERE id=?",
            valuesDevis
        );

        // Supprimer les anciennes prestations du devis
        await window.api.eQuery("DELETE FROM devis_prestation WHERE devis_id=?", [id]);

        // Réinsérer les prestations actuelles du formulaire
        const lines = document.querySelectorAll('.presta-line');
        for (let line of lines) {
            const prestation_id = line.querySelector('.prestationsListe').value;
            const quantity = parseFloat(line.querySelector('.quantity').value);
            const sous_total = line.querySelector('.sousTotal').value;
            await window.api.eQuery(
                "INSERT INTO devis_prestation (prestation_id, devis_id, quantity, sous_total) VALUES (?, ?, ?, ?)",
                [prestation_id, id, quantity, sous_total]
            );
        }

        // Rafraîchir la liste des devis
        await getDevis();

        // Réinitialiser le formulaire
        document.getElementById('typeForm').value = "add";
        const addBtn = document.getElementById('addDevis');
        addBtn.textContent = "Ajouter";
    };

//CHOISIR entre add ou update
document.getElementById('addDevis').onclick = async function(event) {
    event.preventDefault()
    const mode = document.getElementById('typeForm').value;

    if(mode === "add") {
        await addDevis();       // fonction qui gère l'ajout
    } else if(mode === "update") {
        const id = document.getElementById('devisId').value;
        await updateDevisSubmit(id);  // fonction qui gère la mise à jour
    }
    //Fermer la modale après succès
    const modalEl = document.getElementById('addDevisModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl) 
        || new bootstrap.Modal(modalEl);
    modalInstance.hide();
}

});
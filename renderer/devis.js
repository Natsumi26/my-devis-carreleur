window.addEventListener('DOMContentLoaded', async () => {
    //Gestion du bouton ACCUEIL
    document.getElementById('accueil').addEventListener('click', function() {
        window.location.href = 'index.html';
    })
    //Gestion du bouton ANNULER
    document.getElementById('annuler').addEventListener('click', function() {
        document.getElementById('formNew').style.display= "none";
        document.getElementById('NewDevis').style.display="block";
        document.getElementById('number').value = "";
        document.getElementById('total').value = "";
        document.getElementById('date').value = "";
        document.getElementById('clientListe').value = "";
        document.getElementById('prestationsContainer').innerHTML = "";
    }) 
    //Gestion du bouton NOUVEAU DEVIS
    document.getElementById('NewDevis').addEventListener('click', async () => {
        document.getElementById('formNew').style.display= "block";
        document.getElementById('NewDevis').style.display="none";
        await generateDevisNumber();
        //Set le type de formulaire
        document.getElementById('typeForm').value = 'add';
        // date du jour pour le devis
        document.getElementById('date').value = new Date().toLocaleDateString('fr-FR');
    })


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
    await getClients();
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
    await getPrestations();

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
            <input type="number" class="quantity" placeholder="Quantité">
            <input type="number" class="pu" disabled>
            <input type="number" class="sousTotal" value='0' disabled>
            <button type="button" class="removeLine" >Supprimer</button>
        `;
        container.appendChild(line);

        //Recupere et update le pu de chaque prestation
        const select = line.querySelector('.prestationsListe');
        select.addEventListener('change', () => {
            const pu = select.options[select.selectedIndex].dataset.pu;
            line.querySelector('.pu').value = pu;
            calculateTotal();
        });

        line.querySelector('.removeLine').addEventListener('click', () => {
            container.removeChild(line);
        });
    })

    // GET tous les DEVIS -------------------------------
    async function getDevis() {
        const devis = await window.api.fetchAll("SELECT devis.id, devis.number, devis.total, devis.date_devis, clients.nom AS client_nom FROM devis JOIN clients ON devis.client_id = clients.id");
        console.log(devis)
        const tbody = document.getElementById('devisTable')
        tbody.innerHTML='';
        devis.forEach(d => {
            tbody.innerHTML +=`
                <tr>
                    <td>${d.id}</td>
                    <td><input id="number-${d.id}" value="${d.number}" disabled></td>
                    <td><input id="total-${d.id}" value="${d.total}" disabled></td>
                    <td><input id="date-${d.id}" value="${d.date_devis}" disabled></td>
                    <td><input id="client-${d.id}" value="${d.client_nom}" disabled></td>
                    <td>
                        <button onclick="updateDevis(${d.id}, this)">Modifier</button>
                        <button onclick="deleteDevis(${d.id})">Supprimer</button>
                    </td>
                </tr>
            `;
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
        };
        const valuesDevis = [devis.number, devis.total, devis.date_devis, devis.client_id];
        await window.api.eQuery("INSERT INTO devis (number, total, date_devis, client_id) VALUES (?, ?, ?, ?)", valuesDevis);

        const result = await window.api.fetchAll("SELECT id FROM devis ORDER BY id DESC LIMIT 1");
        if (!result || result.length === 0) {
            console.error("Aucun devis trouvé après insertion !");
            return;
        }
        const devis_id = result[0].id;


        //recuperer les données de toutes les lignes prestations
        const lines = document.querySelectorAll('.presta-line');
        for(let line of lines) {
            const prestation_id = line.querySelector('.prestationsListe').value;
            const quantity = parseFloat(line.querySelector('.quantity').value);
            // const pu = line.querySelector('.pu').value;
            const sous_total = line.querySelector('.sousTotal').value;

        // Convertir l'objet en tableau
        const valuesDevisPresta = [prestation_id, devis_id, quantity, sous_total];
        await window.api.eQuery("INSERT INTO devis_prestation (prestation_id, devis_id, quantity, sous_total) VALUES (?, ?, ?, ?)", valuesDevisPresta);
        }
        await getDevis();
    
        // REINITIALISATION et cacher le FORMULAIRE
        document.getElementById('formNew').style.display = "none";
        document.getElementById('NewDevis').style.display = "block";
        document.getElementById('typeForm').value = "";
        document.getElementById('number').value = "";
        document.getElementById('total').value = "";
        document.getElementById('date').value = "";
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

    // Afficher le formulaire
    document.getElementById('formNew').style.display = "block";
    document.getElementById('NewDevis').style.display = "none";

    // Remplir les champs devis
    document.getElementById('number').value = d.number;
    document.getElementById('total').value = d.total;
    document.getElementById('date').value = d.date_devis;
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
            <input type="number" class="quantity" value="${prestation.quantity}">
            <input type="number" class="pu" value="${prestation.pu}" disabled>
            <input type="number" class="sousTotal" value="${prestation.sous_total}" disabled>
            <button type="button" class="removeLine">Supprimer</button>
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
            id: id
        };
        const valuesDevis = [devis.number, devis.total, devis.date_devis, devis.client_id, devis.id]
        console.log(devis);
        console.log(valuesDevis)
        await window.api.eQuery(
            "UPDATE devis SET number=?, total=?, date_devis=?, client_id=? WHERE id=?",
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
        document.getElementById('formNew').style.display = "none";
        document.getElementById('NewDevis').style.display = "block";
        document.getElementById('typeForm').value = "add";
        const addBtn = document.getElementById('addDevis');
        addBtn.textContent = "Ajouter";
    };

//CHOISIR entre add ou update
document.getElementById('addDevis').onclick = async function() {
    const mode = document.getElementById('typeForm').value;

    if(mode === "add") {
        await addDevis();       // fonction qui gère l'ajout
    } else if(mode === "update") {
        const id = document.getElementById('devisId').value;
        await updateDevisSubmit(id);  // fonction qui gère la mise à jour
    }
}
});
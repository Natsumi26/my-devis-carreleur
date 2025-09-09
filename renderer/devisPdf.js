const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateDevis(devisData, outputPath) {
  const doc = new PDFDocument({ margin: 50 });

  // Sauvegarde dans un fichier
  doc.pipe(fs.createWriteStream(outputPath));

  // --- En-tête ---
  doc
    .fontSize(20)
    .text("DEVIS", { align: "center" })
    .moveDown();

  // --- Infos société ---
  doc
    .fontSize(12)
    .text("Entreprise L'atelier du carrelage", { align: "left" })
    .text("12 rue des artisans")
    .text("26270 Loriol")
    .moveDown();

  // --- Infos client ---
  doc
    .fontSize(12)
    .text(`Client : ${devisData.clients.nom}`)
    .text(`Adresse : ${devisData.clients.adresse}`)
    .moveDown();

    // --- Tableau prestations ---
    const startX = 50;
    let y = doc.y;
  
    // En-têtes
    doc.fontSize(12).text("Prestation", startX, y);
    doc.text("PU (€)", 350, y, { width: 80, align: "right" });
    doc.text("Quantité", 430, y, { width: 80, align: "right" });
    doc.text("Total (€)", 510, y, { width: 80, align: "right" });
  
    y += 20;
    doc.moveTo(startX, y).lineTo(560, y).stroke(); // Ligne sous l'en-tête
    y += 10;

    devisData.devis_prestation.forEach((devis_presta) => {
    
        doc.text(devis_presta.prestation.name, startX, y, { width: 280 });
        doc.text(devis_presta.prestation.pu.toFixed(2), 350, y, { width: 80, align: "right" });
        doc.text(devis_presta.quantity, 430, y, { width: 80, align: "right" });
        doc.text(devis_presta.sous_total.toFixed(2), 510, y, { width: 80, align: "right" });
    
        y += 20;
      });

// Ligne avant total
      doc.moveTo(startX, y).lineTo(560, y).stroke();
      y += 10;

  // --- Total ---

  // --- Total ---
  doc.fontSize(14).text("TOTAL TTC :", 350, y, { width: 160, align: "right" });
  doc.fontSize(14).text(devisData.devis.total.toFixed(2) + " €", 510, y, { width: 80, align: "right" });

  // --- Pied de page ---
  doc.moveDown(3).fontSize(10).text("Devis valable 30 jours", { align: "center" });

  // Finalise le PDF
  doc.end();
}

module.exports = {generateDevis};

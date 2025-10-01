# 🧮 Logiciel de gestion Devis & Factures

Application Electron pour auto-entrepreneurs permettant de gérer les clients, prestations, devis, factures et planning, avec génération PDF et envoi par email.

---

## 🚀 Fonctionnalités

- 👥 Gestion des clients
- 🛠️ Gestion des prestations
- 📄 Création de devis et factures
- 📧 Envoi automatique par email (SMTP configurable)
- 📅 Planning des interventions
- 📦 Export / Import de la base SQLite
- 🧑‍🏫 Tutoriel utilisateur intégré

---

## 🖥️ Technologies utilisées

- [Electron](https://www.electronjs.org/)
- [Node.js](https://nodejs.org/)
- [SQLite3](https://www.npmjs.com/package/sqlite3) - base de données local 
- [Bootstrap](https://getbootstrap.com/) - icons, front 
- [Fullcalendar](https://fullcalendar.io/)
- [electron-builder](https://www.npmjs.com/package/electron-builder) - pour le packaging
- [NSIS](https://nsis.sourceforge.io/) - pour l'installateur 
- [exceljs](https://www.npmjs.com/package/exceljs/v/0.2.5) - export/import excel
- [pdfKit](https://pdfkit.org/) - génération de pdf
- [chart.js](https://www.chartjs.org/) - graphique, diagramme
- [electron-icon-builder](https://www.npmjs.com/package/@sunjw8888/electron-icon-builder) - création des differents icons à partir d'une image .png
- [nodemailer](https://nodemailer.com/) - envoi de mail

---

## 📦 Installation

git clone https://github.com/ton-utilisateur/ton-repo.git
cd ton-repo
npm install
npm run start
npm run build <- pour le packaging

---

## Ces commandes installent toutes les dépendances nécessaires au bon fonctionnement de l'application. 

# Installer Electron en mode développement 
npm install electron --save-dev 

# Installer les dépendances principales 
npm install sqlite3 
npm i bootstrap@5.3.8 
npm install fullcalendar 
npm install electron-builder 
npm install exceljs 
npm install pdfkit 
npm install chart.js 
npm install nodemailer 

# Installer l'outil global pour générer les icônes 
npm install -g electron-icon-builder 

---

## ⚙️ Configuration SMTP


Dans les paramètres de l’application, renseignez :

smtp_host : ex. smtp.gmail.com

smtp_port : ex. 465

smtp_secure : true ou false

Email et mot de passe

---

## 📖 Tutoriel utilisateur

Accessible depuis le menu “Aide” dans l’application. Contient des explications détaillées pour chaque fonctionnalité.

--- 

## 📬 Contact 
Développé par [Marion Redon](mailto:marion.redon@example.com) 
Site : [marion.redon.stage-dwwm.fr](https://marion.redon.stage-dwwm.fr) 

---

## 📄 Licence
 
Ce projet est sous licence MIT.
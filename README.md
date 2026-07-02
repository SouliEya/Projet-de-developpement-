# 🤖 Smart Test Assistant - QA Automation Platform

## 📊 Description

**Smart Test Assistant** est une plateforme intelligente de gestion et d'automatisation des tests QA, propulsée par l'IA. Elle permet de :

- 🎯 **Générer automatiquement des cas de test** à partir de User Stories (avec OpenAI GPT)
- 🔍 **Classifier automatiquement les bugs** par catégorie (performance, sécurité, UX/UI, etc.)
- 📈 **Prioriser les tests** pour l'automatisation selon des critères intelligents
- 📊 **Suivre les campagnes de test** et les exécutions en temps réel
- 🐛 **Gérer les bugs** avec traçabilité complète
- 📉 **Visualiser les métriques** via un dashboard interactif

## 🏗️ Architecture

```
smart-test-assistant/
├── backend/              # API REST (Node.js + Express + MongoDB)
│   ├── models/          # User, TestCase, Bug, Campaign, Execution
│   ├── controllers/     # Logique métier
│   ├── routes/          # Endpoints API
│   └── middleware/      # Auth JWT + RBAC
├── frontend/            # Interface React + TypeScript + Material-UI
│   ├── pages/          # Dashboard, TestCases, Bugs, Campaigns, etc.
│   ├── store/          # Redux Toolkit (state management)
│   └── services/       # API client (Axios)
├── ai-service/          # Service IA (FastAPI + Python)
│   └── main.py         # Génération tests, classification bugs, priorisation
└── docker-compose.yml   # Orchestration des services
```

## ✨ Fonctionnalités Principales

### 🧠 Intelligence Artificielle
- **Génération de tests** : Créez automatiquement 4-8 cas de test à partir d'une User Story
  - Cas nominaux (positifs)
  - Cas d'erreur (négatifs)
  - Cas limites et validation
  - Tests de sécurité (injection SQL, brute force)
- **Classification de bugs** : Analyse automatique par mots-clés (performance, sécurité, UX/UI, régression, fonctionnel)
- **Priorisation intelligente** : Score d'automatisation basé sur la fréquence, criticité, durée manuelle

### 📋 Gestion Complète
- **User Stories** : Création, édition, suivi avec critères d'acceptation
- **Test Cases** : Gestion détaillée avec étapes, préconditions, priorités
- **Test Plans** : Organisation des tests par plan
- **Campagnes** : Exécution groupée de tests
- **Bugs** : Suivi avec sévérité, statut, assignation

### 📊 Dashboard & Analytics
- KPIs en temps réel (stories, tests, bugs, exécutions)
- Graphiques de distribution (statuts, sévérités)
- Tendances temporelles
- Taux de réussite des tests

### 🔐 Sécurité & Permissions
- Authentification JWT
- RBAC (Role-Based Access Control) : Admin, QA Lead, Tester, Developer
- Permissions granulaires par rôle

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 16+ & npm
- **Python** 3.9+
- **MongoDB** 5.0+
- **Docker** & Docker Compose (optionnel)
- **Clé API OpenAI** (optionnel, pour génération IA avancée)

### Installation Locale

#### 1. Cloner le dépôt
```bash
git clone https://github.com/SouliEya/Projet-de-developpement-.git
cd Projet-de-developpement-
```

#### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos paramètres (MongoDB, JWT secret, OpenAI key)
```

#### 3. Backend (Node.js)
```bash
cd backend
npm install
npm run dev
# Backend démarre sur http://localhost:5000
```

#### 4. Frontend (React)
```bash
cd frontend
npm install
npm start
# Frontend démarre sur http://localhost:3000
```

#### 5. AI Service (Python)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# AI Service démarre sur http://localhost:8000
```

### 🐳 Installation avec Docker (Recommandé)

```bash
docker-compose up -d
```

**Services disponibles :**
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- AI Service : http://localhost:8000
- MongoDB : localhost:27017

## 🛠️ Technologies

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (authentification)
- **bcrypt** (hashage mots de passe)
- **Helmet** + **CORS** (sécurité)

### Frontend
- **React 18** + **TypeScript**
- **Material-UI (MUI)** - Design system
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Recharts** - Visualisations
- **Axios** - HTTP client

### AI Service
- **FastAPI** (Python)
- **OpenAI GPT-3.5** (génération de tests)
- **Pydantic** (validation)
- **Algorithmes rule-based** (fallback sans OpenAI)

### DevOps
- **Docker** + **Docker Compose**
- **Git** + **GitHub**

## 📚 Documentation Complémentaire

- [Guide Visual Studio 2022](GUIDE_VISUAL_STUDIO_2022.md)
- [Documentation TP BI](README_TP_BI.md) - Projet annexe datawarehouse

## � Comptes par Défaut

Après le seed initial (`npm run seed` dans backend) :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@test.com | admin123 |
| QA Lead | qa@test.com | qa123 |
| Tester | tester@test.com | tester123 |
| Developer | dev@test.com | dev123 |

## 🤝 Contribution

Ce projet est développé dans un cadre académique. Les contributions sont les bienvenues !

## 📝 Licence

Projet académique - Tous droits réservés

## 👥 Auteur

**Eya Souli**  
Projet de développement - Smart Test Assistant

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous plaît !**

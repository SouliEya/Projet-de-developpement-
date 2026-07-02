# Projet Business Intelligence - Datawarehouse Criminalité Irlande

## 📊 Description

Projet complet de Business Intelligence comprenant :
- **Datawarehouse** pour l'analyse des statistiques de criminalité en Irlande
- **Backend API** pour l'accès aux données
- **Frontend** pour la visualisation interactive
- **Service AI** pour l'analyse avancée

## 🏗️ Architecture

```
projet-developpement/
├── backend/              # API Backend
├── frontend/             # Interface utilisateur
├── ai-service/           # Service d'analyse IA
├── create_datawarehouse.sql   # Schéma de la base de données
├── load_datawarehouse.py      # Script de chargement des données
├── analyse_qa_tnr.py          # Analyse qualité
└── docker-compose.yml         # Configuration Docker
```

## 🚀 Démarrage Rapide

### Prérequis
- Python 3.8+
- Node.js 14+
- MySQL 8.0+
- Docker (optionnel)

### Installation

1. **Cloner le dépôt**
```bash
git clone <votre-repo-url>
cd projet-developpement
```

2. **Installer les dépendances Python**
```bash
pip install -r requirements.txt
```

3. **Configurer la base de données**
```bash
mysql -u root -p < create_datawarehouse.sql
```

4. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

5. **Charger les données**
```bash
python load_datawarehouse.py
```

### Avec Docker
```bash
docker-compose up -d
```

## 📚 Documentation

- [Guide du Datawarehouse](README_TP_BI.md)
- [Guide Visual Studio 2022](GUIDE_VISUAL_STUDIO_2022.md)

## 🛠️ Technologies

- **Backend**: C# / .NET, Python
- **Frontend**: React / Node.js
- **Base de données**: MySQL
- **Conteneurisation**: Docker
- **IA**: Service d'analyse personnalisé

## 📝 Licence

Ce projet est développé dans un cadre académique.

## 👥 Auteur

Eya Souli

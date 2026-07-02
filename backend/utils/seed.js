require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const UserStory = require('../models/UserStory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_test_assistant';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Seeding...');

  await User.deleteMany();
  await UserStory.deleteMany();

  const admin = await User.create({
    firstName: 'Admin', lastName: 'STA', email: 'admin@sta.com',
    password: 'admin123', role: 'admin'
  });
  const qa = await User.create({
    firstName: 'Eya', lastName: 'Souli', email: 'eya@sta.com',
    password: 'qa1234', role: 'qa_engineer'
  });
  const manager = await User.create({
    firstName: 'Manager', lastName: 'Test', email: 'manager@sta.com',
    password: 'manager1', role: 'test_manager'
  });
  const dev = await User.create({
    firstName: 'Dev', lastName: 'Team', email: 'dev@sta.com',
    password: 'dev1234', role: 'developer'
  });

  const stories = await UserStory.insertMany([
    {
      title: 'Connexion utilisateur',
      description: 'En tant qu\'utilisateur, je souhaite me connecter avec mon email et mot de passe.',
      acceptanceCriteria: [
        'L\'utilisateur peut se connecter avec un email valide et un mot de passe correct',
        'Un message d\'erreur s\'affiche si les identifiants sont incorrects',
        'Le compte est verrouillé après 5 tentatives échouées'
      ],
      priority: 'high', sprint: 'Sprint 1', status: 'ready', createdBy: qa._id
    },
    {
      title: 'Inscription utilisateur',
      description: 'En tant que nouvel utilisateur, je souhaite créer un compte avec mes informations.',
      acceptanceCriteria: [
        'L\'utilisateur remplit un formulaire avec prénom, nom, email et mot de passe',
        'Le mot de passe doit contenir au moins 6 caractères',
        'Un email de confirmation est envoyé'
      ],
      priority: 'high', sprint: 'Sprint 1', status: 'draft', createdBy: qa._id
    },
    {
      title: 'Réinitialisation du mot de passe',
      description: 'En tant qu\'utilisateur, je souhaite réinitialiser mon mot de passe en cas d\'oubli.',
      acceptanceCriteria: [
        'L\'utilisateur reçoit un lien de réinitialisation par email',
        'Le lien expire après 24 heures',
        'Le nouveau mot de passe doit respecter les critères de sécurité'
      ],
      priority: 'medium', sprint: 'Sprint 1', status: 'draft', createdBy: qa._id
    },
    {
      title: 'Gestion du profil utilisateur',
      description: 'En tant qu\'utilisateur connecté, je souhaite modifier mes informations personnelles.',
      acceptanceCriteria: [
        'L\'utilisateur peut modifier son prénom, nom et photo de profil',
        'Les modifications sont sauvegardées immédiatement',
        'Un message de confirmation s\'affiche après la sauvegarde'
      ],
      priority: 'medium', sprint: 'Sprint 2', status: 'draft', createdBy: qa._id
    },
    {
      title: 'Tableau de bord QA',
      description: 'En tant que responsable QA, je souhaite visualiser les KPIs des tests sur un dashboard.',
      acceptanceCriteria: [
        'Affichage du taux de réussite des tests',
        'Affichage du nombre de bugs ouverts vs fermés',
        'Graphiques de tendance sur les 30 derniers jours'
      ],
      priority: 'high', sprint: 'Sprint 4', status: 'draft', createdBy: manager._id
    }
  ]);

  console.log(`✅ ${4} utilisateurs créés`);
  console.log(`✅ ${stories.length} user stories créées`);
  console.log('\n📧 Comptes de démo:');
  console.log('   admin@sta.com / admin123 (Admin)');
  console.log('   eya@sta.com   / qa1234   (QA Engineer)');
  console.log('   manager@sta.com / manager1 (Test Manager)');
  console.log('   dev@sta.com   / dev1234  (Développeur)');

  await mongoose.disconnect();
  console.log('\n🌱 Seed terminé!');
}

seed().catch(err => { console.error(err); process.exit(1); });

"""
Script pour copier les tests restants du fichier Excel vers le projet MOBSMP
"""

# Tests restants à créer (suite de l'historique des transactions)
historique_tests = [
    "Vérifier l'affichage des ticket dans l'historique",
    "Vérifier le changement de solde (ventes) dans l'historique, suite à une opération d'achat ou d'annulation",
    "Effectuer une opération d'annulation depuis l'historique avec un mot de passe correct",
    "Effectuer une opération d'annulation depuis l'historique avec un mot de passe incorrect",
    "Vérifier la traçabilité des deux opérations ( Achat/Annulation) de la meme transaction dans l'historique",
    "Vérifier le mode RTL dans l'historique des transactions lorsque l'application est en arabe",
]

# Tests de statistiques
statistique_tests = [
    "Vérifier que les statistiques affichées sont correctes dans la rubrique \"Statistique\"",
    "Filtrer par date et vérifier la modification de l'affichage des statistiques",
    "Filtrer avec une date de début supérieure à la date de fin dans statistique",
    "Vérifier le changement de l'affichage des statistiques suite a une transaction d'achat",
    "Vérifier le changement de l'affichage des statistiques suite a une transaction d'annulation",
    "Vérifier le mode RTL dans les statistiques lorsque l'application est en arabe",
    "Vérifier le statistiques si on a seulement des transactions d'achat et pas d'annulation",
]

# Tests d'achat
achat_tests = [
    "Effectuer un journal du TPE avec le même id terminal du soft POS",
    "Effectuer une cloture du TPE avec le même id terminal du soft POS",
    "Effectuer une opération d'achat via SOFTPOS avec une carte VISA/MASTER/Pure avec un montant invalide",
    "Transaction pin online",
    "Transaction pin offline",
    "Effectuer une opération d'achat via SOFTPOS avec une carte Pure et un montant valides",
    "Effectuer une opération d'achat via SOFTPOS avec une carte invalide",
    "Effectuer une opération d'achat via SOFTPOS avec un téléphone qui ne supporte pas l'NFC",
    "Efectuer une opération d'achat via SOFTPOS en présentant la carte Pure pour le paiement sans contact (NFC)  après plusieurs minutes",
    "Effectuer une opération d'achat via SOFTPOS avec solde insuffisant",
    "Efectuer une opération d'achat via SOFTPOS sans code PIN",
    "Effectuer une opération d'achat via SOFTPOS avec un montant élevé et une saisie correcte du code PIN",
    "Effectuer une opération d'achat via SOFTPOS avec un montant élevé et une saisie incorrecte du code PIN",
    "Effectuer une opération d'achat via SOFTPOS avec connexion internet désactivée",
    "Effectuer une opération d'achat via SOFTPOS avec un montant =0",
    "Vérifier le contenu du ticket après une opération d'achat approuvée",
    "Vérifier le contenu du ticket après une opération d'achat refusée",
    "Vérifier le contenu du ticket digitale après une opération d'achat approuvée",
    "Vérifier la mise à jour du solde \"Total de la journée\" après chaque opération d'achat approuvée",
    "Vérifier les effets sonores lors d'un contact NFC dans une opération d'achat approuvée",
    "Vérifier les effets sonores lors d'un contact NFC dans une opération d'achat refusée",
    "Vérifier que toutes les transactions effectuées via SOFTPOS sont correctement tracées et affichées dans le portail MSS Drive Moamalat",
    "Effectuer 10 opérations d'achat via SoftPOS successivement en 2 minutes (performance)",
    "Effectuer une opération d'achat via SOFTPOS avec une carte VISA et un montant valides",
    "Effectuer une opération d'achat via SOFTPOS avec une carte MASTER et un montant valides",
    "Imprimer le ticket de transaction d'achat approuvée en arabe",
    "Imprimer le ticket de transaction d'achat rejetée en arabe",
    "Vérifier le ticket digital en arabe",
    "Effectuer une transaction d'achat en arabe",
    "Vérifier la devise en arabe",
    "Imprimer le ticket de transaction d'achat approuvée en anglais",
    "Imprimer le ticket de transaction d'achat rejetée en anglais",
    "Recevoir le ticket de paiement en anglais par SMS",
    "Recevoir le ticket de paiement en arabe par SMS",
    "Vérifier le ticket de paiement en arabe",
]

# Tests d'annulation
annulation_tests = [
    "Annulation d'une transaction d'achat",
    "Annuler la dernière opération d'achat depuis l'icône \"Annulation\" dans l'accueil avec un code de sécutité  incorrect (avant 24h)",
    "Annuler la dernière opération d'achat depuis l'icône \"Annulation\" dans l'accueil (avant 24h)",
    "Annuler la dernière opération d'achat depuis l'icône \"Annulation\" dans l'accueil sans saisir le code de sécutité   (avant 24h)",
    "Annuler d'une opération d'achat depuis l'historique  (avant 24h)",
    "Annuler une opération d'achat déjà annulée depuis l'historique (avant 24h)",
    "Annuler la dernière opération d'achat depuis l'icône \"Annulation\" dans l'accueil (Après 24h de date de l'opération)",
    "Annuler d'une opération d'achat depuis l'historique  (Après 24h de date de l'opération)",
    "Annuler la dernière opération d'achat depuis l'historique  sans saisir le code de sécutité",
    "Vérifier le changement de solde après chaque annulation",
    "Vérifier le contenu du ticket après une opération d'annulation",
    "Vérifier le contenu du ticket digitale après une opération d'annulation",
    "Rediriger vers l'arrière sans valider l'annulation",
    "Annuler toutes les opérations d'achat effectuées",
    "Imprimer le ticket d'annulation en arabe",
    "Imprimer le ticket d'annulation en anglais",
    "Recevoir le ticket d'annulation de paiement en anglais par SMS",
    "Recevoir le ticket d'annulation de paiement en arabe par SMS",
]

print(f"Tests historique restants: {len(historique_tests)}")
print(f"Tests statistique: {len(statistique_tests)}")
print(f"Tests achat: {len(achat_tests)}")
print(f"Tests annulation: {len(annulation_tests)}")
print(f"Total: {len(historique_tests) + len(statistique_tests) + len(achat_tests) + len(annulation_tests)}")

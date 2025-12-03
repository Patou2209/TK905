# 🚀 Déploiement en production sur DigitalOcean (6 $/mois)

Ce guide te permet de mettre ton serveur Node.js TK905 en production de manière fiable, sécurisée et automatique (redémarre même après un reboot du serveur).

> **Coût** : 6 $/mois (Droplet Basic – 1 vCPU / 1 GB RAM / 25 GB SSD / 1 To transfert)  
> **Système** : Ubuntu 24.04 LTS (recommandé)  
> **Durée totale** : ~20-25 minutes la première fois

---

### Étape 1 : Créer le Droplet sur DigitalOcean

1. Va sur https://cloud.digitalocean.com
2. Connecte-toi ou crée un compte (carte bancaire obligatoire, mais 6 $ seulement)
3. Clique sur **Create → Droplets**
4. Choisis :
   - **Distribution** : Ubuntu 24.04 (LTS) x64
   - **Plan** : Basic → 1 GB RAM / 1 vCPU → **$6/mo**
   - **Datacenter region** : la plus proche de tes trackers (ex : Frankfurt, Amsterdam, London, New York…)
   - **Authentication** : **Password** (plus simple) → choisis un mot de passe très fort
   - **Hostname** : `gps-server-tk905` (ou ce que tu veux)
   - **Backups** : désactive (coûte +20 %)
   - Clique sur **Create Droplet**

Attends 1 minute → tu reçois un email avec **l’IP publique** et le mot de passe root.

---

### Étape 2 : Connexion SSH au serveur

```bash
ssh root@TON_IP_PUBLIQUE
(exemple : ssh root@164.90.184.123)Tape yes, puis colle le mot de passe root.Tu es maintenant connecté au serveur !

Étape 3 : Mise à jour système & installation des outils de base

apt update && apt upgrade -y
apt install -y git curl wget nano ufw

Étape 4 : Créer un utilisateur non-root (sécurité)

adduser gpsuser          # choisis un mot de passe fort
usermod -aG sudo gpsuser

Déconnexion puis reconnexion avec le nouvel utilisateur :

exit
ssh gpsuser@TON_IP_PUBLIQUE

Étape 5 : Installer Node.js 20 (LTS)

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

Vérification :
node --version   # doit afficher v20.x
npm --version

Étape 6 : Installer PM2 (garde le serveur actif 24/7)
sudo npm install -g pm2
pm2 startup ubuntu -u gpsuser   # copie la commande affichée et exécute-la

Étape 7 : Transférer ton projet sur le serveurMéthode la plus simple : Git (recommandée)Sur ton PC (dans le dossier du projet) :

git init
git add .
git commit -m "Initial commit"

Puis sur le serveur :
mkdir ~/gps-server && cd ~/gps-server
git init
git pull https://github.com/TON_USERNAME/TON_REPO.git   # ou ton repo privé

Méthode alternative : SCP (si pas de Git)Sur ton PC :
scp -r /chemin/vers/gps-server/* gpsuser@TON_IP:/home/gpsuser/gps-server/

Étape 8 : Installer les dépendances

cd ~/gps-server
npm ci --omit=dev   # plus propre que npm install

Étape 9 : Configurer le fichier .env
nano .env

Contenu minimal à mettre :
PORT=5023
FIREBASE_DATABASE_URL=https://ton-projet.firebaseio.com

Important : Ne jamais mettre serviceAccountKey.json sur GitHub !
Il faut le copier manuellement :Depuis ton PC :
scp firebase/serviceAccountKey.json gpsuser@TON_IP:/home/gpsuser/gps-server/firebase/

Vérifie que le fichier est bien là :
ls firebase/serviceAccountKey.json

Étape 10 : Lancer le serveur avec PM2
pm2 start server.js --name "gps-tk905"
pm2 save
pm2 startup ubuntu -u gpsuser   # ré-exécute si besoin

Vérifie que ça tourne :
pm2 status
pm2 logs gps-tk905

Tu dois voir le beau cadre ASCII avec "SERVEUR GPS TK905 DÉMARRÉ"

Étape 11 : Ouvrir le port 5023 dans le pare-feu
sudo ufw allow 5023/tcp
sudo ufw allow ssh      # important, sinon tu te bloques dehors !
sudo ufw enable
sudo ufw status

DigitalOcean a aussi son propre firewall → va dans ton dashboard → Networking → Firewalls → crée un firewall et ajoute :Inbound Rule → TCP → Port 5023 → All IPv4 & IPv6
Applique-le à ton Droplet

Étape 12 : Récupérer l’IP publique du serveur
curl ifconfig.me

Ou regarde dans le dashboard DigitalOcean → ton Droplet → IPv4C’est cette IP que tu vas configurer dans le tracker TK905 !

Étape 13 : Configurer le tracker TK905Envoie ces SMS :
adminip123456 TON_IP_PUBLIQUE 5023
gprs123456
apn123456 APN_DE_TON_OPERATEUR
reset123456


Exemples APN populaires :Opérateur
APN
Orange
internet

MTN
mtninternet

Vodacom
vodacom ou internet

Airtel
airtelgprs.com

Safaricom
safaricom


Attends 2-5 minutes → tu verras dans les logs PM2 :
Nouvelle connexion...
Données reçues...
Données sauvegardées dans Firebase

Étape 14 : Vérifications finales
pm2 status          # doit montrer gps-tk905 online
pm2 logs            # voir les connexions en temps réel
curl ifconfig.me    # ton IP publique

Va dans Firebase → Realtime Database → tu dois voir les données arriver !

Commandes utiles (à garder sous la main)
# Voir les logs en direct
pm2 logs gps-tk905

# Redémarrer le serveur
pm2 restart gps-tk905

# Voir les processus
pm2 list

# Mettre à jour le code (quand tu fais des modifs)
cd ~/gps-server
git pull
pm2 restart gps-tk905

# Voir l'utilisation CPU/RAM
htop   # (installe avec : sudo apt install htop)

Bonus : Sécuriser encore plus (optionnel mais recommandé)Changer le port SSH (ex: 2222) pour éviter les attaques automatiques
Installer Fail2Ban :

sudo apt install fail2ban -y

Mettre en place une clé SSH au lieu du mot de passe


















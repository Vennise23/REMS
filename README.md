# 🏠 REMS Project Setup Guide

A step-by-step guide to set up and run the **REMS** Laravel project locally using **Laragon**, **Composer**, and **Node.js**.

---

## 🧩 <b>1. Prerequisites Installation</b>

Before starting, install the following tools:

### 🔹 Install Laragon
1. Go to the official site: [https://laragon.org/download/](https://laragon.org/download/)
2. Download **Laragon Full (for PHP)**.
3. Run the installer and install it to `C:\laragon`.
4. After installation, start **Apache** and **MySQL** from the Laragon control panel.
(Laragon used as database, if using PhpMyAdmin, it can work, but you will need to modify the database and insert the default data yourself)
---

### 🔹 Install Git
1. Download from: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Install with default settings.
(Incase you don't have the git installed only)
---

### 🔹 Install Composer
1. Go to [https://getcomposer.org/download/](https://getcomposer.org/download/)
2. Download **Composer-Setup.exe** (Windows Installer).
3. Install it — it will automatically detect your PHP path from Laragon.
(You can use vscode terminal to download also!)
---

### 🔹 Install Node.js (includes npm)
1. Go to [https://nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS version** (recommended).
3. After installation, open your terminal and check:

```bash
node -v
npm -v
```

## ⚙️ <b>2. Clone the Project</b>
1. Open Git Bash or Laragon Terminal, navigate to the www directory:
```bash
cd C:\laragon\www
git clone https://github.com/Vennise23/REMS.git
cd REMS
```

## 📦 <b>3. Install Dependencies</b>
Backend (Laravel)
```bash
composer install

```
Frontend (need composer)
```bash
npm install

```

Duplicate .env.example and rename it to .env:
```bash
cp .env.example .env

```
Open .env and edit the database section (default Laragon credentials):
```bash
APP_NAME=EREAL
APP_ENV=local
APP_KEY=base64:xt4c91HRQfDRQIOYv3LZ5muFwhhdtofjiPH7LWFI59s=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

LOG_CHANNEL=stderr
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ereal
DB_USERNAME=root
DB_PASSWORD=
```
## 🗄️ <b>5. Create Database in Laragon</b>

Open Laragon → Click Database

Create a new database called:
```bash
ereal

```
make sure you choose HeidiSQL if you given the selection to choose.

## 🔑 <b>6. Generate Application Key</b>
Go back to vscode terminal:
```bash
php artisan key:generate

```
## 🧱 <b>7. Run Database Migration & Seeders</b>
```bash
php artisan migrate

```
## 🌐 <b>8. Run the Project</b>
Open a new terminel ``` Ctrl ``` + ``` Shift ``` + ``` ` ```
run the vite project
```bash
npm run dev

```
Open another new terminel,
run the laragon backend
```bash
php artisan serve

```
To test chat function, open another new terminel again,
run the schedule which help message work
```bash
php artisan schedule:work

```

Option 1: Laravel built-in server
Visit: http://127.0.0.1:8000 

Option 2: Laragon auto domain

If your project folder is named rems, Laragon will automatically create:
http://rems.test

---
# 🌿 Git Branching Guide for REMS Team

Hey team! 👋  
Here’s how we work together using GitHub — without breaking the `main` branch 😆  

---

## 🧩 1. Create Your Own Branch

> Each person should have their own branch, named after you (e.g., `vennise`, `liz`, `weiyang`, `runshi`).

```bash
# Check what branch you’re currently on
git branch

# Create your own branch
git checkout -b yourname
```
```bash
# Example:
git checkout -b vennise
```

## 📤 2. Push Your Branch to GitHub
```bash
# Add and commit your changes
git add .
git commit -m "Updated my part of the project"

# Push your branch to GitHub
git push origin yourname
```
```bash
# Example:
git push origin vennise
```
## 🔄 3. Keep Your Branch Updated (Pull from Leader’s Branch)
> Before coding each day, make sure your branch is up to date with the leader’s branch!
```bash
# Switch to the leader's branch (e.g., dev or leader)
git checkout leader-branch
```
```bash
# Pull latest updates
git pull origin leader-branch

# Switch back to your own branch
git checkout yourname

# Merge updates from leader into your branch
git merge leader-branch

```
If you see “conflicts”, fix them carefully, then run:
```bash
git add .
git commit -m "Resolved merge conflicts"

```
## 🧠 4. Merge Your Teammate Branch into the Leader’s Branch (FOR LEADER)
> When your work is done, do NOT merge directly to main!
> Merge into the leader’s branch first (e.g., leader or dev).
in terminal:
```bash
git checkout leader-branch
git pull origin leader-branch
git merge yourname
git push origin leader-branch

```
## 🚫 5. Only Leader Commits to main Branch
> Main branch = stable, published version.
> Only your leader (or assigned maintainer) should merge into main.
Team workflow summary:
```css
[ your branch ] → [ leader branch ] → [ main ]
```
---
# 🧠 Tips

1. Use ```bash php artisan migrate:fresh --seed ``` to reset and reseed your database.
2. Use small commits often:
```bash
git add .
git commit -m "Updated form validation"

```
3. Always pull before you start coding.
4. **Never commit directly to main.**
5. Communicate with your team if a merge conflict appears.
---
# 👣 Project Senior Dashboard: Join us to leave a footprint on E-REAL!

> 🌈 **Your lovely friendly senior _Liz Wong_ once said:**  
> 💬 *The project is Laravel plus React — you’ll need two terminals: one for backend (Laravel) and one for frontend (React).*  
> ✨💻🌸🌈💡🦋🌟

> 💬 **Note from Vennise:**  
> Liz has a *special talent* for dropping her personal info right in public places 🫠  
> Don’t worry — I’ve cleaned it up!  
> If you’re curious about what she spilled… just ask me.  
> I promise — I won’t tell you 😉

> 📝 **Note from Wei Yang:**  
> ~~(message deleted by Vennise)~~  
> *Vennise said "I didn't delete such powerful message"*

> 💬 **Message from Runshi 李润石 🇨🇳 (Exchange Student):**  
> “I hope you all have your own life and help those in need around you.” 


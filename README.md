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
---

### ⚙️ <b>2. Clone the Project</b>
1. Open Git Bash or Laragon Terminal, navigate to the www directory:
```bash
cd C:\laragon\www
git clone https://github.com/Vennise23/REMS.git
cd REMS
```
---
### 📦 <b>3. Install Dependencies</b>
Backend (Laravel)
```bash
composer install

```
Frontend (need composer)
```bash
npm install

```
---
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
---
### 🗄️ <b>5. Create Database in Laragon</b>

Open Laragon → Click Database

Create a new database called:
```bash
ereal

```
make sure you choose HeidiSQL if you given the selection to choose.

---

### 🔑 <b>6. Generate Application Key</b>
Go back to vscode terminal:
```bash
php artisan key:generate

```
### 🧱 <b>7. Run Database Migration & Seeders</b>
```bash
php artisan migrate

```
---
### 🌐 <b>8. Run the Project</b>
Open a new terminel ```bash Ctrl ``` + ```bash Shift ``` + ```bash ` ```
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
### 🧠 Tips

Use ```bash php artisan migrate:fresh --seed ``` to reset and reseed your database.

---
### 👣 Project Senior Dashboard: Join us to leave a footprint on E-REAL!

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


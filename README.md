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

---

### 🔹 Install Git
1. Download from: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Install with default settings.

---

### 🔹 Install Composer
1. Go to [https://getcomposer.org/download/](https://getcomposer.org/download/)
2. Download **Composer-Setup.exe** (Windows Installer).
3. Install it — it will automatically detect your PHP path from Laragon.

---

### 🔹 Install Node.js (includes npm)
1. Go to [https://nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS version** (recommended).
3. After installation, open your terminal and check:

```bash
node -v
npm -v

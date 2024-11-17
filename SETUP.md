# Setting Up rookbot on Raspberry Pi 4

This guide walks you through setting up and running rookbot on a Raspberry Pi 4 using Node.js, PM2, and GitHub.

## Step 1: Install and Set Up Raspberry Pi OS

1. **Download Raspberry Pi OS**:
   - Visit the [Raspberry Pi OS website](https://www.raspberrypi.com/software/) and download **Raspberry Pi OS Lite** (minimal, no desktop) or Full version if you prefer a GUI.

2. **Flash the OS to an SD Card**:
   - Use **[Raspberry Pi Imager](https://www.raspberrypi.com/software/)** to flash the OS onto a microSD card. During this process:
     - Go to **Advanced Options** (press `Ctrl+Shift+X` in the Imager) to:
       - Enable SSH.
       - Set the username and password.
       - Configure Wi-Fi (if you're not using Ethernet).

3. **Insert the SD Card and Boot**:
   - Insert the SD card into your Raspberry Pi, connect it to power, and let it boot.
   - If using SSH, find your Pi's IP address (check your router or use a tool like `arp -a`) and connect with:
     ```bash
     ssh <username>@<pi-ip-address>
     ```


---

## Step 2: Update and Install Dependencies

1. **Update the System**:
   - Run:
     ```bash
     sudo apt update && sudo apt upgrade -y
     ```

2. **Install Node.js**:
   - Add the Node.js repository:
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
     ```
   - Install Node.js and npm:
     ```bash
     sudo apt install -y nodejs
     ```

3. **Install Git**:
   - Run:
     ```bash
     sudo apt install -y git
     ```

4. **Install PM2**:
   - PM2 is a process manager to keep rookbot running:
     ```bash
     sudo npm install -g pm2
     ```

---

## Step 3: Clone the rookbot Repository

1. **Navigate to a Working Directory**:
   - For example, in your home folder:
     ```bash
     cd ~
     ```

2. **Clone the rookbot Repository**:
   - Clone your GitHub repository:
     ```bash
     git clone https://github.com/mysterypaintwo/rookbot.git
     ```

3. **Navigate to rookbot's Folder**:
   ```bash
   cd rookbot
   ```

4. **Install the Dependencies**:
- Run:
    ```bash
    npm install
    ```

---

## Step 4: Set Up Environment Variables

1. **Create a `.env` File**:
   - If rookbot uses sensitive tokens, create a `.env` file in the project directory:
     ```bash
     nano .env
     ```
   - Add your variables (e.g.):
     ```env
     TOKEN = the_bot_token
     TEST_GUILD_ID = test_guild_id_goes_here
     DOI_GUILD_ID = doi_guild_id_goes_here
     CLIENT_ID = client_id_goes_here
     ```
   - Save and exit (Ctrl+O, Enter, Ctrl+X).

2. **Ensure Your Code Loads the `.env` File**:
   - Use the `dotenv` library in rookbot:
     ```bash
     npm install dotenv
     ```

---

## Step 5: Run and Test rookbot

1. **Run rookbot Temporarily**:
   - Start rookbot to test:
     ```bash
     node src/index.js
     ```
   - Call menu of commands:
     ```bash
     npm run-script menu
     ```

2. **Run rookbot Persistently with PM2**:
   - Start rookbot with PM2:
     ```bash
     pm2 start src/index.js --name rookbot
     ```
   - Ensure it starts on boot:
     ```bash
     pm2 startup
     pm2 save
     ```

3. **Check rookbot Logs**:
   - View logs if there's an issue:
     ```bash
     pm2 logs rookbot
     ```

---

## Step 6: Push Code Changes from PC to Raspberry Pi

1. **Make Changes on Your PC**:
   - Commit and push updates to the GitHub repository:
     ```bash
     git add .
     git commit -m "Updated bot feature"
     git push
     ```

2. **Pull Changes on the Raspberry Pi**:
   - On the Raspberry Pi, navigate to the rookbot repo's ``root directory`` and pull updates:
     ```bash
     cd ~/rookbot
     git pull
     ```

3. **Restart rookbot**:
   - Restart rookbot with PM2:
     ```bash
     pm2 restart rookbot
     ```

---

# Step 7: Monitor and Maintain

- Use `pm2 list` to monitor running processes.
- Ensure your Raspberry Pi is in a stable environment with proper cooling and power supply for 24/7 operation.

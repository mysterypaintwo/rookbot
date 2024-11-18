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

---

# Using SSH Keys to Clone a Private GitHub Repository on Raspberry Pi

## Step 1: Generate SSH Keys on the Raspberry Pi

1. **Open the Terminal**:
   - If you are logged into your Raspberry Pi, open a terminal.

2. **Generate an SSH Key Pair**:
   - Run the following command:
     ```bash
     ssh-keygen -t ed25519 -C "your_email@example.com"
     ```
   - Replace `"your_email@example.com"` with the email associated with your GitHub account.
   - When prompted:
     - Press **Enter** to save the key in the default location (`/home/pi/.ssh/id_ed25519`).
     - Optionally, enter a passphrase for added security (or press **Enter** to leave it blank).

3. **View the Generated Public Key**:
   - Display the public key:
     ```bash
     cat ~/.ssh/id_ed25519.pub
     ```

4. **Copy the Key**:
   - Select and copy the entire output of the above command.

---

## Step 2: Add the SSH Key to Your GitHub Account

1. **Log in to GitHub**:
   - Open [GitHub](https://github.com) in your browser and log in to your account.

2. **Navigate to SSH Keys**:
   - Go to your **Profile Settings** → **SSH and GPG keys** → **New SSH Key**.

3. **Add the Key**:
   - Title the key (e.g., "Raspberry Pi").
   - Paste the public key you copied earlier into the **Key** field.
   - Click **Add SSH Key**.

---

## Step 3: Test the SSH Connection to GitHub

1. **Test the Connection**:
   - Run the following command on your Raspberry Pi:
     ```bash
     ssh -T git@github.com
     ```
   - You should see a message similar to:
     ```
     Hi <your-username>! You've successfully authenticated, but GitHub does not provide shell access.
     ```

2. **If You Encounter Issues**:
   - Ensure the SSH agent is running and the key is added:
     ```bash
     eval "$(ssh-agent -s)"
     ssh-add ~/.ssh/id_ed25519
     ```

---

## Step 4: Clone the Repository

1. **Clone Using SSH**:
   - Use the SSH URL for the repository. For example:
     ```bash
     git clone git@github.com:mysterypaintwo/rookbot.git
     ```

2. **Navigate to the Repository**:
   - After cloning, move into the repository folder:
     ```bash
     cd rookbot
     ```

3. **Continue with Your Setup**:
   - Install dependencies or follow further instructions specific to your bot.

---

Now you’re ready to securely clone and work with your private GitHub repository on your Raspberry Pi!

# Removing PM2 Script and Bot Files from Raspberry Pi

## Step 1: Stop and Remove the PM2 Script

1. **List Running PM2 Processes**:
   - Run the following command to see all active PM2 processes:
     ```bash
     pm2 list
     ```

2. **Stop the Bot**:
   - Stop the bot process by its name (e.g., `rookbot`) or ID:
     ```bash
     pm2 stop rookbot
     ```

3. **Delete the PM2 Script**:
   - Remove the bot from PM2 management:
     ```bash
     pm2 delete rookbot
     ```

4. **Clear PM2 Saved State**:
   - Ensure PM2 does not restart the bot after reboot:
     ```bash
     pm2 save
     ```

5. **Optional: Uninstall PM2**:
   - If you no longer need PM2, uninstall it:
     ```bash
     sudo npm uninstall -g pm2
     ```

---

## Step 2: Remove the Bot Files

1. **Navigate to the Bot Directory**:
   - Assuming the bot is stored in `~/rookbot`:
     ```bash
     cd ~
     ```

2. **Delete the Bot Directory**:
   - Use the `rm` command to remove the bot files:
     ```bash
     rm -rf rookbot
     ```
   - **Warning**: Ensure you’re in the correct directory before running this command to avoid deleting unintended files.

---

## Step 3: Verify Removal

1. **Check PM2 Processes**:
   - Confirm no bot processes are running:
     ```bash
     pm2 list
     ```

2. **Check for Bot Files**:
   - Verify the `rookbot` directory no longer exists:
     ```bash
     ls ~
     ```

---

Your PM2 script and bot files should now be fully removed. You can proceed with a clean setup afterward!


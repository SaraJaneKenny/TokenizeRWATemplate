# 🧱 RWA Tokenization Template (Algorand)

A **beginner-friendly, end-to-end template** for tokenizing real-world assets (RWAs) on **Algorand testnet** using **Algorand Standard Assets (ASAs)**.

This repository is designed for:
- Founders exploring **RWA proofs-of-concept**
- Builders new to Algorand
- Hackathons, demos, workshops, and early product experiments

No prior blockchain or smart contract experience required. By the end, you’ll have a working tokenized asset with a real Algorand Asset ID.

## ✨ What This Template Gives You

- ✅ Full-stack Algorand project (frontend + backend)
- ✅ Simple ASA creation flow for tokenizing assets
- ✅ Wallet connect (Pera, Defly, Exodus, Lute)
- ✅ Localnet and Testnet support
- ✅ One-command setup using GitHub Codespaces
- ✅ Clean foundation you can extend with compliance, metadata, or DeFi

## 🧠 What “RWA Tokenization” Means Here

This template focuses on the **on-chain token layer** of RWA tokenization:

- Each real-world asset is represented by an **Algorand Standard Asset (ASA)**
- Ownership, supply, and transfers are handled on-chain
- The real-world linkage (documents, custody, legal structure) lives **off-chain**

> ⚠️ This is a **technical proof-of-concept template**, not legal or financial advice.

## 🚀 Getting Started (5 Minutes)

### Option 1: GitHub Codespaces (Recommended)

This is the **fastest and easiest** way to run the project.

### 1️⃣ Fork the repository

Click **Fork** (top-right of this page) to create your own copy.

https://github.com/user-attachments/assets/92e746e1-3143-4769-8a5a-1339e4bd7a14

### 2️⃣ Open in Codespaces

1. Go to your forked repository
2. Click **Code → Codespaces → Create codespace**
3. Wait for the environment to start

> When the Codespace loads, you may see an **“Open Workspace?”** popup in the bottom-right — click **Yes**.

Or manually enter it like below:
<img width="2794" height="1524" alt="image" src="https://github.com/user-attachments/assets/41f25490-1284-4998-b342-27f7a0ffb420" />

### 3️⃣ Configure the frontend environment

1. Navigate to the `frontend` folder
2. Find the file:
`.env.template`
3. Copy **all** of its contents
4. Create a new file called:
`.env`
5. Paste the contents into `.env` and save

### 4️⃣ Run the setup script

In the Codespaces terminal, run:

```bash
bash setup.sh
```
This script will:
- Install dependencies
- Launch the frontend automatically

👉 When it finishes, a web app link will open automatically in Codespaces.

## Pro Tip!
> GitHub Codespaces includes 60 free hours per month.
> Commit your changes regularly to avoid losing progress.

https://github.com/user-attachments/assets/dd452ea1-3070-4718-af34-bea978e208ab

## 🌐 Running the Frontend Again

After running setup.sh once, you have two options whenever you open your codespace if you don't want to run the setup script again:

### Option A: Terminal
```bash
cd frontend
```
then,
```bash
npm run dev
```

### Option B: GitHub UI
You can also start the frontend directly using the GitHub Codespaces UI, which is useful for demos and workshops.

## 🪙 Tokenization Flow (High Level)

This template guides you through the core steps of tokenizing a real-world asset on Algorand using **Algorand Standard Assets (ASAs)**.

### Basic Flow

1. **Connect a wallet**  
   Connect an Algorand wallet (e.g. Pera, Defly, Lute) to interact with the app.

2. **Define your asset parameters**  
   Choose the asset name, unit name, total supply, decimals, and optional metadata.

3. **Create an Algorand Standard Asset (ASA)**  
   The asset is created on-chain and represents your real-world asset digitally.

4. **Receive an Asset ID**  
   Algorand assigns a unique **Asset ID**, which becomes the on-chain identifier for your tokenized asset.

5. **Use or extend the token as your RWA representation**  
   The ASA can now be transferred, held, integrated into apps, or extended with additional logic.

### Advanced Asset Controls (Optional)

ASAs support **advanced management features** commonly used in RWA and compliance-focused setups:

- **Manager**  
  Can update asset configuration or rotate control roles (useful for governance or upgrades).

- **Reserve**  
  Holds uncirculated supply, enabling controlled distribution or staged issuance.

- **Freeze**  
  Can freeze transfers for specific accounts (e.g. during compliance checks or disputes).

- **Clawback**  
  Allows reclaiming tokens from accounts if required (often used for regulatory or recovery scenarios).

> These controls are optional and can be enabled or disabled depending on your use case and trust model.

### What This Enables

This tokenization flow forms the foundation for:

- Fractional ownership of real-world assets
- On-chain asset registries
- Access or entitlement tokens
- Membership or investment models
- Compliance-aware or permissioned asset designs

This template focuses on giving you a **clean, flexible starting point** — you decide how advanced or permissioned your tokenization POC needs to be.

## 🧪 Disclaimer

This repository is provided for **educational and experimental purposes only**.  
It does **not** constitute legal, financial, or investment advice.

Below are videos on:
- How to connect to Testnet on Pera
- How to use the Algo Dispenser
- How to use the USDC Dispenser

**How to connect to testnet on Pera Wallet**

https://github.com/user-attachments/assets/31df8135-119e-4529-9539-4943de979719

**How to use the Algo Dispenser**

https://github.com/user-attachments/assets/643cae10-4673-4b68-8e95-4a3f16fbba60

**How to use the USDC Dispenser**

https://github.com/user-attachments/assets/a76e90fa-97f4-44f8-a7e8-a8ccabd24398


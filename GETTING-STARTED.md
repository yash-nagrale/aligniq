# AlignIQ — Setup Guide (Starting From Scratch)

You have VSCode installed. Follow these steps in order.

---

## STEP 1 — Install Node.js

Node.js lets your computer run JavaScript outside the browser. Next.js needs it.

1. Open your browser and go to: **https://nodejs.org**
2. Click the big **"LTS"** button (the left one — it says "Recommended for most users")
3. Run the downloaded installer
4. Click **Next** on every screen — keep all defaults
5. Click **Finish**

**Verify it worked:**
- Press `Win + R`, type `cmd`, press Enter
- In the black window, type: `node --version`
- You should see something like `v20.11.0`
- Also type: `npm --version` — you should see something like `10.2.4`

> If you see a version number, Node.js is installed correctly. ✓

---

## STEP 2 — Extract the Project

1. Find the `aligniq-project.zip` file you downloaded
2. Right-click it → **Extract All...**
3. Choose a location you'll remember, like `C:\Projects\`
4. Click **Extract**

You should now have a folder called `aligniq` at `C:\Projects\aligniq\`

---

## STEP 3 — Open in VSCode

**Option A — Easiest:**
1. Open the `aligniq` folder in File Explorer
2. Right-click on an empty space inside the folder
3. Click **"Open with Code"** (or "Open in VSCode")

**Option B — From VSCode:**
1. Open VSCode
2. Click **File → Open Folder**
3. Navigate to your `aligniq` folder
4. Click **Select Folder**

---

## STEP 4 — Open the Terminal in VSCode

In VSCode, press `` Ctrl+` `` (the backtick key, top-left of keyboard, under Escape).

A terminal panel opens at the bottom. You should see something like:
```
PS C:\Projects\aligniq>
```

---

## STEP 5 — Install Dependencies

In the VSCode terminal, type this and press Enter:

```
npm install
```

This downloads all the packages the project needs. It takes **1–2 minutes**.
You'll see a lot of text scrolling — that's normal.

When it finishes, you'll see your prompt again and a message like `added 350 packages`.

---

## STEP 6 — Create the Environment File

In the VSCode terminal, type this and press Enter:

```
copy .env.example .env.local
```

> This creates a config file. The app works in demo mode without any changes to it.

---

## STEP 7 — Start the App

In the VSCode terminal, type this and press Enter:

```
npm run dev
```

You'll see:
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
✓ Ready in 2.1s
```

**Open your browser and go to: http://localhost:3000**

The app loads automatically with demo data. No sign-up or login needed.

---

## STEP 8 — Use the App

The sidebar on the left has a **"Demo — Switch Role"** section with 4 users:

| Click this user | To see this experience |
|---|---|
| **Priya Sharma** | Employee — set goals, check-ins, view progress |
| **Rahul Menon** | Employee — different goals, submitted for approval |
| **Deepa Iyer** | Manager — approve goals, view team |
| **Kiran Patel** | Admin/HR — full org view, unlock goals, audit trail |

---

## To Stop the App

In the VSCode terminal, press **Ctrl + C**, then press **Y** and Enter.

## To Start Again Later

Open VSCode, open the terminal (`` Ctrl+` ``), and run:
```
npm run dev
```

---

## If You Get an Error

### "npm is not recognized"
→ Node.js isn't installed. Go back to Step 1.

### "Cannot find module" or similar
→ Run `npm install` again.

### "Port 3000 is already in use"
→ Another app is using that port. Run:
```
npm run dev -- -p 3001
```
Then open http://localhost:3001 instead.

### "node_modules not found"
→ You're in the wrong folder. Make sure your terminal shows `aligniq>` at the start of the line.

---

## Optional: Add AI Features (Gemini)

The AI features (SMART Goal Enhancer, KPI Suggestions, Performance Summary) work in demo mode without any API key — they show realistic sample responses.

To enable **live AI responses**:

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with a Google account
3. Click **"Create API Key"**
4. Copy the key
5. Open `.env.local` in VSCode
6. Replace `your-gemini-api-key-here` with your key:
   ```
   GEMINI_API_KEY=AIza...your-actual-key...
   ```
7. Save the file (Ctrl+S)
8. Stop the server (Ctrl+C) and restart it (`npm run dev`)

---

## Optional: Use a Real Database (Supabase)

By default, all data is in-memory and resets on refresh. To use a real database:

1. Go to https://app.supabase.com and create a free account
2. Create a new project
3. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → click **Run**
4. Go to **Project Settings → API** and copy:
   - Project URL
   - Anon key
   - Service role key
5. Open `.env.local` and fill in those values
6. Restart the server

---

## Windows Shortcuts (Alternative to Terminal)

If you prefer not to use the terminal, double-click these files in the `aligniq` folder:

| File | What it does |
|---|---|
| `SETUP.bat` | Installs dependencies automatically |
| `START-APP.bat` | Starts the app and opens your browser |

---

## Project Files Reference

```
aligniq/
├── SETUP.bat              ← Double-click to install (Windows)
├── START-APP.bat          ← Double-click to start (Windows)
├── .env.example           ← Template for config
├── .env.local             ← Your actual config (created in Step 6)
├── package.json           ← Project info and scripts
├── supabase/
│   └── schema.sql         ← Database schema (paste into Supabase)
├── src/
│   ├── app/               ← All pages
│   ├── components/        ← Reusable UI pieces
│   └── lib/               ← Logic (store, AI, progress engine)
└── README.md              ← Full technical documentation
```

---

## Summary — Minimum Commands to Run the App

```bash
npm install          # Do this once
copy .env.example .env.local   # Do this once  
npm run dev          # Do this every time you want to open the app
```

Then open **http://localhost:3000** in your browser.

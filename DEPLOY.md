# Putting STEMQuest online

STEMQuest is now one Node app: the website + a small server that stores accounts and progress (SQLite file in `data/`).

## Try it with friends on the same Wi-Fi (quick demo)
1. `npm run dev`
2. Find your computer's IP (Windows: `ipconfig`, look for IPv4, e.g. 192.168.1.20).
3. On the other device open `http://192.168.1.20:5173`. (Allow Node through the Windows firewall if asked.)
Accounts are stored on YOUR computer, so it only works while your PC is on.

## Real hosting (anyone, anywhere)
Use a host that runs Node and has a **persistent disk** (otherwise accounts vanish on every restart):
- **Render** (Web Service + Disk), **Railway** (Volume) or **Fly.io** (Volume).
- Build command: `npm install && npm run build`   Start command: `npm start`
- Environment variables:
  - `TEACHER_CODE` = a secret code only teachers know (REQUIRED to change from the default `teacher123`)
  - `DATA_DIR` = the disk's mount path, e.g. `/var/data`
  - `NODE_VERSION` = `22`
- Free tiers without a disk lose all accounts when they restart. For a real school rollout move the database to a managed Postgres.

## Before using with real students
Schools need a privacy review (Ontario: MFIPPA/PIPEDA). STEMQuest only stores a made-up username, a hashed password and game progress. No real names or emails.

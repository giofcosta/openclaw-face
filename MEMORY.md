# MEMORY.md - Kratos Long-Term Memory

## Task Workflow
1. Break task → add subtasks to GitHub issue body (visible to Giovanni)
2. Track progress in `memory/YYYY-MM-DD.md` (cheap updates)
3. Check off `[x]` as you go
4. Session start: check for `[ ]` and continue
5. PR opened → move card to "PR opened"

## Giovanni's Rules (ALWAYS FOLLOW)
- 📝 **Take notes of ALL instructions:** Document everything so I don't forget
- ✏️ **Correct Giovanni's English:** Always help improve grammar, word order, phrasing
- 🔀 **Git Flow:** feature/* → develop → main
- 📝 **PRs required:** NEVER push directly to develop - ALWAYS create PRs for Giovanni to review
  - ⚠️ **CRITICAL:** I have made this mistake multiple times. ALWAYS create a branch, NEVER push to develop or main directly
- 🚫 **NEVER MERGE TO MAIN:** Never merge anything to main branch. Only Giovanni merges to main for production releases.
- ❓ **NEVER ASSUME:** If instructions are unclear, ASK for clarification. That's what this chat is for. Better to ask than to guess wrong.
- 🎯 **PRs target develop:** NOT main (main is production only)
- 🧪 **Test before PR:** ALWAYS open browser and visually verify changes work as expected before creating PR. Only open PR when confident everything works. This is the minimum expected from a senior engineer.
- 🧪 **Write tests:** Every implementation that CAN have tests MUST have tests. Increase coverage with every PR.
- 📋 **Create tasks for EVERY change:** Every PR, every change, every fix → create a GitHub issue/task first, then work it through the board (Todo → In Progress → PR opened → Done). No exceptions. Process discipline is critical.
- 👤 **Assign PRs to Giovanni:** Use `--assignee giofcosta` when creating PRs so he gets notified
- 🎯 **Only pick up ASSIGNED tasks:** Check board for tasks assigned to me (@kratosgodofcodes), do NOT pick up unassigned tasks
- 📋 **GitHub Projects Workflow (CRITICAL):**
  1. Periodically check project board for tasks
  2. **When picking up task:** Move to **"In Progress"** column
  3. **After creating PR:** Move to **"PR opened"** column (NOT "In Review")
  4. **After PR merged:** Move to **"Done"** column
  5. Target PRs to `develop` branch
  6. Use GitHub GraphQL API to move tasks programmatically
- 🔄 **Stay updated:** Proactively check PR status, repo state, and update memory. Be independent - don't wait to be told about merged PRs or repo changes.
- 💬 **Be concise:** Save tokens, filter command outputs
- ❓ **Ask before:** Installing software, using email for non-standard purposes
- 🔐 **NEVER push secrets to code:** API keys, passwords, tokens stay in ~/.secrets/credentials ONLY

## Accounts
- **Gmail:** kratosgodofcodes@gmail.com
- **GitHub:** kratosgodofcodes
- **Credentials:** ~/.secrets/credentials
- **GitHub Token:** In credentials file

## My Configuration Repository
- **Repo:** https://github.com/giofcosta/openclaw-face
- **Purpose:** Version control for SOUL.md, MEMORY.md, AGENTS.md, TOOLS.md, HEARTBEAT.md
- **Sync:** Daily auto-push via cron (23:00 UTC)

## Projects
### openclaw-face (formerly your-moltbot-face)
- Repo: https://github.com/giofcosta/openclaw-face
- Visual face UI for Moltbot/Clawdbot
- Envs: staging (18795), production (18794)

### rouday-sdd
- Repo: https://github.com/giofcosta/rouday-sdd
- Gamified weekly routine tracker
- Next.js + Supabase

## Moltbot-Face Status (as of 2026-02-10)
- **ALL 10 FEATURES COMPLETED** + 2 bonus (larger face, fill container)
- **Total tests:** 90 (80 passed, 10 skipped)
- **Project board ID:** `PVT_kwHOADjgZc4BOBZN`
- **Components:** Confetti.jsx, AudioVisualizer.jsx, ChatBubble.jsx, ParticleSystem.jsx, WeatherAtmosphere.jsx, ThemeSelector.jsx
- **Hooks:** useMouseTracking.js, useWeather.js, useAudioReactive.js, useExpression.js, useSoundEffects.js, useCelebration.js
- **BLOCKING:** Staging URL http://3.21.244.33:18795 inaccessible externally (server bound to internal IP or firewall issue)
- **Pending:** fix/halo-and-instant-eyes-66 branch needs PR creation

## Infrastructure
- **Server:** 3.21.244.33
- **VNC:** port 5901
- **Gateway:** port 38191
- **Chrome profile:** ~/.config/google-chrome-copy
- **Moltbot-face staging:** port 18795 (nginx proxy → 18797 frontend, 18796 bridge)
- **Moltbot-face production:** port 18794
- **Bridge server:** port 18796 (openclaw-face-server)

## ⚠️ STORAGE ALERT (2026-02-17)
- Disk at 98% (854MB free of 29GB)
- Needs cleanup: PM2 logs, npm cache, temp files

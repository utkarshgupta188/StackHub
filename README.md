# StackHub: Your Developer Stack. One Hub.

StackHub is a premium, plugin-based developer command center designed to aggregate dashboards, commands, settings, and notifications from tools like GitHub, AWS, and Docker Desktop. By connecting directly to your active developer infrastructure, StackHub eliminates context switching between multiple local and remote developer tools.

---

## 🚀 Key Features

### 1. Raycast-Inspired Command Palette (`Ctrl+K` / `Cmd+K`)
- Spotlight-style developer overlay supporting keyboard-controlled arrow key navigation.
- Category headers grouping "GitHub", "AWS", "Docker", and "System" commands.
- Autocomplete search index that dynamically compiles action hooks.
- Custom keystroke shortcut badges with instant execution indicators.

### 2. Real Docker Desktop Integration
- **Zero Mocking**: Queries your actual local Docker daemon using spawned child processes (`docker ps`, `docker images`).
- **Container Controller**: Start, stop, pause, or restart active container states directly from your dashboard grid.
- **Log Stream Terminal**: Features a beautiful retro-style green console terminal window that streams actual live logs directly from your running local container processes.
- **Auto-Detection Alert**: Displays setup instructions if the local Docker Desktop daemon is closed.

### 3. Real GitHub API REST Gateway
- **GitHub HTTP Gateway**: Communicates directly with the official GitHub servers using your Personal Access Token (PAT).
- **Repositories Browser**: Lists your actual repositories, open issues, and language scopes.
- **Pull Requests Manager**: Tracks open pull requests, review states, branch details, and merges them securely via API token.
- **Commit Diff Inspector**: Streams and renders actual line-by-line file changes (`+` additions in green, `-` deletions in red) for commit logs.

### 4. AWS Billing & compute controller
- **Compute Monitor**: Active grids showing machine types, regions, and IP states of EC2 instances.
- **Billing Recharts**: Vibrant gradient area charts outlining estimate costs by service sectors (EC2, S3, RDS).

---

## 🛠️ Technology Stack

- **Framework**: Next.js App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla HSL theme configuration
- **Charts**: Recharts Vector Canvas
- **Database**: Local server-side persistent JSON Store (`stackhub_db.json`)
- **APIs**: REST API App Router Gateways

---

## 📦 Getting Started

### 1. Install Dependencies
Initialize libraries and styling supports:
```bash
npm install
```

### 2. Run the Development Server
Launch the compiler:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 3. Connection Setup
- **GitHub**: Navigate to **Extensions** in your sidebar navigation, choose **GitHub**, and paste your Personal Access Token (PAT).
- **Docker**: Start your local **Docker Desktop** application. The dashboard will automatically transition from the config alert screen to listing your active running container pools!
- **AWS**: Configure your AWS Access keys under the **AWS** preference options.

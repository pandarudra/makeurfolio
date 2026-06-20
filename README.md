# 🚀 makeurfolio

**makeurfolio** is a modern, AI-powered platform that automatically generates recruiter-ready developer portfolio websites directly from a GitHub profile and/or a Resume (PDF or DOCX). 

It features a premium Notion/Linear-inspired editor, seamless authentication, and a scalable multi-theme architecture, allowing developers to spin up stunning portfolios in seconds without writing a single line of code.

---

## ✨ Key Features

- **🪄 AI-Powered Generation**: Extracts and standardizes data from GitHub APIs and Resume parsing (using `pdf-parse` & `mammoth`) via Google's Gemini (`gemini-2.5-flash`).
- **⚡ Frictionless Onboarding**: Users can upload resumes and input their GitHub handles *before* signing up. State is seamlessly stashed in `IndexedDB` and restored post-authentication.
- **🎨 Multi-Theme Architecture**: A highly scalable, CMS-like registry system that completely separates content from presentation. Themes (like *Minimal Editorial*, *Raycast*, etc.) are pure presentation components.
- **📝 Premium Portfolio Editor**: A Notion/Linear-inspired editor interface featuring sticky navigation, smooth scroll-spy, and complete Drag-and-Drop (DnD) reordering for experiences, education, projects, skills, and more.
- **🔐 Robust Authentication**: Powered by [Better Auth](https://better-auth.com/), supporting Google OAuth and Email OTP with secure session management.
- **🗄️ Relational Database**: Complex, nested relational data management using PostgreSQL and Prisma ORM.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better Auth
- **AI Integration**: Google Gemini API (`@google/genai`)
- **State/Storage**: IndexedDB (`idb-keyval`) for client-side stash, `@dnd-kit` for drag-and-drop.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/makeurfolio.git
cd makeurfolio
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory based on `.env.example`. You will need the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/makeurfolio"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# APIs
GITHUB_TOKEN="your-github-personal-access-token"
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 4. Database Setup
Push the Prisma schema to your PostgreSQL database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server
```bash
pnpm dev
```
Navigate to `http://localhost:3000` to see the application in action.

---

## 🏗️ Architecture Overview

The backend follows a strictly isolated layer architecture to maintain clarity and scalability:
1. **Modules (`src/modules/*`)**: Domain-driven modules (`github`, `resume`, `ai`, `portfolio`, `generation`) handle specific bounded contexts.
2. **Synchronous Execution Pipeline**: To prevent background task termination on serverless environments (like Vercel), the generation pipeline runs synchronously with client-side polling (`/api/portfolio/generation/[id]`) for a premium visual loading experience.
3. **Data Mapping**: Gemini AI outputs a heavily validated JSON schema (using Zod) which is mapped directly into Prisma's nested relational structure.

---

## 🎨 Theme Development

`makeurfolio` uses a registry-based multi-theme architecture. To create a new theme:
1. Create a folder in `src/themes/<theme-id>/`.
2. Implement a default-exported component that accepts `PortfolioThemeProps`.
3. Add metadata to `src/themes/theme-manifest.ts`.
4. Register the component in `src/themes/registry.ts`.
*Note: Themes are strictly presentational and must never fetch data directly.*

---

## 📜 License

This project is licensed under the MIT License.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# makeurfolio — Backend Architecture

## Overview
makeurfolio automatically generates recruiter-ready developer portfolio websites from a GitHub profile and/or a Resume (PDF or Word DOCX). 
The backend handles fetching data from GitHub, parsing text from resumes (PDFs and DOCX files), passing this context to Gemini AI for structured extraction, and saving the result to a PostgreSQL database via Prisma.

## Architecture Principles
1. **Isolated Layers**: Route handlers delegate to services, services orchestrate logic, repositories talk to Prisma, mappers transform data boundaries.
2. **AI Constraints**: The LLM NEVER generates database entities or Prisma schemas. It strictly outputs a normalized business profile (`NormalizedProfile` schema) validated by Zod.
3. **No Auth (Yet)**: All endpoints are open and `userId` on portfolios is nullable. Authentication can be slotted in via middleware later.
4. **Synchronous Execution (MVP)**: Generation runs synchronously in-band during the POST request to avoid background task termination on serverless hosts like Vercel.

## Core Modules

### 1. `src/modules/github`
Fetches a user's GitHub profile and repositories. Minimizes API calls by fetching repos in bulk, applying a quality filter, scoring the candidates based on metrics (stars, forks, recent activity, README existence), and fetching detailed language stats ONLY for the top 5 repos.

### 2. `src/modules/resume`
Uses `pdf-parse` (for PDFs) and `mammoth` (for DOCX Word documents) to extract plain text from a resume buffer. The file binary never leaves this module and is never sent to the LLM.

### 3. `src/modules/ai`
Defines the `NormalizedProfile` Zod schema and system prompts. Calls Gemini (`gemini-2.5-flash`) with structured output configuration. Includes retry logic for Zod schema validation failures. Strict anti-hallucination prompts are enforced.

### 4. `src/modules/portfolio`
Contains `portfolio.mapper.ts` for translating the AI output + GitHub data into Prisma's nested create structure. Handles slug generation, enum mapping for skills, and project attribution. `portfolio.repository.ts` ensures atomic database writes.

### 5. `src/modules/generation`
Orchestrates the entire pipeline. Deduplicates projects via `project-merge.service.ts` between GitHub and Resume inputs. Updates the `PortfolioGeneration` status tracking model during the synchronous run.

## API Endpoints

All API endpoints return consistent, structured JSON responses. Error responses follow a standard structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message describing the failure",
    "statusCode": 400
  }
}
```

---

### 1. `GET /api/health`
*Utility endpoint to verify application and database connection health.*

#### Payload / Parameters
* **Method**: `GET`
* **Body/Query Parameters**: None

#### What it does
1. Executes a quick database connectivity ping using Prisma's `$queryRaw` running `SELECT 1`.
2. Inspects process status to fetch application uptime.
3. If database query fails, responds with an unhealthy code (`503`).

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-06-01T21:26:40.123Z",
      "uptime": 234.56,
      "database": "connected"
    }
  }
  ```
* **Failure (`503 Service Unavailable`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "HEALTH_CHECK_FAILED",
      "message": "Database query failed...",
      "statusCode": 503,
      "details": {
        "database": "disconnected"
      }
    }
  }
  ```

---

### 2. `POST /api/portfolio/generate`
*Triggers the portfolio generation pipeline by merging GitHub and/or Resume (PDF/DOCX) inputs.*

#### Payload / Parameters
* **Method**: `POST`
* **Headers**: `Content-Type: multipart/form-data`
* **Body Fields**:
  * `githubUsername` (string, *optional*): The developer's GitHub username to parse repositories and public profile.
  * `resume` (file, *optional*): A PDF or Word document (.docx) Resume upload to parse text.
    * *Note: At least one of `githubUsername` or `resume` must be provided.*
  * `portfolioName` (string, *required*): The target name of the portfolio (e.g. `Utkal's Dev Space`).

#### What it does
1. Validates inputs, ensuring either a GitHub username is present or a PDF/DOCX file is attached.
2. Synchronously executes the full processing pipeline to prevent background serverless functions from getting terminated prematurely on platforms like Vercel:
   - Tracks state using `PortfolioGeneration` database records (starting with `QUEUED`).
   - **GitHub Parsing**: Bulk fetches repos, scores them based on activity and quality, and fetches readme + languages only for the top 5 candidates.
   - **Resume Parsing**: Extracts text from PDF files (using `pdf-parse`) or Word document DOCX files (using `mammoth`).
   - **Deduplication**: Merges projects matching similarity thresholds or identical names using `ProjectMergeService`.
   - **AI Extraction**: Converts merged information into a standardized profile schema utilizing Google Gemini `gemini-2.5-flash` with JSON output schemas and validation retry loops.
   - **Mapping**: Translates Gemini schemas into relational models, generating a unique slug for the portfolio.
   - **Persistence**: Atomic write of the fully structured portfolio (experience, skills, projects, certifications, etc.) to PostgreSQL.

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "generationId": "cuid-string-for-tracking",
      "portfolioSlug": "generated-portfolio-slug"
    }
  }
  ```
* **ValidationError (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Either githubUsername or resume is required",
      "statusCode": 400
    }
  }
  ```
* **Internal Server Error (`500 Internal Server Error`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "GEMINI_ERROR",
      "message": "Failed to parse structured JSON from Gemini API",
      "statusCode": 500
    }
  }
  ```

---

### 3. `GET /api/portfolio/generation/[id]`
*Retrieves the status of a specific portfolio generation job.*

#### Payload / Parameters
* **Method**: `GET`
* **Path Parameters**:
  * `id` (string, *required*): The `generationId` returned by `/api/portfolio/generate`.

#### What it does
1. Queries the PostgreSQL database for the `PortfolioGeneration` entry matching the CUID.
2. Calculates progress percentage based on current pipeline status (ranging from `0` to `100`).
3. Returns status indicators along with the final portfolio ID and slug if the generation is completed.

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "generationId": "cuid-string",
      "status": "COMPLETED", // QUEUED | FETCHING_GITHUB | PARSING_RESUME | GENERATING_PROFILE | COMPLETED | FAILED
      "progress": 100, // Numeric progress value (0, 20, 50, 80, 100)
      "portfolioId": "portfolio-cuid-string", // null if not completed
      "portfolioSlug": "generated-slug", // null if not completed
      "errorMessage": null // string describing failure if status is FAILED
    }
  }
  ```
* **NotFound (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Generation not found",
      "statusCode": 404
    }
  }
  ```

---

### 4. `GET /api/portfolio/[slug]`
*Retrieves the complete portfolio profile data including all related entities.*

#### Payload / Parameters
* **Method**: `GET`
* **Path Parameters**:
  * `slug` (string, *required*): The unique slug for the portfolio (e.g. `utkal`).

#### What it does
1. Queries PostgreSQL for the portfolio with the matching `slug`.
2. Includes and joins all relations (`experiences`, `educations`, `skills`, `projects`, `certifications`, `achievements`).
3. Groups and formats the response structure suitable for portfolio page rendering.

#### Returns
* **Success (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "portfolio-id-string",
      "slug": "utkal",
      "name": "My Portfolio",
      "fullName": "John Doe",
      "headline": "Senior Full-Stack Engineer",
      "bio": "Building high-performance software systems...",
      "email": "john@doe.dev",
      "phone": "+123456789",
      "location": "San Francisco, CA",
      "avatarUrl": "https://avatars.githubusercontent.com/u/...",
      "linkedinUrl": "https://linkedin.com/in/...",
      "githubUrl": "https://github.com/...",
      "twitterUrl": null,
      "websiteUrl": null,
      "summary": "AI generated profile summary...",
      "experiences": [
        {
          "id": "experience-id",
          "company": "Tech Corp",
          "role": "Lead Engineer",
          "startDate": "2023-01-01T00:00:00.000Z",
          "endDate": null,
          "currentlyWorking": true,
          "description": "Led development of core features..."
        }
      ],
      "educations": [
        {
          "id": "education-id",
          "institution": "Stanford University",
          "degree": "B.S.",
          "fieldOfStudy": "Computer Science"
        }
      ],
      "skills": [
        {
          "id": "skill-id",
          "name": "TypeScript",
          "category": "LANGUAGE"
        }
      ],
      "projects": [
        {
          "id": "project-id",
          "title": "makeurfolio",
          "description": "AI generator...",
          "githubUrl": "https://github.com/...",
          "techStack": ["Next.js", "TypeScript", "Prisma"]
        }
      ]
    }
  }
  ```
* **NotFound (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Portfolio not found",
      "statusCode": 404
    }
  }
  ```


## Logging and Errors
- `src/lib/logger.ts`: Structured console logger with timing metrics.
- `src/lib/errors.ts`: Typed error hierarchy (`ValidationError`, `GithubError`, `GeminiError`, etc.). Route handlers map these to correct HTTP status codes.

## Dependencies
- `zod` for validation
- `pdf-parse` & `mammoth` for text extraction (PDFs & DOCX files)
- `@google/genai` for structured generation
- Prisma ORM with `@prisma/adapter-pg`

## Configuration
Requires `DATABASE_URL`, `GITHUB_TOKEN` (for higher rate limits), and `GEMINI_API_KEY`. Validated on startup via `src/lib/env.ts`.

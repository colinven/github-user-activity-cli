# GitHub User Activity CLI

A Node.js command-line tool that fetches and displays a GitHub user's recent public activity using the GitHub Events API. Activity is grouped, deduplicated, and printed as clean, readable messages.

---

## Features

- Fetches recent public events for any GitHub username
- Supports the following event types:
  - `PushEvent` — commits pushed to a repo
  - `PullRequestEvent` — pull requests opened, closed, merged, etc.
  - `PullRequestReviewEvent` — pull request reviews
  - `IssuesEvent` — issues opened, closed, etc.
  - `CreateEvent` — repositories, branches, or tags created
  - `DeleteEvent` — branches or tags deleted
  - `WatchEvent` — repositories starred
  - `DiscussionEvent` — discussions created
- Deduplicates and groups repeated actions into a single summary line (e.g. "User pushed 4 commit(s) to repo/name")
- Optional GitHub personal access token support for higher API rate limits
- Can be run as a global CLI command via `npm install -g`

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher (uses native `fetch`)

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/colinven/github-user-activity-cli.git
cd github-user-activity-cli
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up your environment variables**

```bash
cp .env.example .env
```

Open `.env` and add your GitHub personal access token:

```
GITHUB_TOKEN=your_personal_access_token_here
```

> **Note:** The token is optional but recommended. Without one, the GitHub API limits unauthenticated requests to **60/hour**. With a token, you get **5,000/hour**.  
> Generate one at: [GitHub → Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens). No special scopes are needed for public activity.

---

## Usage

### Run directly with Node

```bash
node app.js 
```

### Or install globally and use the `github-activity` command

```bash
npm install -g .
github-activity 
```

**Example:**

```bash
node app.js torvalds
```

**Sample Output:**

```
- User pushed 3 commit(s) to torvalds/linux.

- User opened 1 pull request(s) in torvalds/linux.

- User starred colinven/github-user-activity-cli.

- User created a new branch "feature/fix" in torvalds/linux.
```

If the user has no recent public activity, the tool prints:

```
No recent activity.
```

---

## Project Structure

```
github-user-activity-cli/
├── app.js            # All CLI logic (fetch, parse, format, print)
├── .env.example      # Template for environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## How It Works

The tool is organized into a simple pipeline of functions:

### 1. `fetchUserData(username)`
Makes a GET request to `https://api.github.com/users/{username}/events`, passing the GitHub token as a Bearer token in the `Authorization` header if present. Returns the extracted event data.

### 2. `extractData(array)`
Maps over the raw API response and pulls out only the relevant fields from each event:
- `eventType` — the type of GitHub event (e.g. `PushEvent`)
- `repo` — the repository name
- `ref_type` — branch, tag, or repository (for Create/Delete events)
- `ref` — the specific ref name
- `action` — the action taken (e.g. opened, closed)

### 3. `countDuplicates(array)`
Groups identical events together using `JSON.stringify` as a map key and counts occurrences. Returns an array of `[eventObject, count]` pairs so repeated actions can be summarized (e.g. multiple pushes to the same repo become one line).

### 4. `constructMessages(array)`
Uses a `switch` statement to turn each `[eventObject, count]` pair into a human-readable string with the duplicate count embedded (e.g. `"User pushed 5 commit(s) to repo/name."`).

### 5. `printMessages(formattedArray)`
Prints each message to the terminal with spacing between lines. Falls back to `"No recent activity."` if the array is empty.

---

## Environment Variables

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `GITHUB_TOKEN` | Optional | GitHub personal access token for authenticated API requests |

---

## Dependencies

| Package  | Purpose                              |
|----------|--------------------------------------|
| `dotenv` | Loads `GITHUB_TOKEN` from `.env` file |

Node's built-in `fetch` is used for all HTTP requests — no additional HTTP library needed.

---

## Error Handling

- Non-2xx HTTP responses throw an error with the status code (e.g. `404` for unknown users, `403` for rate limit exceeded)
- Network/fetch failures are caught and logged via `console.error`

---

## Roadmap

- [ ] Add a `--limit` flag to control the number of events shown
- [ ] Filter by event type with a `--type` flag
- [ ] Add color-coded terminal output with a library like `chalk`
- [ ] Support JSON output with a `--json` flag

---

## Author

**Colin Venancio** — [github.com/colinven](https://github.com/colinven)

---

## License

ISC
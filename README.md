# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1d232858-c0eb-48f9-bae6-aa3be4d20038

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1d232858-c0eb-48f9-bae6-aa3be4d20038) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1d232858-c0eb-48f9-bae6-aa3be4d20038) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Supabase Functions (Admin)

This project includes two Supabase Edge Functions used by the admin UI to list users and toggle a user's banned state:

- `supabase/functions/list-users` — returns a JSON list of users (uses the Supabase Admin API).
- `supabase/functions/toggle-user` — POST endpoint to set `is_banned` in a user's metadata.

Required environment variables for running/deploying the functions:

- `SUPABASE_URL` — your Supabase project URL (e.g. `https://xyzcompany.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key (keep this secret; used by the functions to call admin APIs).

Frontend configuration (local development):

- Add `VITE_SUPABASE_FUNCTIONS_URL` to your local Vite `.env` file to point to your functions origin.
	- For local development with the Supabase CLI use: `VITE_SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1`
	- When deployed, set it to your project functions URL (e.g. `https://<project>.functions.supabase.co`).

Running functions locally (requires the Supabase CLI):

```powershell
# Serve functions locally (from repo root)
supabase functions serve
```

Deploying functions to Supabase:

```powershell
# Build and deploy a single function
supabase functions deploy list-users --project-ref <your-project-ref>
supabase functions deploy toggle-user --project-ref <your-project-ref>
```

Notes and security

- These functions require the service role key — do NOT expose this key to the browser or commit it to source control.
- The admin UI in `src/pages/Admin.tsx` forwards requests to these functions; the UI uses a client-side check for `is_admin` but you must enforce server-side checks in the functions or other server APIs for true security.
- After changing `.env` variables, restart the Vite dev server.


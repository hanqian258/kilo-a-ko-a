# Kilo a Ko'a Deployment Guide

This project is a Progressive Web App (PWA) built with React and Vite. Since it relies entirely on local storage and has no backend server, it can be deployed as a static site to any static hosting provider.

## Build the Project

Before deploying, you can test the production build locally:

1.  Open a terminal in the project root.
2.  Run the build command:
    ```bash
    npm run build
    ```
3.  This will create a `dist/` folder containing the optimized application.
4.  (Optional) Preview the build:
    ```bash
    npm run preview
    ```

---

## Option 1: Deploy to Netlify (Recommended)

Netlify is excellent for PWAs and offers free static hosting.

### Method A: Drag & Drop (Easiest)
1.  Run `npm run build` in your project folder.
2.  Go to [app.netlify.com](https://app.netlify.com).
3.  Log in or Sign up.
4.  Drag the `dist` folder (created in step 1) into the "Drag and drop your site folder here" area.
5.  Your site is now live!

### Method B: Connect to Git (Automatic Updates)
1.  Push your code to GitHub, GitLab, or Bitbucket.
2.  Go to [Netlify](https://netlify.com) and click "Add new site" -> "Import from Git".
3.  Select your repository.
4.  Netlify will detect the settings automatically:
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
5.  Click "Deploy site".

---

## Option 2: Deploy to Vercel

Vercel is the creators of Next.js and offers a very fast global edge network.

1.  Push your code to GitHub, GitLab, or Bitbucket.
2.  Go to [vercel.com](https://vercel.com) and log in.
3.  Click "Add New..." -> "Project".
4.  Import your repository.
5.  Framework Preset should be detected as **Vite**.
6.  Ensure the settings are:
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
7.  Click "Deploy".

---

## Option 3: GitHub Pages

1.  Update `vite.config.ts` to set the base path if you are not using a custom domain (e.g., `base: '/repo-name/'`).
2.  Install the `gh-pages` package:
    ```bash
    npm install gh-pages --save-dev
    ```
3.  Add a deploy script to `package.json`:
    ```json
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist"
    }
    ```
4.  Run `npm run deploy`.

## Post-Deployment Checklist

1.  **PWA Check:** Open the deployed site on a mobile device. Check if the "Add to Home Screen" prompt appears or if you can install it manually from the browser menu.
2.  **Offline Check:** Load the site, then turn on Airplane Mode. Refresh the page. It should still load.
3.  **Data Persistence:**
    *   Go to the "Profile" page.
    *   Go to the "Data Management" tab.
    *   Test the **"Survey Responses"** and **"Growth Journals"** export buttons to ensure you can retrieve your data.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kilo a Ko'a - Coral Conservation PWA

A Progressive Web App (PWA) for community-based coral reef monitoring, designed for the Kahalu‘u region. This app allows users to track coral health, access educational resources (CEST), and participate in conservation efforts.

## Features

*   **Offline Capable:** Works without an internet connection (caches resources and data).
*   **Data Persistence:** User sessions, gallery uploads, and edits are saved locally on your device.
*   **PWA Installable:** Installable as a native-like app on Android, iOS, and Desktop.
*   **Privacy Focused:** No external AI dependencies or tracking.

## Run Locally

**Prerequisites:**  Node.js

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your browser.

## How to Install (PWA)

This application is a Progressive Web App. You can install it on your device for a full-screen, app-like experience.

### **Desktop (Chrome/Edge)**
1.  Open the app in your browser.
2.  Look for the **Install icon** (monitor with a down arrow) in the right side of the address bar.
3.  Click **Install**.

### **iOS (iPhone/iPad)**
1.  Open the app in **Safari**.
2.  Tap the **Share** button (square with arrow up).
3.  Scroll down and tap **Add to Home Screen**.

### **Android**
1.  Open the app in **Chrome**.
2.  Tap the **menu** (three dots).
3.  Tap **Install App** or **Add to Home Screen**.

## Build for Production

To create a production build (required for the Service Worker to fully function):

```bash
npm run build
npm run preview
```

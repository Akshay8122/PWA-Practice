# PWA

PWA is a Progressive Web Application (PWA) built with React, designed to deliver a fast, reliable, and engaging user experience. This project implements various advanced PWA features, including service workers, advanced caching strategies, IndexedDB, background sync, web push notifications, and access to native device features like camera and file uploads.

## Features

- **Web App Manifest**: Provides metadata to enable the app to be installed on users' devices and appear like a native app.
- **Service Worker**: Enables offline capabilities and advanced caching strategies.
- **Promise and Fetch**: Handles network requests with fetch and provides a clean API interface.
- **Caching Strategies**: Implements basic and advanced caching strategies using Workbox.
- **IndexedDB**: Stores dynamic data in the browser with IndexedDB for offline access.
- **Background Sync**: Ensures requests are sent even when the app is offline, once the network is restored.
- **Web Push Notifications**: Allows sending notifications to users even when the app is not open.
- **Native Device Features**: Accesses native features such as camera and file uploads.
- **Workbox**: Utilizes Workbox for simplifying service worker development.

## Promise and Fetch

The fetch API is used extensively throughout this project to handle network requests. fetch is built on top of JavaScript Promises, making it a powerful and flexible way to work with asynchronous operations, especially when interacting with APIs.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or above)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Akshay8122/PWA-Practice
   ```

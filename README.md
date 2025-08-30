# VibeWallz

VibeWallz is an **AI-powered wallpaper generator** that lets users create, explore, and save stunning wallpapers.
Built with **Node.js, Express.js, MongoDB, EJS, Bootstrap, and Vanilla JavaScript**, it follows the **MVC design pattern** for clean and scalable architecture.

---

## 🚀 Features

- 🔑 **Authentication** – Local login/signup & Google OAuth with Passport.js.
- 🖼 **AI Wallpaper Generation** – Generate wallpapers with Google GenAI.
- ☁️ **Image Hosting** – Cloudinary integration for uploads and storage.
- 💳 **Payments** – Razorpay test mode integration.
- 🛡 **Security & Performance** – Session management, input validation, and rate limiting.
- 📱 **Responsive UI** – Designed with Bootstrap for all screen sizes.

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, Bootstrap, EJS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: Passport.js (Local & Google OAuth 2.0)
- **Storage**: Cloudinary
- **Payments**: Razorpay

---

## 📂 Project Structure

The project follows **MVC architecture**:

```
VibeWallz/
│── controllers/     # Route controllers
│── init/            # Initialization scripts
│── models/          # Database models
│── public/          # Static assets (CSS, JS, images)
│── routes/          # Express routes
│── utils/           # Utility functions
│── views/           # EJS templates
│── .env             # Environment variables
│── .gitignore
│── cloudConfig.js   # Cloudinary configuration
│── index.js         # App entry point
│── middleware.js    # Custom middleware
│── schema.js        # Joi validation schemas
│── README.md
```

---

## ⚙️ Setup & Installation

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd VibeWallz
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

**Install nodemon (if you haven’t already):**

```bash
npm install -g nodemon
```

3. **Configure environment variables** (`.env`)

   ```env
   PORT=8080
   GOOGLE_GEMINI_KEY=your-google-gemini-api-key
   CLOUD_NAME=your-cloudinary-cloud-name
   CLOUD_API_KEY=your-cloudinary-api-key
   CLOUD_API_SECRET=your-cloudinary-api-secret
   GOOGLE_CLIENT_ID=xxxx
   GOOGLE_CLIENT_SECRET=xxxx
   MAP_TOKEN=xxxx
   MONGO_URI=your-mongodb-connection-string
   SECRET=your-session-secret
   RZP_KEY_ID=xxxx
   RZP_KEY_SECRET=xxxx
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

5. Open in browser: [http://localhost:8080](http://localhost:8080)

---

## 📸 Screenshots

_Todo: Add UI screenshots (homepage, showpage, wallpaper generation page, etc.)_

---

## 🤝 Contributing

- Fork the repo
- Create a new branch
- Make your changes
- Submit a pull request

---

## 📜 License

This project is licensed under the **MIT License**.

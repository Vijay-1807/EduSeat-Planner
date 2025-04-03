# **EduSeater 🎓**  
**A college exam seating arrangement system that efficiently assigns students to rooms while ensuring no adjacent students are from the same branch or subject.**  

## 🚀 Features  
✅ Room-wise seating arrangement  
✅ Ensures no adjacent students from the same branch  
✅ Admin dashboard for managing seating plans  
✅ CSV export functionality  
✅ Secure authentication for admins  
✅ MongoDB integration for student data  

---

## 🛠️ Tech Stack  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **Environment Variables:** `.env` for sensitive data  

---

## 🔧 Installation  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/yourusername/EduSeater.git
cd EduSeater
```

### 2️⃣ Install Dependencies  
```sh
npm install
```

### 3️⃣ Set Up Environment Variables  
Create a `.env` file in the root directory and add:  
```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
❗ **Do not share `.env` or commit it to GitHub**  

### 4️⃣ Start the Server  
```sh
npm start
```
The app should now be running at `http://localhost:5000/` 🚀  

---

## 🖥️ Usage Instructions  
1. **Admin logs in** to the dashboard  
2. **Uploads student data** or fetches from MongoDB  
3. **Generates seating plan** ensuring no adjacent branches  
4. **Downloads CSV** for faculty reference  
5. **Students check their seat allocation** via a search feature  

---

## 📸 Screenshots  
*(View the project UI pics and video in docs: Login page, Admin panel, Seating layout, etc.)*  

---

## 👥 Contributors  
- **Bontha Vijay** - [GitHub](https://github.com/Vijay-1807) | [LinkedIn](www.linkedin.com/in/bonthavijay)    

---

### 📢 Additional Notes  
- Make sure MongoDB is running before starting the server  
- Use **Postman** or **Insomnia** to test API endpoints  
- For deployment, use **Heroku/Vercel** for the frontend & **Render** for the backend  

---

🔥 **If you like this project, don't forget to star ⭐ the repository on GitHub!**  

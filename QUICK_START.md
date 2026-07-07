# ⚡ Quick Setup - Get Server Running Now

## Choose Your Option:

### **Option 1: Docker (Easiest) ⭐ RECOMMENDED**

**Prerequisites:** [Install Docker Desktop](https://www.docker.com/products/docker-desktop)

**Step 1: Run MongoDB in Docker**
```bash
docker run -d -p 27017:27017 --name shopmate-mongo mongo:latest
```

**Step 2: Update .env**
```env
MONGO_URI=local
```

**Step 3: Start the server**
```bash
cd server
npm run dev
```

Done! Server will connect to `mongodb://localhost:27017`

**To stop MongoDB later:**
```bash
docker stop shopmate-mongo
docker rm shopmate-mongo
```

---

### **Option 2: MongoDB Compass + Local MongoDB (Manual Setup)**

**Step 1: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)**

**Step 2: Install MongoDB**
- Windows: Run the installer and choose "Install as a Service"
- This will start MongoDB on `localhost:27017` automatically

**Step 3: Update .env**
```env
MONGO_URI=local
```

**Step 4: Start server**
```bash
cd server
npm run dev
```

**To verify MongoDB is running:**
```bash
# Windows
Get-Service MongoDB | Select-Object Status

# Should show: Status = Running
```

---

### **Option 3: MongoDB Atlas (Your Current Setup) - If Network is Fixed**

**Step 1: Go to MongoDB Atlas**
- https://cloud.mongodb.com/
- Project → Network Access → Add your IP or `0.0.0.0/0`

**Step 2: Update .env**
```env
MONGO_URI=mongodb+srv://hariharanadhilla_db_user:hari1234@cluster0.wu54utg.mongodb.net/?appName=Cluster0
```

**Step 3: Ensure cluster is ACTIVE (not paused)**

**Step 4: Start server**
```bash
cd server
npm run dev
```

---

## ✅ How to Verify Everything Works

Once the server starts, you should see:
```
✅ MongoDB Connected Successfully!
Server running on port 3001
```

Then test the API:
```bash
# Open a new terminal
curl http://localhost:3001/api/products
```

Should return products array (or empty array if no data yet).

---

## 🎯 Quick Test Steps:

1. **Start MongoDB** (Docker or local)
2. **Start Server**: `cd server && npm run dev`
3. **Start Frontend**: `cd client && npm run dev`
4. **Check Browser**: `http://localhost:5173`

If you see data loading or login page → ✅ Success!

---

## 📝 Next Steps After Setup:

1. Seed database with sample products:
   ```bash
   cd server
   npm run seed
   ```

2. Login/Register features
3. AI search & chatbot features

---

## 🆘 Still Getting Errors?

If you get `ECONNRESET` or connection refused:
1. Verify MongoDB is running: `docker ps` (for Docker)
2. Check `.env` has `MONGO_URI=local` or correct Atlas URI
3. Restart server: Stop process and `npm run dev` again
4. Check firewall isn't blocking port 27017

Need help? Check [MONGODB_TROUBLESHOOTING.md](../MONGODB_TROUBLESHOOTING.md)

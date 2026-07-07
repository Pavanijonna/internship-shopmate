# MongoDB Connection Troubleshooting Guide

## Error: `MongoServerSelectionError: read ECONNRESET`

This error occurs when the server cannot establish a connection to MongoDB Atlas. Follow these steps:

---

## ✅ Quick Fix Checklist

### Step 1: Check MongoDB Atlas IP Whitelist
**Most Common Cause!**

1. Go to **MongoDB Atlas Dashboard**: https://cloud.mongodb.com/
2. Click on your organization/project
3. Navigate to **Network Access** (left sidebar)
4. Look for **IP Whitelist** or **IP Access List**
5. **Add your current IP address**:
   - Option A: Click "Add Current IP" (recommended for local development)
   - Option B: Add `0.0.0.0/0` to allow all IPs (NOT recommended for production)

**To find your current IP:**
```bash
# Windows
ipconfig

# Look for IPv4 Address

# Or visit: https://www.whatismyipaddress.com/
```

---

### Step 2: Check MongoDB Cluster Status

1. In MongoDB Atlas, go to **Clusters**
2. Verify your cluster name: **Cluster0**
3. Check the cluster status:
   - ✅ Should show **"ACTIVE"** (green)
   - ❌ If **"PAUSED"** - Click "Resume" to reactivate
4. Ensure all 3 replicas are running (should show 3 green dots)

---

### Step 3: Verify Connection String & Credentials

1. Click **"Connect"** on your cluster
2. Select **"Drivers"** → **"Node.js"**
3. Copy the connection string
4. Verify in your `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.wu54utg.mongodb.net/?appName=Cluster0
   ```
5. Check that:
   - Username is correct: `hariharanadhilla_db_user`
   - Password is correct (if password has special chars, they must be URL-encoded)
   - Cluster name is correct: `cluster0`

---

### Step 4: Test Connection String

Try this in Node.js to test:

```bash
cd server
node -e "
const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri.replace(/:[^@]*@/, ':****@'));
const { MongoClient } = require('mongodb');
new MongoClient(uri, {serverSelectionTimeoutMS: 5000}).connect()
  .then(() => console.log('✅ Connection successful!'))
  .catch(err => console.error('❌ Connection failed:', err.message));
"
```

---

### Step 5: Check Database User Permissions

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Find user: `hariharanadhilla_db_user`
3. Verify it has proper roles:
   - Should have at least **Read/Write to any database** or
   - Specific role for `shopmate` database
4. If not set, click "Edit" → add appropriate role → save

---

### Step 6: Add Connection Options to Handle Timeouts

The connection now includes retry logic with timeouts:
- **Server Selection Timeout**: 5 seconds
- **Connect Timeout**: 10 seconds
- **Retries**: 5 attempts with 2-second delays

If still failing after 5 retries, there's a connectivity issue.

---

## 🔧 Manual Connection Test

Update `.env` with test credentials and run:

```bash
# From server directory
npm run dev
```

If it still fails after 30 seconds (5 retries × 2 seconds + 5 attempts):

---

## 🆘 Still Not Working?

### Try These Steps:

**1. Reset Database User Password:**
- MongoDB Atlas → Database Access → Select user → Edit → Change Password
- Update password in `.env`

**2. Check Network Connectivity:**
```bash
# Test if you can reach MongoDB servers
ping ac-gvrweet-shard-00-02.wu54utg.mongodb.net
```

**3. Check Firewall/VPN:**
- If using VPN/corporate network, disable temporarily to test
- Some firewalls block outbound connections to MongoDB ports (27017)

**4. Try Local MongoDB (Alternative):**
```bash
# Install MongoDB locally or use Docker
# Then update .env:
MONGO_URI=mongodb://localhost:27017

# Or use MongoDB Memory Server for development
npm install --save-dev mongodb-memory-server
```

**5. Check MongoDB Atlas Status:**
- Visit: https://status.mongodb.com/
- Ensure no ongoing outages in your region

---

## 📝 Environment Variables to Update

Make sure your `.env` file has:

```env
# CRITICAL - Update with your actual values!
MONGO_URI=mongodb+srv://hariharanadhilla_db_user:hari1234@cluster0.wu54utg.mongodb.net/?appName=Cluster0

# Optional but recommended for debugging
NODE_ENV=development

# Other required variables
GEMINI_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
JWT_SECRET=your_secret_here
```

---

## ✅ After Fixing

Once connected successfully:
1. You should see: **✅ MongoDB Connected Successfully!**
2. Server will start on: `http://localhost:3001`
3. Test with: `curl http://localhost:3001`

---

## 📌 Next Steps

Once MongoDB connects:
1. Test API endpoints
2. Run seed script: `npm run seed`
3. Start frontend development

**Need more help?** Check [MongoDB Troubleshooting Docs](https://docs.mongodb.com/manual/faq/diagnostics/#connection-issues)

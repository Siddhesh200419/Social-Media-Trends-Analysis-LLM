# Troubleshooting Guide

## No Data Showing on Dashboard

If you're seeing zeros and empty sections, check the following:

### 1. Backend Server Running?
Make sure the Flask backend is running:
```bash
cd Backend
python -m app.api.server
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

### 2. Backend Credentials Set?
Check that `.env` file exists in `Backend/` directory with:
```
BSKY_HANDLE=your_handle.bsky.social
BSKY_APP_PASSWORD=your_app_password
```

### 3. Test Backend Endpoints
Open your browser and test:
- http://localhost:5000/api/health (should return `{"status": "ok"}`)
- http://localhost:5000/api/categories (should return JSON array)
- http://localhost:5000/api/topics (should return JSON array)

### 4. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for any fetch errors
- **Network tab**: Check if `/api/categories` and `/api/topics` requests are:
  - Being made (status 200 = success)
  - Returning data (check Response tab)

### 5. CORS Issues?
If you see CORS errors in console, make sure:
- Flask-CORS is installed: `pip install flask-cors`
- Backend has `CORS(app)` enabled (already done in server.py)

### 6. Frontend Proxy Working?
Check `Frontend/vite.config.js` has:
```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### 7. Backend Logs
Check the terminal where Flask is running for:
- Any error messages
- Successful API requests (if debug mode is on)

### Common Issues:

**Issue**: Backend returns empty arrays `[]`
- **Cause**: Bluesky API might not be returning posts with hashtags
- **Solution**: The backend will create a "general" topic if no hashtags found

**Issue**: Network errors in browser
- **Cause**: Backend not running or wrong port
- **Solution**: Ensure backend runs on port 5000

**Issue**: CORS errors
- **Cause**: Flask-CORS not installed or not enabled
- **Solution**: `pip install flask-cors` and restart backend

**Issue**: 500 Internal Server Error
- **Cause**: Backend error (check Flask terminal for details)
- **Solution**: Check Bluesky credentials in `.env` file

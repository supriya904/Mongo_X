// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log the request
  console.log(`🔵 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const logBody = { ...req.body };
    // Remove sensitive fields from logs
    delete logBody.password;
    delete logBody.token;
    
    if (Object.keys(logBody).length > 0) {
      console.log('📝 Request Body:', JSON.stringify(logBody, null, 2));
    }
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const statusEmoji = res.statusCode >= 400 ? '🔴' : '🟢';
    
    console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log error responses
    if (res.statusCode >= 400 && data) {
      console.log('❌ Error Response:', JSON.stringify(data, null, 2));
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = requestLogger;

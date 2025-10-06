const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:7094',
      changeOrigin: true,
      secure: false, // Set to false if using self-signed certificates
      logLevel: 'debug',
      onError: function (err, req, res) {
        console.log('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Something went wrong. Proxy Error: ' + err);
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Proxying request to:', proxyReq.getHeader('host') + proxyReq.path);
      }
    })
  );
};

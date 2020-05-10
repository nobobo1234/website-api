# Express Starter

This is an express starter for most of my projects. It has most of the starting configuration built in so that you can directly start working on your MVC. My database of choice is mongodb but this could of course be adapted to one's needs.

## Default middlewares
- Rate limit middleware using `express-rate-limit`
- Prevention against NoSQL injection using `express-mongo-sanitize`
- Prevention against XSS attacks using `xss-clean`
- Compression of responses using `compression`
- A error handling middleware with the most common mongodb errors automatically handled in production


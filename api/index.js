module.exports = function (express, app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })
  const router = express.Router()

  const todos = require('./todos')(express)
  const todoMVC = require('./todo-mvc')(express)

  // Add USERS Routes
  router.use(todos)
  router.use(todoMVC)

  return router
}
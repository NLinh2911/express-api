module.exports = function (express, app) {
  const router = express.Router()

  const todos = require('./todos')(express)
  const todoMVC = require('./todo-mvc')(express)

  // Add USERS Routes
  router.use(todos)
  router.use(todoMVC)


  return router
}
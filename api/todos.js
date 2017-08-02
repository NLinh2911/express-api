/**
 * Created by Linh Ngô on 28/07/17.
 */
module.exports = function (express, app) {
  const router = express.Router();

  // Mock todos
  const todos = [{
    text: 'Learn Vue',
    isCompleted: false
  }, {
    text: 'Learn Webpack',
    isCompleted: false
  }]

  /* GET todos listing. */
  router.get('/todos', function (req, res, next) {
    res.json(todos)
  })

  /* POST add todos. */
  router.post('/todos/addTodo', function (req, res, next) {
    let newTodo = req.body
    todos.push(newTodo)
    res.json(todos)
  })

  /* POST delete todos. */
  router.post('/todos/deleteTodo', function (req, res, next) {
    let todoIndex = req.body.index
    // console.log(todoIndex)
    todos.splice(todoIndex, 1)
    // console.log(todos)
    res.json(todos)
  })

  return router
}
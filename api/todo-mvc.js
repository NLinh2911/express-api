/**
 * Created by Linh Ngô on 31/07/17.
 */
const {
  db
} = require('../pgp');
module.exports = function (express, app) {
  const router = express.Router();

  /* GET todos listing. */
  router.get('/todo-mvc/all', function (req, res, next) {
    db
      .any("SELECT * FROM vue.todo")
      .then(result => {
        // console.log(result);
        res.json(result);
      })
      .catch(err => {
        console.error(err)
      })

  })

  /* POST todos. */
  router.post('/todo-mvc/addTodo', function (req, res, next) {
    console.log('new data ', req.body);
    db.any("INSERT INTO vue.todo (title, completed) VALUES (${title}, ${completed}) RETURNING *", req.body)
      .then(result => {
        console.log(result);
        res.json(result)
      })
      .catch(err => {
        console.error(err)
      })

  })

  router.post('/todo-mvc/removeTodo', function (req, res, next) {
    console.log('remove data ', req.body.id);
    db
      .any("DELETE FROM vue.todo WHERE id = $1 RETURNING *", [req.body.id])
      .then(result => {
        console.log(result);
        res.json(result)
      })
      .catch(err => {
        console.error(err)
      })
  })

  router.post('/todo-mvc/editTodo', function (req, res, next) {
    console.log('edit data ', req.body.todo);
    db
      .any("UPDATE vue.todo SET title = ${title} WHERE id = ${id} RETURNING *", req.body.todo)
      .then(result => {
        console.log(result);
        res.json(result)
      })
      .catch(err => {
        console.error(err)
      })
  })

  router.post('/todo-mvc/completeTodo', function (req, res, next) {
    console.log('complete data ', req.body.todo);
    db
      .any("UPDATE vue.todo SET completed = ${completed} WHERE id = ${id} RETURNING *", req.body.todo)
      .then(result => {
        console.log(result);
        res.json(result)
      })
      .catch(err => {
        console.error(err)
      })
  })

  router.post('/todo-mvc/removeCompleted', function (req, res, next) {
    console.log('remove completed data ', req.body.completedTodos);
    let completedIds = req.body.completedTodos.map(todo => {
      return todo.id;
    })
    let ids = completedIds.join(', ');
    db
      .any(`DELETE FROM vue.todo WHERE id IN (${ids}) RETURNING *`)
      .then(result => {
        console.log(result);
        let deletedIds = result.map(todo => {
          return todo.id
        })
        res.json(deletedIds)
      })
      .catch(err => {
        console.error(err)
      })
  })
  return router
}
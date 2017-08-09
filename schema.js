// set up query structure when I query, the data specified below will be
// returned
const {
  db
} = require('./pgp');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');

// data
/*
const students = [
  {
    id: '1',
    name: 'Tim Doe',
    email: 'tim@gmail.com',
    age: 30
  }, {
    id: '2',
    name: 'Alex Smiths',
    email: 'alex@gmail.com',
    age: 20
  }, {
    id: '3',
    name: 'Dan Black',
    email: 'dan@gmail.com',
    age: 10
  }, {
    id: '4',
    name: 'Julie Doe',
    email: 'julie@gmail.com',
    age: 43
  }
]
*/
// Student Type
const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    age: {
      type: GraphQLInt
    }
  })
})
// define a query type
const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  description: 'this is a query', // optional
  fields: { // define query structure
    // this is one query that looks for student by id
    student: {
      type: StudentType, // type of returned result from the query
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve(parentValue, args) {
        /*
        for (let i = 0; i < students.length; i++) {
          if (students[i].id == args.id) {
            return students[i];
          }
        }
        */
        return db
          .oneOrNone("SELECT * FROM vue.students WHERE id = $1", [args.id])
          .then(res => res) // res is an object
          .catch(err => console.log(err));
      }
    },
    // another query returns an array of students
    students: {
      type: new GraphQLList(StudentType), // register a new list/array which contains student object
      resolve(parentValue, args) {
        // return students; console.log(parentValue); // parentValue is the rootValue
        // set when we create graphQL server in server.js
        return db
          .any("SELECT * FROM vue.students")
          .then(res => res)
          .catch(err => console.log(err));
      }
    },
    // query inserts another student into the table
    addStudentQuery: {
      type: StudentType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        },
        name: {
          type: new GraphQLNonNull(GraphQLString)
        },
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        age: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve(parentValue, args) {
        return db
          .one("INSERT INTO vue.students (id, name, email, age) VALUES (${id}, ${name}, ${email}, ${age}) R" +
            "ETURNING *",
            args)
          .then(res => res)
          .catch(err => console.log(err))
      }
    }
  }
});
// Mutation
const mutation = new GraphQLObjectType({
  name: 'studentMutation',
  fields: {
    addStudent: {
      type: StudentType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        },
        name: {
          type: new GraphQLNonNull(GraphQLString)
        },
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        age: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve(parentValue, args) {
        return db
          .one("INSERT INTO vue.students (id, name, email, age) VALUES (${id}, ${name}, ${email}, ${age}) RETURNING *",
            args)
          .then(res => res) // return the newly added student
          .catch(err => console.log(err))
      }
    },
    deleteStudent: {
      type: new GraphQLList(StudentType),
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve(parentValue, args) {
        return db.task(t => {
            return t.none("DELETE FROM vue.students WHERE id = $1", [args.id])
              .then(() => {
                return t.any("SELECT * FROM vue.students")
              })
          })
          .then(res => res)
          .catch(err => console.log(err))
      }
    },
    editStudent: {
      type: new GraphQLList(StudentType),
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        },
        name: {
          type: GraphQLString
        },
        email: {
          type: GraphQLString
        },
        age: {
          type: GraphQLInt
        }
      },
      resolve(parentValue, args) {
        return db.task(t => {
            return t
              .none("UPDATE vue.students SET name = ${name}, email = ${email}, age = ${age} WHERE  id = ${id}", args)
              .then(() => {
                return t.any("SELECT * FROM vue.students")
              })
          })
          .then(res => res)
          .catch(err => console.log(err))
      }
    }
  }
});

module.exports = new GraphQLSchema({
  // schema must have a root query
  query: RootQuery,
  mutation
});
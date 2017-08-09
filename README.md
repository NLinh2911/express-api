# GraphQL:

* All requests are in a single endpoint 
* GraphQL is a query language that is not binded to any database

* Use `express-grapql` to set up a server with graphql. Schema is where you define all your data types, fields and queries

```js
// server.js

// graphQL
const expressGraphQL = require('express-graphql')
const schema = require('./schema.js') 

app.use('/graphql', expressGraphQL({
  schema: schema,
  pretty: true,
  graphiql: true // can use graphical IDE to test
}))
```

### Schema
* When we require `schema.js` in `server.js`, we have a GraphQLSchema which holds all valid queries defined in RootQuery
```js
// schema.js
module.exports = new GraphQLSchema({
  // schema must have a root query
  query: RootQuery
});
```
* GraphQL creates a data graph which can be like a tree graph with nodes and edges
* We must define a `RootQuery`. A GraphQL query looks like an object

```js
// this is a query that looks for student with id = 1 and returns values of id, name, email, age
{
  student (id: 1) {
    id, 
    name,
    email,
    age
  }
}
```

```js
// ------schema.js-------------

// Student Type
const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: {
      type: GraphQLInt
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
    student: { // this is one query that looks for student by id
      type: StudentType, // type of returned result from the query
      args: {
        id: {
          type: GraphQLInt
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
        return db.oneOrNone("SELECT * FROM vue.students WHERE id = $1", [args.id])
                  .then(res => res)
                  .catch(err => console.log(err));
      }
    },
    students: { // another query returns an array of students
      type: new GraphQLList(StudentType), // register a new list/array which contains student object
      resolve(parentValue, args) {
        // return students;
        return db.any("SELECT * FROM vue.students")
                  .then(res => res)
                  .catch(err => console.log(err));
      }
    }
  }
})
```

* In `fields`, you define the structure of your query and also this is exactly what you will get back. GraphQL returns what the clients ask
  * For example, the `students` query below 
    ```js
      // a query for students that returns an array of all students
      {
        students {
          id
          name
        }
      }
    ```
  * The returned value includes id and name only (suppose that we only have 2 students)
    ```js
      {
        "data": {
          "students": [
            {
              "id": 1,
              "name": "tim doe"
            },
            {
              "id": 2,
              "name": "paul smiths"
            }
          ]
        }
      }
    ```


#### Mutation: 

* Adding a new student to the table: we can add a new `addTodo` query in `fields` of `RootQuery`
```js
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
```

* However, it's not encouraged to write a query that can cause some side-effects in the server (write, update or delete data). In REST, `GET` request shouldn't be used to modify data, whereas in GraphQL, you should use `mutation` instead of `query`

```js
// define mutation after RootQuery
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
});

module.exports = new GraphQLSchema({
  // schema must have a root query
  query: RootQuery,
  mutation
});
```

* So open `localhost:3000/graphql`, click on `Docs` you will see. Click on `RootQuery` and `studentMutation` you will see all queries and mutations respectively
```js
query: RootQuery
mutation: studentMutation
```

### Use Apollo-client to use GraphQL in front-end

#### Install
```bash
$ npm install --save vue-apollo apollo-client graphql-tag
```

#### Vue-Apollo:

* Create an Apollo Client and use Vue-apollo plugin in `main.js`

```js
// GraphQL Client: vue-apollo
import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client';
// ApolloClient is the core of Apollo API that has all methods to interact with GraphQL

import VueApollo from 'vue-apollo';
//
// Create the apollo client
const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3000/graphql',
  }),
});

// Install the vue plugin
// With the apollo client instance
Vue.use(VueApollo, {
  apolloClient,
});
const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  },
  apolloProvider,
})
```

* Create a `GraphQL.vue` component. Use `graphql-tag` to write query

```html
 <!--display student list from graphql server at port 3000-->
<template>
  <div>
    <!-- Actual view -->
    <h1>Testing GraphQL</h1>

    <ul v-for="student in students" :key="student.id">
      <li>{{student.id}}</li>
      <li>{{student.name}}</li>
      <li>{{student.email}}</li>
      <li>{{student.age}}</li>
    </ul>
  </div>
</template>
```

* Use `apollo {...}` to set up queries

```js
  import gql from 'graphql-tag';
  // Vue component definition
  export default {
    // Local state
    data() {
      // You can initialize the 'students' data here
      return {
        students: []
      }
    },
    // Apollo GraphQL
    apollo: {
      // Local state 'students' data will be updated
      // by the GraphQL query result
      students: {
        // GraphQL query
        query: gql `
              {
                students {
                  id,
                  name,
                  email,
                  age
                }
            }
            `,
      },
    },
  };
```

* **Note:** the client can't retrieve data from GraphQL query. Error `405: Methods not allowed` since the Vue client and the API server are cross-origin and by default, the **same-origin policy** of the web only allows connection and data transferring among the same domain.
  * **Cross-origin resource sharing (CORS)** is a mechanism that allows cross-origin connection. CORS use HTTP headers to decide when cross-origin requests are allowed
  * In browser, CORS add header `Origin` when a request is sent back to server
  ```js
   Origin: http://my-domain.com
  ```
  * In server, a header `Access-Control-Allow-Origin` is added to response header 
  ```js
  Access-Control-Allow-Origin: http://my-domain.com
  ```
  * Receiving a response from server, browser will check the response header for `Access-Control-Allow-Origin`, if the domain matchs the current domain then the reponse is allowed to process 
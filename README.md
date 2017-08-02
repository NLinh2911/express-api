# Build Express API Server As A Docker Container

## Gói Express Server thành 1 docker image

### Tạo dockerfile

* Trong folder của express project, tạo 1 file dockerfile mới

```bash
$ touch ockerfile
```
* Thông tin của Dockerfile

```dockerfile
# Dockerfile
# The FROM directive sets the Base Image for subsequent instructions
# Nền tảng mà express server chạy trên
FROM node:alpine 

# Create app directory
# Tạo directory chứa các files trong express project
RUN mkdir -p /usr/src/express
WORKDIR /usr/src/express

# Install app dependencies
# Cài đặt các modules cần thiết trong package.json
# Địa điểm cài đặt các modules là /usr/src/express/
COPY package.json package-lock.json . /usr/src/express/
RUN npm install

# Bundle app source
# Gói các tài nguyên của express server vào docker image
COPY . .

# Express server chạy trên port 3000 nên cần expose cổng này ra thì các máy khác mới truy cập vào đc
EXPOSE 3000
# Câu lệnh 'npm start' để bắt đầu chạy express server
# Đặt câu lệnh 'npm start' trong package.json = 'node server.js'
CMD [ "npm", "start" ]
```

### Tạo file .dockerignore

```bash
$ touch .dockerignore
```

* Thông tin file .dockerignore 

```
.git
.gitignore
node_modules
```

## Tạo Docker Image

* Tên của docker image này là `linh/docker-express-server`

```bash
$ sudo docker build -t linh/docker-express-server .
```

* Sau khi build image thành công, hiển thị trên terminal 2 dòng cuối cùng

```bash
// .....
Successfully built 6237ae2a743f
Successfully tagged linh/docker-express-server:latest
```

* Có thể kiểm tra trên docker

```bash
// liệt kê các docker images trong máy
$ sudo docker images

// kết quả nên hiển thị image mới đc tạo linh/docker-express-server
REPOSITORY                    TAG                 IMAGE ID            CREATED             SIZE
linh/docker-express-server    latest              6237ae2a743f        2 hours ago         66.7MB
node                          alpine              442930c9c9fb        5 days ago          64.6MB
nginx                         alpine              ba60b24dbad5        2 weeks ago         15.5MB
postgres                      9.6.2-alpine        b3e7f411a7de        4 months ago        37.7MB
alpine                        latest              4a415e366388        4 months ago        3.99MB
```

## Từ image tạo ra container

```bash
$ sudo docker run --name express-api -p 3000:3000 -d linh/docker-express-server
```

* Kiểm tra logs của container `express-api` xem có start server ở port 3000 không

```bash
$ sudo docker logs express-api

// kết quả trả về 
npm info it worked if it ends with ok
npm info using npm@5.3.0
npm info using node@v8.2.1
npm info lifecycle server-api@1.0.0~prestart: server-api@1.0.0
npm info lifecycle server-api@1.0.0~start: server-api@1.0.0

> server-api@1.0.0 start /usr/src/express
> node server.js

Server listening on 0.0.0.0:3000
```

## Vue project bây giờ có thể trỏ vào api này để lấy data (27/07/2017)
* Đã có 1 API express server chạy trên docker container `express-api`
* `express-api` này sẽ nằm trên IP/domain của máy host chứa docker container. Ví dụ, `express-api` nằm trên máy A có IP là `192.168.0.100` hay domain `hostA.com` và expose ở port 3000, còn ứng dụng Vue chạy trên nginx container độc lập nằm trên máy B có IP là `192.168.1.111` hay domain `hostB.com` trên port 80. Lúc này ứng dụng Vue có thể gửi Axios requests lên server `express-api` để lấy dữ liệu. Các axios requests sẽ trỏ đến IP/domain của máy A

```js
axios.get('http://192.168.0.100:3000/api/data')
// hay nếu có tên domain
axios.get('http://hostA.com:3000/api/todos')
```  

## Vue & Socket.io: Simple chat demo (28/07/2017)
* Trong data của SocketChat.vue component, tạo 1 biến là socket
* Tại hook `created()`, kết nối với socket server và tạo các socket listening events

```js
    data: function () {
      return {
        socket: null,
        //.....
      }
    created () {
      this.socket = io.connect('http://127.0.0.1:3000/socket');
      // only connect to '/socket' namespace
      this.socket.on('connection', (data) => {
        console.log(data);
        this.title = data.title
        this.messages = data.messages
      })

      this.socket.on('chat', (data) => {
        console.log(data);
        this.messages.push(data)
      });
    },   
```

## Vue TodoMVC kết nối với CSDL (31/07/2017)
* Routes `/api/todo-mvc`
* Câu lệnh tạo CSDL trong `todo-mvc.sql`
* Server cho **todo-mvc** ở `/api/todo-mvc` kết nối với Postgresql qua pg-promise
  * Phần server này chỉ chạy 1 câu lệnh sql mỗi lần xử lý routes `addTodo`, `editTodo`, `removeTodo`, `completeTodo` và `removedCompleted` 
  * Sau đó trả về dữ liệu bị thay đổi hoặc bị xóa khỏi CSDL lại về cho Vue và cập nhật mảng `todos` bằng các hàm JS bên frontend (phần code đc commented)
  ```js
  // Todo.vue bên front-end
        removeTodo: function (id) {
        axios.post('http://192.168.1.107:3000/api/todo-mvc/removeTodo', {
            id
          })
          .then(res => {
            let todo = this.todos.find(todo => {
              return todo.id === res.data[0].id
            })
            this.todos.splice(this.todos.indexOf(todo), 1)
          })
          .catch(err => {
            console.log(err)
          })
      },
  ```
  * Kết nối với server của [Đạt](https://github.com/thanhdat21293/rest_api_todo_vue) thì bên CSDL sẽ chạy 2 queries mỗi lần xử lý routes: thay đổi dữ liệu (insert, update, delete) rồi select lại tất cả todos sau khi đc sửa đổi và trả về front end danh sách todos mới
  ```js
    // Todo.vue bên front-end
        removeTodo: function (id) {
        axios.post('http://192.168.1.107:3000/api/todo-mvc/removeTodo', {
            id
          })
          .then(res => {
            this.todos = res.data
          })
          .catch(err => {
            console.log(err)
          })
      },
  ```


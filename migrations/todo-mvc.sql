DROP SCHEMA IF EXISTS vue CASCADE;

CREATE SCHEMA vue;

SET SCHEMA 'vue';

DROP TABLE IF EXISTS todo CASCADE;

CREATE TABLE todo (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL
);

INSERT INTO vue.todo (title, completed) VALUES ('Learn Vue', false), ('Learn Webpack', false); 

import {TodoController, TodoDetailView, TodoMasterView} from './todo.js';

const todoController = TodoController();

// binding of the main view

document.getElementById('plus').onclick    = _ => todoController.addTodo();

// create the sub-views, incl. binding

TodoDetailView(todoController, document.getElementById('todoDetailContainer'));
TodoMasterView(todoController, document.getElementById('todoMasterContainer'));

// init the model

todoController.addTodo();


import {TodoController, TodoOpenView, TodoTotalView, TodoMasterView, TodoDetailView} from './todo.js';

const todoController = TodoController();

// binding of the main view

document.getElementById('plus').onclick    = _ => { todoController.addTodo(); todoController.updateViews() } ;
document.getElementById('fortune').onclick = _ => todoController.addFortuneTodo();

// create the sub-views, incl. binding

TodoMasterView(todoController, document.getElementById('todoMasterContainer'));
TodoTotalView(todoController, document.getElementById('numberOfTasks'));
TodoOpenView (todoController, document.getElementById('openTasks'));
TodoDetailView(todoController);

// init the model

todoController.addTodo();

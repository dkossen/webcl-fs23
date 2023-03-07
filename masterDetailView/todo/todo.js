import { ObservableList } from "../observable/observable.js";
import { Attribute }      from "../presentationModel/presentationModel.js";
import { Scheduler }      from "../dataflow/dataflow.js";
import { fortuneService } from "./fortuneService.js";

export { TodoController, TodoMasterView, TodoTotalView, TodoOpenView, TodoDetailView}

const TodoController = () => {

    const Todo = () => {                               // facade
        const textAttr = Attribute("text");
        const doneAttr = Attribute(false);
        const saveAttr = Attribute(false);

        textAttr.setValidator( input => input.length >= 3   );

        return {
            getDone:            doneAttr.valueObs.getValue,
            setDone:            doneAttr.valueObs.setValue,
            onDoneChanged:      doneAttr.valueObs.onChange,
            getText:            textAttr.valueObs.getValue,
            setText:            textAttr.setConvertedValue,
            onTextChanged:      textAttr.valueObs.onChange,
            onTextValidChanged: textAttr.validObs.onChange,
            onSaved:            textAttr.valueObs.onChange
        }
    };

    const todoModel = ObservableList([]); // observable array of Todos, this state is private
    const scheduler = Scheduler();

    const addTodo = () => {
        const newTodo = Todo();
        todoModel.add(newTodo);
        return newTodo;
    };

    const addFortuneTodo = () => {

        const newTodo = Todo();

        todoModel.add(newTodo);
        newTodo.setText('...');

        scheduler.add( ok =>
           fortuneService( text => {
                   newTodo.setText(text);
                   ok();
               }
           )
        );

    };

    return {
        numberOfTodos:      todoModel.count,
        numberOfopenTasks:  () => todoModel.countIf( todo => ! todo.getDone() ),
        addTodo:            addTodo,
        addFortuneTodo:     addFortuneTodo,
        removeTodo:         todoModel.del,
        onTodoAdd:          todoModel.onAdd,
        onTodoRemove:       todoModel.onDel,
        removeTodoRemoveListener: todoModel.removeDeleteListener, // only for the test case, not used below
    }
};


// View-specific parts

const TodoMasterView = (todoController, rootElement) => {

    const render = todo => {

        function createElements() {
            const template = document.createElement('table'); // only for parsing
            const tdTemplate = document.createElement('td');
            template.appendChild(tdTemplate).innerHTML =
            `
              <td></td>
              <td></td>
            `
            return template.children
        }

        const [description] = createElements();

        todo.onSaved(() => {
            description.innerHTML = todo.getText()
        })

        rootElement.appendChild(document.createElement('tr')).appendChild(description);

    }

    todoController.onTodoAdd(render);

};

const TodoTotalView = (todoController, numberOfTasksElement) => {

    const render = () =>
        numberOfTasksElement.textContent = "" + todoController.numberOfTodos();

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
};

const TodoOpenView = (todoController, numberOfOpenTasksElement) => {

    const render = () =>
        numberOfOpenTasksElement.innerText = "" + todoController.numberOfopenTasks();

    todoController.onTodoAdd(todo => {
        render();
        todo.onDoneChanged(render);
    });
    todoController.onTodoRemove(render);
};

const TodoDetailView = (todoController) => {

    const render = todo => {

        const description = document.getElementById("description");
        const saveButton = document.getElementById("save");
        const resetButton = document.getElementById("reset");

        description.value = todo.getText();

        description.onchange = function() {
            if(todo.getText() !== description.value){
                description.classList.add("dirty");
            } else {
                description.classList.remove("dirty");
            }
        }

        saveButton.onclick = _ => {
            todo.setText(description.value);
            description.classList.remove("dirty");
        }

        resetButton.onclick = _ => {
            description.value = todo.getText();
            description.classList.remove("dirty");
        }

    };

    todoController.onTodoAdd(render);
}

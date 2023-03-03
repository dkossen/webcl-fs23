import { ObservableList } from "../observable/observable.js";
import { Attribute }      from "../presentationModel/presentationModel.js";

export { TodoController, TodoDetailView, TodoMasterView}

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
            onTodoSave:         saveAttr.valueObs.setValue,
            onSaved:            textAttr.valueObs.onChange,
        }
    };

    const todoModel = ObservableList([]); // observable array of Todos, this state is private

    const addTodo = () => {
        const newTodo = Todo();
        todoModel.add(newTodo);
        return newTodo;
    };

    return {
        addTodo:            addTodo,
        removeTodo:         todoModel.del,
        onTodoAdd:          todoModel.onAdd,
        onTodoRemove:       todoModel.onDel,
        removeTodoRemoveListener: todoModel.removeDeleteListener, // only for the test case, not used below
    }
};


// View-specific parts

const TodoDetailView = (todoController, rootElement) => {

    const render = todo => {

        function createElements() {
            const template = document.createElement('DIV'); // only for parsing
            template.innerHTML = `
                <button class="delete">&times;</button>
                <input type="text" size="10">
                <input type="text" size="5">
                <input type="checkbox">
                <button id="save">Save</button>           
            `;
            return template.children;
        }
        const [deleteButton, inputElementDescription, inputElementTime, checkboxElement, saveButton] = createElements();

        checkboxElement.onclick = _ => todo.setDone(checkboxElement.checked);
        deleteButton.onclick    = _ => todoController.removeTodo(todo);
        saveButton.onclick      = _ => {
            todo.onTodoSave(true);
            todo.setText(inputElementDescription.value);
        }

        todoController.onTodoRemove( (removedTodo, removeMe) => {
            if (removedTodo !== todo) return;
            rootElement.removeChild(inputElementDescription);
            rootElement.removeChild(inputElementTime);
            rootElement.removeChild(deleteButton);
            rootElement.removeChild(checkboxElement);
            rootElement.removeChild(saveButton);
            removeMe();
        } );

        inputElementDescription.oninput = _ => todo.onTodoSave(inputElementDescription.value);

        todo.onTextChanged(() => inputElementDescription.value = todo.getText());

        todo.onTextValidChanged(
            valid => valid
              ? inputElementDescription.classList.remove("invalid")
              : inputElementDescription.classList.add("invalid")
        );

        rootElement.appendChild(deleteButton);
        rootElement.appendChild(inputElementDescription);
        rootElement.appendChild(inputElementTime);
        rootElement.appendChild(checkboxElement);
        rootElement.appendChild(saveButton);
    };

    // binding

    todoController.onTodoAdd(render);

    // we do not expose anything as the view is totally passive.
};

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

}
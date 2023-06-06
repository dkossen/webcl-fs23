/**
 * @module Controllers as shallow wrappers around observables
 */
import { ObservableList, Observable }   from "../kolibri-dist/src/kolibri/observable.js";

export { ListController, SelectionController }

const ListController = modelConstructor => {

    const listModel = ObservableList([]); // observable array of models, this state is private

    return {
        addModel:            () => listModel.add(modelConstructor()),
        removeModel:         listModel.del,
        onModelAdd:          listModel.onAdd,
        onModelRemove:       listModel.onDel,
    }
};

/**
 * @template T
 * @param { T } noSelection - an instance of the model that represents that nothing is selected.
 * @param { T } model
 */
const SelectionController = (noSelection, model) => {

    const selectedModelObs = Observable(model);

    return {
        setSelectedModel : selectedModelObs.setValue,
        getSelectedModel : selectedModelObs.getValue,
        onModelSelected  : selectedModelObs.onChange,
        clearSelection   : () => selectedModelObs.setValue(noSelection),
    }
};

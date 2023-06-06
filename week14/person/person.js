import {Attribute, EDITABLE, LABEL, VALUE}                                                         from "../kolibri-dist/src/kolibri/presentationModel.js";
import {formProjector, listItemProjector, selectListItemForModel, removeListItemForModel, pageCss} from "./instantUpdateProjector.js";
// try boringProjector.js

export { MasterView, DetailView, Person, selectionMold, noPerson, ALL_ATTRIBUTE_NAMES }

// page-style change, only executed once
const style = document.createElement("STYLE");
style.innerHTML = pageCss;
document.head.appendChild(style);

const ALL_ATTRIBUTE_NAMES      = ['firstname', 'lastname','language'];
const INTERNAL_ATTRIBUTE_NAMES = ['detailed', ...ALL_ATTRIBUTE_NAMES];

let idCounter = 0;
const nextId = () => idCounter++;

/**
 * @typedef PersonType
 * @property { AttributeType<String>}  firstname - plus qualifier and label.
 * @property { AttributeType<String>}  lastname  - plus qualifier and label.
 * @property { AttributeType<String>}  language  - plus qualifier and label.
 * @property { AttributeType<Boolean>} detailed  - whether the person makes sense to be shown in a detailed view.
 * @property { () => String }          toString
 */
/**
 * Constructs a "Monika Mustermann" Person with english labels and example validator and
 * converter on the lastname property.
 * @constructor
 * @return { PersonType }
 */
const Person = () => {                               // facade
    const id = nextId();

    const firstnameAttr = Attribute("Monika", `Person.${id}.firstname`);
    firstnameAttr.getObs(LABEL).setValue("First Name");

    const lastnameAttr  = Attribute("Mustermann", `Person.${id}.lastname`);
    lastnameAttr.getObs(LABEL).setValue("Last Name");

    const languageAttr  = Attribute("JS", `Person.${id}.language`);
    languageAttr.getObs(LABEL).setValue("Language");

    const detailedAttr  = Attribute(true, `Person.${id}.detailed`);

    lastnameAttr.setConverter( input => input.toUpperCase() );  // enable for playing around
    lastnameAttr.setValidator( input => input.length >= 3   );

    return /** @type { PersonType } */ {
        firstname:          firstnameAttr,
        lastname:           lastnameAttr,
        language:           languageAttr,
        detailed:           detailedAttr,
        toString: () => firstnameAttr.getObs(VALUE).getValue() + " " + lastnameAttr.getObs(VALUE).getValue(),
    }
};

// View-specific parts

const MasterView = (listController, selectionController, rootElement) => {

    const render = person =>
        listItemProjector(listController, selectionController, rootElement, person, ALL_ATTRIBUTE_NAMES);

    // binding
    listController.onModelAdd(render);
    listController.onModelRemove( (removedModel, removeMe) => {
        removeListItemForModel(ALL_ATTRIBUTE_NAMES)(removedModel);
        removedModel.firstname.setQualifier(undefined); // remove model attributes from model world
        removedModel.lastname.setQualifier(undefined);  // this could become more convenient
        selectionController.clearSelection();
    });
    selectionController.onModelSelected(selectListItemForModel(ALL_ATTRIBUTE_NAMES));
};

const reset = person => {
    ALL_ATTRIBUTE_NAMES.forEach( name => {
        person[name].setQualifier(undefined);
        person[name].setConvertedValue("");
    });
    return person;
};

const noPerson = reset(Person());
ALL_ATTRIBUTE_NAMES.forEach( name => {
    noPerson[name].setQualifier("Person.none."+name);
    noPerson[name].getObs(EDITABLE).setValue(false);
});
noPerson.detailed.setQualifier("Person.none.detailed");
noPerson.detailed.getObs(VALUE).setValue(false);

const selectionMold = reset(Person());

const DetailView = (selectionController, rootElement) => {

    formProjector(selectionController, rootElement, selectionMold, ALL_ATTRIBUTE_NAMES); // only once, view is stable, binding is stable

    selectionController.onModelSelected( selectedPersonModel => {
        // set the qualifiers to connect detailModel with current selection

        INTERNAL_ATTRIBUTE_NAMES.forEach( name =>
          selectionMold[name].setQualifier(selectedPersonModel[name].getQualifier())
        );
    });

    selectionController.clearSelection();
};

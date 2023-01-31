const { Datastore } = require('@google-cloud/datastore');
const projectId = process.env.DATASTORE_PROJECT_ID;
const datastore = new Datastore({ projectId: projectId });

function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}

module.exports = {
    datastore: datastore,
    fromDatastore: fromDatastore
};

const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { Resource } = require("@opentelemetry/resources");


const resource = new Resource({
    [SemanticResourceAttributes.HOST_NAME]: "test",
});



module.exports = resource
export var query =
  "mutation setDestinationForEstimation(\n $params: SetDestinationForEstimationInput!\n) {\n  cart {\n    setDestinationForEstimation(params: $params) {\n      errors {\n          code\n          commandName\n          message\n          field\n      }\n      cart {\n          cartId\n      }\n    }\n  }\n}\n";
//# sourceMappingURL=setDestinationForEstimation.graphql.js.map

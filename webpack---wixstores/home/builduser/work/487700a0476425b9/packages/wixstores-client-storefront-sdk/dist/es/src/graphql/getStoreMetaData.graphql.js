export var query =
  "query getStoreMetaData {\n  storeInfo {\n    isPremium\n    canStoreShip\n    hasCreatedPaymentMethods\n  }\n  shipping {\n    isPickupOnly\n  }\n  payments {\n    activePaymentMethods {\n      name\n      type\n    }\n  }\n}";
//# sourceMappingURL=getStoreMetaData.graphql.js.map

export var query =
  "mutation setCartShippingOption(\n $params: SetShippingOptionInput!\n) {\n  cart {\n    setShippingOption(params: $params) {\n      errors {\n          code\n          commandName\n          message\n          field\n      }\n      cart {\n          cartId\n      }\n    }\n  }\n}\n";
//# sourceMappingURL=setCartSelectedShippingOption.graphql.js.map

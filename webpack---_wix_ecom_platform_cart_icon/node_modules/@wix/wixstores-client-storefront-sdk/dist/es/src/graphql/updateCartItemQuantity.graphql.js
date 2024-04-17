import { cartResponse } from "./schema/cartResponse";
export var query =
  "mutation updateItemQuantity($params: UpdateItemQuantityInput!) {\n  cart {\n    updateItemQuantity(params: $params) {\n      ".concat(
    cartResponse,
    "\n    }\n  }\n}\n"
  );
//# sourceMappingURL=updateCartItemQuantity.graphql.js.map

import { cartResponse } from "./schema/cartResponse";
export var query =
  "mutation removeItem($params: RemoveItemInput!) {\n  cart {\n    removeItem(params: $params) {\n      ".concat(
    cartResponse,
    "\n    }\n  }\n}\n"
  );
//# sourceMappingURL=removeCartItem.graphql.js.map

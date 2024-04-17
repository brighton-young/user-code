import { cartResponse } from "./schema/cartResponse";
export var query =
  "mutation setCoupon($params: SetCouponInput!) {\n  cart {\n    setCoupon(params: $params) {\n      ".concat(
    cartResponse,
    "\n    }\n  }\n}\n"
  );
//# sourceMappingURL=setCoupon.graphql.js.map

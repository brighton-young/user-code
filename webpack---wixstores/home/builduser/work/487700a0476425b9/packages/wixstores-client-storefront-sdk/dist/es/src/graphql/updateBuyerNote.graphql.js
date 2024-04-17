import { cartResponse } from "./schema/cartResponse";
export var query =
  "mutation updateBuyerNote($params: UpdateBuyerNoteInput!) {\n  cart {\n    updateBuyerNote(params: $params) {\n      ".concat(
    cartResponse,
    "\n    }\n  }\n}\n"
  );
//# sourceMappingURL=updateBuyerNote.graphql.js.map

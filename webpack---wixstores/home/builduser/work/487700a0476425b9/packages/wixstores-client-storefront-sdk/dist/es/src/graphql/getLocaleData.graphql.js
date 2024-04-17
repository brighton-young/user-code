export var query =
  "query getLocaleData($language: String!, $countryKeys: [String!], $subdivisionKeys: [String!]) {\n  localeData(language: $language) {\n    countries(keys: $countryKeys) {\n      displayName\n      subdivisions {\n        regions(keys: $subdivisionKeys) {\n          displayName\n        }\n      }\n    }\n  }\n}";
//# sourceMappingURL=getLocaleData.graphql.js.map

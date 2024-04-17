export var getCheckoutOutOfViewerUrl = function (queryParams) {
  var url = "https://www.cartscheckout.com/storefront/checkout?storeId="
    .concat(queryParams.storeId, "&payment=")
    .concat(queryParams.payment, "&forceLocale=")
    .concat(queryParams.locale, "&isPickupFlow=")
    .concat(queryParams.isPickUpFlow, "&origin=")
    .concat(queryParams.origin, "&originType=")
    .concat(queryParams.originType, "&instance=")
    .concat(queryParams.instance, "&isPrimaryLanguage=")
    .concat(queryParams.isPrimaryLanguage, "&deviceType=")
    .concat(queryParams.deviceType, "&a11y=")
    .concat(queryParams.isA11y);
  if (queryParams.cartId) {
    url += "&cartId=".concat(queryParams.cartId);
  }
  if (queryParams.country) {
    url += "&lang="
      .concat(queryParams.lang, "&dateNumberFormat=")
      .concat(queryParams.country);
  }
  if (!queryParams.consentPolicy.defaultPolicy) {
    url += "&consent-policy=".concat(
      queryParams.consentPolicyHeader["consent-policy"]
    );
  }
  if (queryParams.cashierPaymentId) {
    url += "&cashierPaymentId=".concat(queryParams.cashierPaymentId);
  }
  if (queryParams.checkoutId) {
    url += "&checkoutId=".concat(queryParams.checkoutId);
  }
  if (queryParams.continueShoppingUrl) {
    url += "&continueShoppingUrl=".concat(queryParams.continueShoppingUrl);
  }
  if (queryParams.isPreselectedFlow !== undefined) {
    url += "&isPreselectedFlow=".concat(queryParams.isPreselectedFlow);
  }
  if (queryParams.commonConfig) {
    url += "&commonConfig=".concat(JSON.stringify(queryParams.commonConfig));
  }
  return url;
};
//# sourceMappingURL=getCheckoutOutOfViewerUrl.js.map

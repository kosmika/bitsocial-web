# i18n Default Language Policy

Anonymous visitors resolve language in this order:

1. `?lang=` query param
2. Saved language selector choice (`localStorage` in the browser, mirrored to the `i18nextLng` cookie for SSR)
3. Browser/device language when it is one of our supported locales
4. Fall back to `en`

Country or region is not used to override a supported browser/device language. For example, `de-DE` resolves to German, `nl-NL` resolves to Dutch, and `pt-PT` resolves to Portuguese because those locale families are supported.

If no browser/device language matches a supported locale, visitors receive the English default.

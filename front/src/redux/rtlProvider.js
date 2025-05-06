// src/components/rtl-provider.js

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtl from "stylis-plugin-rtl";
import { useSelector } from "react-redux";

export function RtlProvider({ children }) {
  const options = {
    rtl: { key: "css-ar", stylisPlugins: [rtl] },
    ltr: { key: "css-en" },
  };
  const language = useSelector((state) => state.language.language);
  const dir = language == "ar" ? "rtl" : "ltr";
  const cache = createCache(options[dir]);
  return <CacheProvider value={cache} children={children} />;
}

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { Metadata } from "next";
import type { ServerFunctionClient } from "payload";
import type React from "react";
import { getServerSideURL } from "@/utilities/get-url";

import { importMap } from "./admin/importMap.js";
import "./custom.scss";

type Args = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

// biome-ignore lint/suspicious/useAwait: <3rd party code>
const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import type { Metadata } from "next";
import { getServerSideURL } from "@/utilities/get-url";
import { importMap } from "../importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: Args): Promise<Metadata> => {
  const metadata = await generatePageMetadata({ config, params, searchParams });
  return {
    ...metadata,
    metadataBase: new URL(getServerSideURL()),
  };
};

const Page = ({ params, searchParams }: Args) => (
  <RootPage
    config={config}
    importMap={importMap}
    params={params}
    searchParams={searchParams}
  />
);

export default Page;

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

import config from "@payload-config";
import { generatePageMetadata, NotFoundPage } from "@payloadcms/next/views";
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

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, params, searchParams, importMap });

export default NotFound;

import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  future: {
    v7_partialHydration: true,
  },
  basename:
    process.env.NODE_ENV === "production" ? "/outliers-visualization/" : "/",
} satisfies Config;

import type { Route } from "./+types/home";
import { OutliersVizualization } from "~/outliers-vizualization/outliers-vizualization";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Outliers Visualization" },
    { name: "description", content: "Welcome to Outliers Visualization!" },
  ];
}

export default function Home() {
  return <OutliersVizualization />;
}

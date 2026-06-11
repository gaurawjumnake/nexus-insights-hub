import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";
import { PagePlaceholder } from "./workforce.index";

export const Route = createFileRoute("/workforce/portfolio")({
  component: () => {
    const { companyLabel } = useWorkforce();
    return <PagePlaceholder title="Portfolio Overview" company={companyLabel} />;
  },
});

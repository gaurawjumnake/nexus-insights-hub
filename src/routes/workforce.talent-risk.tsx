import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";
import { PagePlaceholder } from "./workforce.index";

export const Route = createFileRoute("/workforce/talent-risk")({
  component: () => {
    const { companyLabel } = useWorkforce();
    return <PagePlaceholder title="Talent Risk & L&D" company={companyLabel} />;
  },
});

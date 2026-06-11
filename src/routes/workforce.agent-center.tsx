import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";
import { PagePlaceholder } from "./workforce.index";

export const Route = createFileRoute("/workforce/agent-center")({
  component: () => {
    const { companyLabel } = useWorkforce();
    return <PagePlaceholder title="AI Talent Agent Center" company={companyLabel} />;
  },
});

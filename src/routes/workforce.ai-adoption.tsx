import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";
import { PagePlaceholder } from "./workforce.index";

export const Route = createFileRoute("/workforce/ai-adoption")({
  component: () => {
    const { companyLabel } = useWorkforce();
    return <PagePlaceholder title="AI Adoption & Skills" company={companyLabel} />;
  },
});

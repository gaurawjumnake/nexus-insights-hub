import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";
import { PagePlaceholder } from "@/components/workforce/page-placeholder";

export const Route = createFileRoute("/workforce/ai-adoption")({
  component: () => {
    const { companyLabel } = useWorkforce();
    return <PagePlaceholder title="AI Adoption & Skills" company={companyLabel} />;
  },
});

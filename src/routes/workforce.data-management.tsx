import { createFileRoute } from "@tanstack/react-router";
import { useWorkforce } from "@/lib/workforce-context";
import { PagePlaceholder } from "@/components/workforce/page-placeholder";

export const Route = createFileRoute("/workforce/data-management")({
  component: () => {
    const { companyLabel } = useWorkforce();
    return <PagePlaceholder title="Workforce Data Management" company={companyLabel} />;
  },
});

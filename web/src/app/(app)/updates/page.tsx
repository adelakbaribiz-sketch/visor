import { DemoDataBadge } from "@/components/Badge";
import { getCountries, getUpdates, getVisaTypes } from "@/lib/data/client";
import { UpdatesExplorer } from "./UpdatesExplorer";

export default async function UpdatesPage() {
  const [updates, countries, visaTypes] = await Promise.all([
    getUpdates(),
    getCountries(),
    getVisaTypes(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
            Immigration updates
          </h1>
          <p className="text-sm text-foreground-muted">
            Search and filter the tracked update log.
          </p>
        </div>
        <DemoDataBadge label="Seeded sample records" />
      </div>
      <UpdatesExplorer updates={updates} countries={countries} visaTypes={visaTypes} />
    </div>
  );
}

import { ImportTool } from "@/components/import-tool";

export const dynamic = "force-dynamic";

export default function AdminImport() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl font-bold">Import from Pexels</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        Popular, free-to-use wallpapers. Each import is published with the photographer credited automatically.
      </p>
      <div className="mt-8">
        <ImportTool />
      </div>
    </div>
  );
}

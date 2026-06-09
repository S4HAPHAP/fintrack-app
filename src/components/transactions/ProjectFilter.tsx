"use client";
import { Select } from "@/components/ui/Select";
import { useLanguage } from "@/context/LanguageContext";

export function ProjectFilter({ projects, value, onChange }: { projects: string[]; value: string; onChange: (v: string) => void }) {
  const { t } = useLanguage();
  return (
    <div className="w-full sm:max-w-xs">
      <Select
        label={t.filterByProject}
        options={[t.allProjects, ...projects]}
        value={value || t.allProjects}
        onChange={(e) => onChange(e.target.value === t.allProjects ? "" : e.target.value)}
      />
    </div>
  );
}

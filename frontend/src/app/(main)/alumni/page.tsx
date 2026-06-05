"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ArrowUpDown, Users, Filter } from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { AlumniCard } from "@/components/features/alumni-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { EASE } from "@/lib/utils";
import type { Alumnus } from "@/types";

type Sort = "relevance" | "recent" | "alphabetical";

export default function AlumniPage() {
  const [all, setAll] = React.useState<Alumnus[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<{ year?: string; industry?: string; expertise?: string }>({});
  const [sort, setSort] = React.useState<Sort>("relevance");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    api<Alumnus[]>("/api/alumni").then(setAll).finally(() => setLoading(false));
  }, []);

  const industries = React.useMemo(() => Array.from(new Set(all.map((a) => a.industry))).sort(), [all]);
  const years = React.useMemo(
    () => Array.from(new Set(all.map((a) => a.gradYear))).sort((a, b) => b - a),
    [all]
  );
  const expertiseOptions = React.useMemo(
    () => Array.from(new Set(all.flatMap((a) => a.expertise))).sort(),
    [all]
  );

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    let out = all.filter((a) => {
      if (q && !`${a.name} ${a.role} ${a.company} ${a.university} ${a.major}`.toLowerCase().includes(q)) return false;
      if (filters.year && String(a.gradYear) !== filters.year) return false;
      if (filters.industry && a.industry !== filters.industry) return false;
      if (filters.expertise && !a.expertise.includes(filters.expertise)) return false;
      return true;
    });
    if (sort === "alphabetical") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "recent") out = [...out].sort((a, b) => b.gradYear - a.gradYear);
    return out;
  }, [all, search, filters, sort]);

  const activeFilters = Object.entries(filters).filter(([, v]) => !!v);

  const clearFilter = (k: string) => setFilters((f) => ({ ...f, [k]: undefined }));
  const clearAll = () => { setFilters({}); setSearch(""); };

  return (
    <div className="px-6 lg:px-12 py-10 lg:py-14 max-w-[1320px] mx-auto">
      <PageHeader
        eyebrow="Network"
        title={<>Alumni <span className="italic text-ink/40">directory</span></>}
        description="Connect with alumni across industries, universities, and graduating classes. Filter to find the right match."
        right={
          <Button
            variant="outline"
            onClick={() => setShowFilters((s) => !s)}
            className={showFilters ? "border-accent/40 text-accent" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="ml-1 h-4 min-w-[16px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        }
      />

      {/* Search + sort row */}
      <div className="mt-8 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, company, university…"
            className="pl-9 h-10"
          />
        </div>
        <SortMenu sort={sort} setSort={setSort} />
      </div>

      {/* Filter panel */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 border border-line/60">
              <FilterSelect label="Graduation year" value={filters.year} onChange={(v) => setFilters((f) => ({ ...f, year: v }))} options={years.map(String)} />
              <FilterSelect label="Industry" value={filters.industry} onChange={(v) => setFilters((f) => ({ ...f, industry: v }))} options={industries} />
              <FilterSelect label="Expertise" value={filters.expertise} onChange={(v) => setFilters((f) => ({ ...f, expertise: v }))} options={expertiseOptions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="mt-3 flex flex-wrap items-center gap-1.5 overflow-hidden"
          >
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {activeFilters.map(([k, v]) => (
              <motion.button
                key={k}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => clearFilter(k)}
                className="group inline-flex items-center gap-1 rounded-full bg-accent-soft border border-accent/20 text-accent px-2 py-1 text-[11px] font-medium"
              >
                {v}
                <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </motion.button>
            ))}
            <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-ink ml-1">
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {loading ? "Loading…" : `${filtered.length} of ${all.length} alumni`}
        </p>
      </div>

      {/* Grid */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[230px]" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyAlumni onReset={clearAll} />
          </div>
        ) : (
          filtered.map((a, i) => <AlumniCard key={a.id} alumnus={a} index={i} />)
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-9 rounded-lg bg-surface border border-line/80 px-2.5 text-sm text-ink outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-colors"
      >
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function SortMenu({ sort, setSort }: { sort: Sort; setSort: (s: Sort) => void }) {
  const labels: Record<Sort, string> = {
    relevance: "Relevance",
    recent: "Most recent",
    alphabetical: "A → Z",
  };
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-line/80 bg-surface p-0.5">
      {(Object.keys(labels) as Sort[]).map((k) => (
        <button
          key={k}
          onClick={() => setSort(k)}
          className={`relative h-9 px-3 text-[12px] font-medium rounded-md transition-colors ${
            sort === k ? "text-ink" : "text-muted-foreground hover:text-ink"
          }`}
        >
          {sort === k && (
            <motion.span
              layoutId="sort-active"
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute inset-0 rounded-md bg-muted"
            />
          )}
          <span className="relative inline-flex items-center gap-1">
            {k === "alphabetical" && <ArrowUpDown className="h-3 w-3" />}
            {labels[k]}
          </span>
        </button>
      ))}
    </div>
  );
}

function EmptyAlumni({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="rounded-2xl border border-dashed border-line/80 py-16 px-6 flex flex-col items-center text-center"
    >
      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-4">
        <Users className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-display text-xl text-ink">No alumni match your filters</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Try broadening your search or removing a filter. There are nearly always good people one step out.
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>Reset filters</Button>
    </motion.div>
  );
}

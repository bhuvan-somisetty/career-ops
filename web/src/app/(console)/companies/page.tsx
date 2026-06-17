'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, MapPin, Globe, Sparkles, ExternalLink, X, Briefcase, ChevronRight, Tag
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  overview: string;
  website: string;
  status: string;
  location: string;
  jobCount: number;
  allLocations: string[];
}

interface Job {
  id: string;
  title: string;
  location: string;
  category: string;
  workMode: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  atsUrl?: string;
}

export default function CompanyExplorerPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [query]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies?name=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCompanyDetails = async (company: Company) => {
    setSelectedCompany(company);
    setJobsLoading(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`);
      if (res.ok) {
        const data = await res.json();
        setCompanyJobs(data.company?.openJobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJobsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Company Explorer</h2>
        <p className="text-zinc-500 text-xs font-mono">Discover companies actively hiring and their open positions</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies by name..."
          className="w-full pl-8 pr-4 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-200 focus:border-emerald-500/40 focus:outline-none"
        />
      </div>

      {/* Grid of Companies */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-zinc-500 text-xs font-mono gap-2">
          <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading companies...
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-xs space-y-2">
          <Building2 className="w-8 h-8 mx-auto text-zinc-700" />
          <p>No companies found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <motion.div
              layoutId={`company-card-${company.id}`}
              key={company.id}
              onClick={() => openCompanyDetails(company)}
              className="p-5 rounded-xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-56 group cursor-pointer hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-300 font-mono text-xs font-bold uppercase">
                      {company.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">
                        {company.name}
                      </h4>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[8px] font-bold text-emerald-400">
                        {company.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 line-clamp-3 leading-relaxed">
                  {company.overview}
                </p>
              </div>

              <div className="border-t border-zinc-900/50 pt-3 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-600" />
                  {company.location.split('/')[0].trim()}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  <Briefcase className="w-3 h-3" />
                  {company.jobCount} {company.jobCount === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details drawer/modal */}
      <AnimatePresence>
        {selectedCompany && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCompany(null)}
              className="fixed inset-0 bg-black/60 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[580px] bg-zinc-950 border-l border-zinc-900 p-6 z-50 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-900 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 font-mono text-sm font-bold uppercase">
                      {selectedCompany.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100">{selectedCompany.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[8px] font-bold text-emerald-400">
                          {selectedCompany.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3" /> {selectedCompany.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="p-1 rounded-lg border border-zinc-850 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Company Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">About Company</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {selectedCompany.overview}
                  </p>
                </div>

                {/* Website Link */}
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-900/40 border border-zinc-900 text-[10px] font-mono text-zinc-400">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Official Website: </span>
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {selectedCompany.website.replace('https://', '')}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Open Jobs List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Open Opportunities ({selectedCompany.jobCount})
                  </h4>

                  {jobsLoading ? (
                    <div className="flex items-center justify-center py-10 text-zinc-500 text-xs font-mono gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading job listings...
                    </div>
                  ) : companyJobs.length === 0 ? (
                    <p className="text-[10px] text-zinc-500 font-mono italic">No open jobs found at this time.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {companyJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center group/job hover:border-zinc-800 transition-all"
                        >
                          <div className="space-y-1">
                            <h5 className="font-bold text-xs text-zinc-200 group-hover/job:text-emerald-400 transition-colors">
                              {job.title}
                            </h5>
                            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-zinc-500">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {job.location}
                              </span>
                              <span>·</span>
                              <span>{job.workMode}</span>
                              <span>·</span>
                              <span>{job.experienceLevel}</span>
                              {job.salaryMin && (
                                <>
                                  <span>·</span>
                                  <span className="text-emerald-400/90 font-medium">
                                    ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax ? job.salaryMax / 1000 : 0).toFixed(0)}k
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {job.atsUrl && (
                            <a
                              href={job.atsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 mt-6">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="w-full py-2 rounded-lg text-xs font-semibold cursor-pointer border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                >
                  Close Explorer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

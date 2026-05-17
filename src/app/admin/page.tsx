'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, FileText, TrendingUp, Plus, Loader2, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { getHolidayStats, getDocuments } from '@/lib/supabase-queries';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, national: 0, regional: 0, cutiBersama: 0 });
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  const loadData = useCallback(async () => {
    try {
      const [holidayStats, docs] = await Promise.all([
        getHolidayStats(currentYear),
        getDocuments(),
      ]);
      setStats(holidayStats);
      setDocumentCount(docs.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#003049] dark:text-[#669bbc]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#003049] dark:text-[#669bbc]">
          Dashboard
        </h1>
        <p className="text-[#003049]/60 dark:text-gray-400 mt-1">
          Selamat datang di panel admin Hari Libur Indo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hari Libur"
          value={stats.total}
          subtitle={`Tahun ${currentYear}`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Libur Nasional"
          value={stats.national}
          subtitle="Seluruh Indonesia"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Libur Regional"
          value={stats.regional}
          subtitle="Papua Barat Daya"
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Dokumen"
          value={documentCount}
          subtitle="Surat Edaran"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-[#003049] dark:text-gray-100 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            href="/admin/holidays/new"
            icon={Plus}
            title="Tambah Hari Libur"
            description="Buat data hari libur baru"
          />
          <QuickActionCard
            href="/admin/holidays"
            icon={Calendar}
            title="Kelola Hari Libur"
            description="Edit atau hapus data libur"
          />
          <QuickActionCard
            href="/admin/documents"
            icon={FileText}
            title="Upload Dokumen"
            description="Upload Surat Edaran resmi"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-[#669bbc]/10 dark:bg-[#669bbc]/5 rounded-lg border border-[#669bbc]/30 p-6">
        <div className="flex items-start gap-3">
          <Info className="text-[#003049] dark:text-[#669bbc] flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-[#003049] dark:text-[#669bbc] mb-2">
              Informasi
            </h3>
            <ul className="text-sm text-[#003049]/70 dark:text-gray-400 space-y-1">
              <li>Data hari libur akan ditampilkan di halaman publik</li>
              <li>Upload Surat Edaran sebagai sumber resmi</li>
              <li>Pastikan data libur sesuai dengan keputusan pemerintah</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-[#669bbc]/20 text-[#003049] dark:text-[#669bbc]',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#003049]/60 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-[#003049] dark:text-gray-100 mt-1">
            {value}
          </p>
          <p className="text-xs text-[#003049]/50 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border border-[#003049]/20 dark:border-slate-700 hover:bg-[#669bbc]/10 dark:hover:bg-slate-800 transition"
    >
      <div className="p-3 rounded-lg bg-[#003049] dark:bg-[#669bbc] text-white">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-medium text-[#003049] dark:text-gray-100">{title}</h3>
        <p className="text-sm text-[#003049]/60 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

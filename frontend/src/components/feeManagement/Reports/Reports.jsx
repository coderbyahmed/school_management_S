import { useState } from 'react';
import { ArrowTrendingUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CardSection from '../../common/CardSection/CardSection';
import SelectInput from '../../common/SelectInput/SelectInput';
import Button from '../../common/Button/Button';
import { feeReportData } from '../../../data/feeManagement/dummyData';

const formatCurrency = (val) => `Rs. ${Number(val).toLocaleString()}`;

const Reports = ({ onDataChange }) => {
  const [reportType, setReportType] = useState('Monthly Summary');
  const [dateRange, setDateRange] = useState('This Year');
  const [selectedClass, setSelectedClass] = useState('All');

  const totalCollected = feeReportData.monthlySummary.reduce((sum, m) => sum + m.total, 0);
  const totalPending = feeReportData.classWiseCollection.reduce((sum, c) => sum + c.pending, 0);

  const filteredClassData = feeReportData.classWiseCollection.filter((c) =>
    selectedClass === 'All' || c.className === selectedClass
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyze fee collections, pending amounts, and payment trends</p>
        </div>
        <button className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
          <ArrowDownTrayIcon className="h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SelectInput label="Report Type" name="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} options={['Monthly Summary', 'Class-wise', 'Payment Method']} className="sm:w-48 mb-0" />
          <SelectInput label="Date Range" name="dateRange" value={dateRange} onChange={(e) => setDateRange(e.target.value)} options={['This Month', 'This Quarter', 'This Year', 'Last Year']} className="sm:w-40 mb-0" />
          <SelectInput label="Class" name="selectedClass" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} options={['All', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']} className="sm:w-40 mb-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collected</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collection Rate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {reportType === 'Monthly Summary' && (
        <>
          <CardSection title="Monthly Collection Summary">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeReportData.monthlySummary} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend verticalAlign="top" height={30} />
                  <Bar dataKey="monthly" fill="#2563eb" radius={[4, 4, 0, 0]} name="Monthly Fee" maxBarSize={35} />
                  <Bar dataKey="admission" fill="#22c55e" radius={[4, 4, 0, 0]} name="Admission Fee" maxBarSize={35} />
                  <Bar dataKey="exam" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Exam Fee" maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardSection>

          <CardSection title="Total Collection Trend">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeReportData.monthlySummary} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5, fill: '#2563eb' }} activeDot={{ r: 7 }} name="Total Collection" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardSection>
        </>
      )}

      {reportType === 'Class-wise' && (
        <CardSection title="Class-wise Fee Collection">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredClassData} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)} />
                <YAxis type="category" dataKey="className" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="top" height={30} />
                <Bar dataKey="collected" fill="#22c55e" name="Collected" maxBarSize={25} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Collected</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Pending</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Collection %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClassData.map((row) => {
                  const total = row.collected + row.pending;
                  const pct = ((row.collected / total) * 100).toFixed(1);
                  return (
                    <tr key={row.className} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.className}</td>
                      <td className="px-4 py-3 text-green-600 dark:text-green-400">{formatCurrency(row.collected)}</td>
                      <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400">{formatCurrency(row.pending)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardSection>
      )}

      {reportType === 'Payment Method' && (
        <>
          <CardSection title="Payment Method Distribution">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Cash', value: feeReportData.paymentMethodBreakdown[0].amount, fill: '#2563eb' },
                        { name: 'Bank Transfer', value: feeReportData.paymentMethodBreakdown[1].amount, fill: '#22c55e' },
                        { name: 'Online Payment', value: feeReportData.paymentMethodBreakdown[2].amount, fill: '#f59e0b' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {feeReportData.paymentMethodBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#2563eb', '#22c55e', '#f59e0b'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {feeReportData.paymentMethodBreakdown.map((method) => (
                  <div key={method.method} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{method.method}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{method.count} transactions</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(method.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardSection>

          <CardSection title="Payment Method Details">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Payment Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Transactions</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {feeReportData.paymentMethodBreakdown.map((method) => {
                    const totalAmount = feeReportData.paymentMethodBreakdown.reduce((sum, m) => sum + m.amount, 0);
                    const pct = ((method.amount / totalAmount) * 100).toFixed(1);
                    return (
                      <tr key={method.method} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{method.method}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{method.count}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(method.amount)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardSection>
        </>
      )}
    </div>
  );
};

export default Reports;

import type { Payment } from '@/types';
import { formatPrice, PAYMENT_METHODS } from '@/lib/constants';
import { CheckCircle2, XCircle, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Props {
  payments: Payment[];
  onUpdateStatus: (id: string, status: string) => void;
}

export function Finance({ payments, onUpdateStatus }: Props) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = payments.filter((p) => statusFilter === 'ALL' || p.status === statusFilter);

  const totalRevenue = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0);
  const pendingAmount = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount), 0);
  const failedAmount = payments.filter((p) => p.status === 'FAILED').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-savanna-50 flex items-center justify-center"><DollarSign className="w-4 h-4 text-savanna-600" /></div>
            <span className="text-sm text-baobab-500">Receita total</span>
          </div>
          <div className="text-2xl font-bold text-savanna-700">{formatPrice(totalRevenue, 'AOA')}</div>
        </div>
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-acacia-50 flex items-center justify-center"><Clock className="w-4 h-4 text-acacia-600" /></div>
            <span className="text-sm text-baobab-500">Pendente</span>
          </div>
          <div className="text-2xl font-bold text-acacia-700">{formatPrice(pendingAmount, 'AOA')}</div>
        </div>
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-okapika-50 flex items-center justify-center"><XCircle className="w-4 h-4 text-okapika-600" /></div>
            <span className="text-sm text-baobab-500">Com erro</span>
          </div>
          <div className="text-2xl font-bold text-okapika-700">{formatPrice(failedAmount, 'AOA')}</div>
        </div>
      </div>

      {/* Filters */}
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input text-sm w-48">
        <option value="ALL">Todos os estados</option>
        <option value="PENDING">Pendente</option>
        <option value="COMPLETED">Concluído</option>
        <option value="FAILED">Falhado</option>
        <option value="REFUNDED">Reembolsado</option>
        <option value="CANCELLED">Cancelado</option>
      </select>

      {/* Table */}
      <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-baobab-50 border-b border-baobab-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Método</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden lg:table-cell">Referência</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Data</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baobab-50">
            {filtered.map((pay) => (
              <tr key={pay.id} className="hover:bg-baobab-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-earth-800 text-sm">{formatPrice(pay.amount, pay.currency)}</div>
                  {pay.description && <div className="text-xs text-baobab-400 truncate max-w-[200px]">{pay.description}</div>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-baobab-600">{PAYMENT_METHODS.find((m) => m.value === pay.payment_method)?.label || pay.payment_method}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-baobab-400">{pay.reference || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-baobab-400">{new Date(pay.created_at).toLocaleDateString('pt-AO')}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge ${
                    pay.status === 'COMPLETED' ? 'bg-savanna-50 text-savanna-700 border-savanna-200' :
                    pay.status === 'PENDING' ? 'bg-acacia-50 text-acacia-700 border-acacia-200' :
                    pay.status === 'FAILED' ? 'bg-okapika-50 text-okapika-700 border-okapika-200' :
                    'bg-baobab-100 text-baobab-600 border-baobab-200'
                  }`}>{pay.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {pay.status === 'PENDING' && (
                      <button onClick={() => onUpdateStatus(pay.id, 'COMPLETED')} className="p-1.5 rounded text-savanna-600 hover:bg-savanna-50" title="Aprovar">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {pay.status === 'COMPLETED' && (
                      <button onClick={() => onUpdateStatus(pay.id, 'REFUNDED')} className="p-1.5 rounded text-okapika-600 hover:bg-okapika-50" title="Reembolsar">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    {pay.status === 'PENDING' && (
                      <button onClick={() => onUpdateStatus(pay.id, 'FAILED')} className="p-1.5 rounded text-okapika-600 hover:bg-okapika-50" title="Marcar como erro">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center"><p className="text-baobab-500">Sem pagamentos registados.</p></div>}
      </div>
    </div>
  );
}

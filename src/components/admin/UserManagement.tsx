import { useState } from 'react';
import type { Profile } from '@/types';
import {
  Search, Ban, CheckCircle2, Shield, AlertTriangle, X, Mail, Phone, MapPin,
} from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

interface Props {
  users: Profile[];
  currentUserId: string;
  onRoleChange: (id: string, role: string) => void;
  onBlockUser: (id: string, isBlocked: boolean) => void;
  onVerifyUser: (id: string, isVerified: boolean) => void;
}

export function UserManagement({ users, currentUserId, onRoleChange, onBlockUser, onVerifyUser }: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [confirmSuperAdmin, setConfirmSuperAdmin] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || (u.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, role: string) => {
    if (role === 'SUPER_ADMIN' && userId !== currentUserId) {
      setConfirmSuperAdmin(userId);
      return;
    }
    onRoleChange(userId, role);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-baobab-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar utilizadores..." className="input pl-9 text-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input text-sm w-48">
          <option value="ALL">Todos os roles</option>
          {USER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.labelPt}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-baobab-50 border-b border-baobab-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Utilizador</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Província</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-baobab-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-baobab-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 text-sm font-medium shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-earth-800 text-sm">{u.full_name || 'Sem nome'}</div>
                        <div className="text-xs text-baobab-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === currentUserId}
                      className="input text-sm py-1.5 w-40"
                    >
                      {USER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.labelPt}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-baobab-600">{u.province || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.is_blocked ? (
                      <span className="badge bg-okapika-50 text-okapika-700 border-okapika-200">Bloqueado</span>
                    ) : u.is_verified ? (
                      <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200">Verificado</span>
                    ) : (
                      <span className="badge bg-baobab-100 text-baobab-600 border-baobab-200">Ativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {!u.is_verified && !u.is_blocked && (
                        <button onClick={() => onVerifyUser(u.id, true)} className="p-1.5 rounded text-savanna-600 hover:bg-savanna-50" title="Verificar">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {u.id !== currentUserId && (
                        <button
                          onClick={() => onBlockUser(u.id, u.is_blocked)}
                          className={`p-1.5 rounded ${u.is_blocked ? 'text-savanna-600 hover:bg-savanna-50' : 'text-okapika-600 hover:bg-okapika-50'}`}
                          title={u.is_blocked ? 'Desbloquear' : 'Bloquear'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-baobab-500">Nenhum utilizador encontrado.</p>
          </div>
        )}
      </div>

      {/* User detail drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-baobab-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-earth-800">Detalhes do utilizador</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded hover:bg-baobab-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 text-2xl font-medium">
                  {selectedUser.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-display text-lg font-semibold text-earth-800">{selectedUser.full_name || 'Sem nome'}</div>
                  <div className="text-sm text-baobab-500">{selectedUser.email}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="badge bg-okapika-50 text-okapika-700 border-okapika-200">{selectedUser.role}</span>
                    {selectedUser.is_verified && <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200">Verificado</span>}
                    {selectedUser.is_blocked && <span className="badge bg-okapika-50 text-okapika-700 border-okapika-200">Bloqueado</span>}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {selectedUser.phone && <div className="flex items-center gap-2 text-sm text-baobab-600"><Phone className="w-4 h-4" /> {selectedUser.phone}</div>}
                {selectedUser.province && <div className="flex items-center gap-2 text-sm text-baobab-600"><MapPin className="w-4 h-4" /> {selectedUser.province}</div>}
                <div className="flex items-center gap-2 text-sm text-baobab-600"><Mail className="w-4 h-4" /> {selectedUser.email}</div>
              </div>
              {selectedUser.bio && <div className="bg-baobab-50 rounded-lg p-3 text-sm text-baobab-700">{selectedUser.bio}</div>}
              {selectedUser.agency_name && <div className="text-sm"><span className="text-baobab-500">Agência:</span> <span className="text-earth-700">{selectedUser.agency_name}</span></div>}
              {selectedUser.agent_license && <div className="text-sm"><span className="text-baobab-500">Licença:</span> <span className="text-earth-700">{selectedUser.agent_license}</span></div>}
              <div className="text-sm text-baobab-400">Membro desde: {new Date(selectedUser.created_at).toLocaleDateString('pt-AO')}</div>
              <div className="flex gap-2 pt-4 border-t border-baobab-100">
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                  disabled={selectedUser.id === currentUserId}
                  className="input text-sm flex-1"
                >
                  {USER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.labelPt}</option>)}
                </select>
                {selectedUser.id !== currentUserId && (
                  <button
                    onClick={() => { onBlockUser(selectedUser.id, selectedUser.is_blocked); }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedUser.is_blocked ? 'bg-savanna-600 text-white' : 'bg-okapika-600 text-white'}`}
                  >
                    {selectedUser.is_blocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPER_ADMIN confirmation */}
      {confirmSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmSuperAdmin(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-okapika-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-okapika-600" />
              </div>
              <h2 className="font-display text-lg font-semibold text-earth-800">Confirmação necessária</h2>
            </div>
            <p className="text-sm text-baobab-600 mb-4">
              Está prestes a atribuir o role <strong>SUPER_ADMIN</strong> a este utilizador. Este role concede acesso completo ao painel administrativo, incluindo gestão de utilizadores e configurações. Confirma esta ação?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmSuperAdmin(null)} className="btn-ghost flex-1">Cancelar</button>
              <button onClick={() => { onRoleChange(confirmSuperAdmin, 'SUPER_ADMIN'); setConfirmSuperAdmin(null); }} className="btn-primary flex-1">
                <Shield className="w-4 h-4" /> Confirmar SUPER_ADMIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

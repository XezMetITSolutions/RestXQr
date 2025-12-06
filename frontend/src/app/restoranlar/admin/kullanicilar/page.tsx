'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaArrowLeft,
  FaFilter,
  FaSort,
  FaEllipsisV
} from 'react-icons/fa';

// Örnek kullanıcı verileri
const MOCK_USERS = [
  {
    id: '1',
    name: 'Ahmet Kaya',
    email: 'ahmet.kaya@example.com',
    role: 'Yönetici',
    status: 'Aktif',
    lastActive: '10 dk önce',
    avatar: '/avatars/avatar1.png'
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    email: 'ayse.demir@example.com',
    role: 'Garson',
    status: 'Aktif',
    lastActive: '35 dk önce',
    avatar: '/avatars/avatar2.png'
  },
  {
    id: '3',
    name: 'Mehmet Yılmaz',
    email: 'mehmet.yilmaz@example.com',
    role: 'Şef',
    status: 'Aktif',
    lastActive: '1 saat önce',
    avatar: '/avatars/avatar3.png'
  },
  {
    id: '4',
    name: 'Zeynep Çelik',
    email: 'zeynep.celik@example.com',
    role: 'Kasiyer',
    status: 'İzinli',
    lastActive: '3 gün önce',
    avatar: '/avatars/avatar4.png'
  },
  {
    id: '5',
    name: 'Can Özkan',
    email: 'can.ozkan@example.com',
    role: 'Garson',
    status: 'Aktif',
    lastActive: '2 saat önce',
    avatar: '/avatars/avatar5.png'
  }
];

// Rol renkleri
const roleColors = {
  'Yönetici': 'bg-purple-100 text-purple-800',
  'Garson': 'bg-blue-100 text-blue-800',
  'Şef': 'bg-orange-100 text-orange-800',
  'Kasiyer': 'bg-green-100 text-green-800'
};

// Durum renkleri
const statusColors = {
  'Aktif': 'bg-green-100 text-green-800',
  'İzinli': 'bg-yellow-100 text-yellow-800',
  'Pasif': 'bg-gray-100 text-gray-800'
};

export default function KullanicilarPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Filtreleme fonksiyonu
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Kullanıcı silme fonksiyonu
  const handleDeleteUser = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/restoranlar/admin" className="mr-3">
                <FaArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
            </div>
            <Link 
              href="/restoranlar/admin/kullanicilar/ekle" 
              className="bg-white text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <FaPlus size={14} />
              <span>Kullanıcı Ekle</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="İsim veya e-posta ile ara..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">Tüm Roller</option>
                  <option value="Yönetici">Yönetici</option>
                  <option value="Garson">Garson</option>
                  <option value="Şef">Şef</option>
                  <option value="Kasiyer">Kasiyer</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <div className="relative">
                <select
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="Aktif">Aktif</option>
                  <option value="İzinli">İzinli</option>
                  <option value="Pasif">Pasif</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Kullanıcı Listesi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Kullanıcı
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Rol
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Durum
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Son Aktivite
                      <FaSort className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${roleColors[user.role as keyof typeof roleColors]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[user.status as keyof typeof statusColors]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <FaTrash />
                          </button>
                          <div className="relative group">
                            <button className="text-gray-600 hover:text-gray-900">
                              <FaEllipsisV />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Şifre Sıfırla</a>
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">İzin Ayarla</a>
                              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Görüntüle</a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaUsers className="text-gray-300 text-5xl mb-3" />
                        <p className="text-lg font-medium">Kullanıcı bulunamadı</p>
                        <p className="text-sm">Arama kriterlerinizi değiştirmeyi deneyin veya yeni bir kullanıcı ekleyin.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Toplam <span className="font-medium">{filteredUsers.length}</span> kullanıcıdan{' '}
                    <span className="font-medium">1</span> -{' '}
                    <span className="font-medium">{filteredUsers.length}</span> arası gösteriliyor
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Önceki</span>
                      &laquo;
                    </a>
                    <a
                      href="#"
                      aria-current="page"
                      className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Sonraki</span>
                      &raquo;
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

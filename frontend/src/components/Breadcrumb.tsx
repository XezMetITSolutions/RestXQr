'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FaHome, 
  FaChevronRight, 
  FaUser, 
  FaBuilding, 
  FaCreditCard, 
  FaExclamationTriangle, 
  FaBell, 
  FaCogs, 
  FaChartLine,
  FaUserCheck,
  FaPlus,
  FaEdit,
  FaEye
} from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: string;
  isActive?: boolean;
}

export default function Breadcrumb() {
  const pathname = usePathname();

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'FaHome': return <FaHome className="text-gray-500" />;
      case 'FaUser': return <FaUser className="text-blue-600" />;
      case 'FaBuilding': return <FaBuilding className="text-orange-600" />;
      case 'FaCreditCard': return <FaCreditCard className="text-green-600" />;
      case 'FaExclamationTriangle': return <FaExclamationTriangle className="text-red-600" />;
      case 'FaBell': return <FaBell className="text-purple-600" />;
      case 'FaCogs': return <FaCogs className="text-gray-600" />;
      case 'FaChartLine': return <FaChartLine className="text-indigo-600" />;
      case 'FaUserCheck': return <FaUserCheck className="text-green-600" />;
      case 'FaPlus': return <FaPlus className="text-blue-600" />;
      case 'FaEdit': return <FaEdit className="text-yellow-600" />;
      case 'FaEye': return <FaEye className="text-blue-600" />;
      default: return null;
    }
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Ana Sayfa', href: '/admin', icon: 'FaHome' }
    ];

    if (segments.length === 0) {
      return breadcrumbs;
    }

    // Ana sayfa segmenti
    if (segments[0] === 'admin') {
      if (segments.length === 1) {
        breadcrumbs[0].isActive = true;
        return breadcrumbs;
      }

      // Alt sayfalar
      const pageMap: { [key: string]: { label: string; icon: string } } = {
        'users': { label: 'Kullanıcı Yönetimi', icon: 'FaUser' },
        'restaurants': { label: 'Restoran Yönetimi', icon: 'FaBuilding' },
        'subscriptions': { label: 'Abonelik Yönetimi', icon: 'FaCreditCard' },
        'payment-errors': { label: 'Ödeme Hataları', icon: 'FaExclamationTriangle' },
        'user-approvals': { label: 'Kullanıcı Onayları', icon: 'FaUserCheck' },
        'notifications': { label: 'Bildirim Yönetimi', icon: 'FaBell' },
        'system': { label: 'Sistem Yönetimi', icon: 'FaCogs' },
        'analytics': { label: 'Analitik ve Raporlar', icon: 'FaChartLine' }
      };

      // İkinci segment (ana sayfa)
      if (segments[1] && pageMap[segments[1]]) {
        const page = pageMap[segments[1]];
        breadcrumbs.push({
          label: page.label,
          href: `/admin/${segments[1]}`,
          icon: page.icon
        });

        // Üçüncü segment (alt sayfa veya ID)
        if (segments[2]) {
          if (segments[2] === 'create') {
            breadcrumbs.push({
              label: 'Yeni Oluştur',
              href: `/admin/${segments[1]}/create`,
              icon: 'FaPlus',
              isActive: true
            });
          } else if (segments[2] === 'edit') {
            breadcrumbs.push({
              label: 'Düzenle',
              href: `/admin/${segments[1]}/edit`,
              icon: 'FaEdit',
              isActive: true
            });
          } else if (segments[2] === 'view') {
            breadcrumbs.push({
              label: 'Görüntüle',
              href: `/admin/${segments[1]}/view`,
              icon: 'FaEye',
              isActive: true
            });
          } else {
            // ID segmenti - dinamik olarak oluştur
            const id = segments[2];
            let itemLabel = 'Detay';
            
            // ID'ye göre özel etiketler
            if (segments[1] === 'users') {
              itemLabel = `Kullanıcı #${id}`;
            } else if (segments[1] === 'restaurants') {
              itemLabel = `Restoran #${id}`;
            } else if (segments[1] === 'subscriptions') {
              itemLabel = `Abonelik #${id}`;
            } else if (segments[1] === 'payment-errors') {
              itemLabel = `Hata #${id}`;
            } else if (segments[1] === 'notifications') {
              itemLabel = `Bildirim #${id}`;
            }

            breadcrumbs.push({
              label: itemLabel,
              href: `/admin/${segments[1]}/${id}`,
              icon: 'FaEye',
              isActive: true
            });
          }
        } else {
          // İkinci segment aktif
          breadcrumbs[1].isActive = true;
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <FaChevronRight className="text-gray-400 text-xs" />
          )}
          
          {item.isActive ? (
            <div className="flex items-center space-x-2">
              {item.icon && getIcon(item.icon)}
              <span className="text-gray-900 font-medium">{item.label}</span>
            </div>
          ) : (
            <Link 
              href={item.href}
              className="flex items-center space-x-2 hover:text-gray-700 transition-colors"
            >
              {item.icon && getIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

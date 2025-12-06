'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBuilding, 
  FaCheck, 
  FaTimes, 
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaImage,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaBan
} from 'react-icons/fa';

interface RestaurantApplication {
  id: string;
  name: string;
  owner: {
    name: string;
    email: string;
    phone: string;
    idNumber: string;
  };
  business: {
    type: string;
    description: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    workingHours: string;
    capacity: number;
    establishedYear: number;
  };
  documents: {
    businessLicense: string;
    taxCertificate: string;
    idCopy: string;
    photos: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

function RestaurantApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('id');
  
  const [application, setApplication] = useState<RestaurantApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Demo: Restoran başvuru verilerini yükle
    const loadApplication = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo veri
      const demoApplication: RestaurantApplication = {
        id: restaurantId || '1',
        name: 'Lezzet Durağı',
        owner: {
          name: 'Ahmet Yılmaz',
          email: 'ahmet@lezzetduragi.com',
          phone: '+90 532 123 4567',
          idNumber: '12345678901'
        },
        business: {
          type: 'Restoran',
          description: 'Geleneksel Türk mutfağı ve modern lezzetlerin buluştuğu nezih bir mekan.',
          address: 'Bağdat Caddesi No: 123',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710',
          workingHours: '09:00 - 23:00',
          capacity: 80,
          establishedYear: 2020
        },
        documents: {
          businessLicense: 'isletme_ruhsati.pdf',
          taxCertificate: 'vergi_levhasi.pdf',
          idCopy: 'kimlik_kopyasi.pdf',
          photos: ['restoran1.jpg', 'restoran2.jpg', 'restoran3.jpg']
        },
        status: 'pending',
        appliedAt: '2024-03-15T10:30:00Z',
        notes: 'Başvuru eksiksiz görünüyor. Belge kontrolü yapıldı.'
      };
      
      setApplication(demoApplication);
      setIsLoading(false);
    };

    if (restaurantId) {
      loadApplication();
    }
  }, [restaurantId]);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // Demo: Onay işlemi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setApplication(prev => prev ? {
        ...prev,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin User'
      } : null);
      
      // Başarı mesajı ve yönlendirme
      setTimeout(() => {
        router.push('/admin/restaurants?status=approved');
      }, 2000);
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Red nedeni belirtmelisiniz');
      return;
    }

    setIsProcessing(true);
    try {
      // Demo: Red işlemi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setApplication(prev => prev ? {
        ...prev,
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin User',
        rejectionReason
      } : null);
      
      // Başarı mesajı ve yönlendirme
      setTimeout(() => {
        router.push('/admin/restaurants?status=rejected');
      }, 2000);
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Başvuru yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Başvuru Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız restoran başvurusu bulunamadı.</p>
          <Link href="/admin/restaurants" className="text-blue-600 hover:underline">
            İşletmeler listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/admin/restaurants"
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="text-xl" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restoran Onay İşlemi</h1>
                <p className="text-gray-600 mt-1">{application.name} - Başvuru Detayları</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded-full font-medium flex items-center ${
                application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {application.status === 'pending' ? <FaClock className="mr-1" /> :
                 application.status === 'approved' ? <FaCheckCircle className="mr-1" /> :
                 <FaBan className="mr-1" />}
                {application.status === 'pending' ? 'Bekliyor' :
                 application.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Başvuru Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* İşletme Sahibi Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2" />
                İşletme Sahibi Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <p className="mt-1 text-sm text-gray-900">{application.owner.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    {application.owner.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    {application.owner.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
                  <p className="mt-1 text-sm text-gray-900">{application.owner.idNumber}</p>
                </div>
              </div>
            </div>

            {/* İşletme Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaBuilding className="mr-2" />
                İşletme Bilgileri
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">İşletme Adı</label>
                    <p className="mt-1 text-sm text-gray-900">{application.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">İşletme Türü</label>
                    <p className="mt-1 text-sm text-gray-900">{application.business.type}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <p className="mt-1 text-sm text-gray-900">{application.business.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adres</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-start">
                      <FaMapMarkerAlt className="mr-2 text-gray-400 mt-0.5" />
                      {application.business.address}, {application.business.district}, {application.business.city}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Posta Kodu</label>
                    <p className="mt-1 text-sm text-gray-900">{application.business.postalCode}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Çalışma Saatleri</label>
                    <p className="mt-1 text-sm text-gray-900">{application.business.workingHours}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                    <p className="mt-1 text-sm text-gray-900">{application.business.capacity} kişi</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kuruluş Yılı</label>
                    <p className="mt-1 text-sm text-gray-900">{application.business.establishedYear}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Belgeler */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2" />
                Yüklenen Belgeler
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaFileAlt className="mr-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">İşletme Ruhsatı</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <FaDownload className="mr-1" />
                    İndir
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaFileAlt className="mr-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Vergi Levhası</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <FaDownload className="mr-1" />
                    İndir
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaFileAlt className="mr-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Kimlik Kopyası</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <FaDownload className="mr-1" />
                    İndir
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">İşletme Fotoğrafları</h3>
                <div className="grid grid-cols-3 gap-2">
                  {application.documents.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <FaImage className="text-gray-400 text-2xl" />
                      </div>
                      <button className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <FaEye className="text-white text-xl" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Onay İşlemleri */}
          <div className="space-y-6">
            {/* Onay İşlemleri */}
            {application.status === 'pending' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Onay İşlemi</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Red Nedeni (Red edilecekse)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Red nedeni belirtiniz..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İşlem notları..."
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      {isProcessing && action === 'approve' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          Onayla
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      {isProcessing && action === 'reject' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <FaTimes className="mr-2" />
                          Reddet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Başvuru Durumu */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Başvuru Durumu</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Başvuru Tarihi</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                {application.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">İncelenme Tarihi</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(application.reviewedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
                
                {application.reviewedBy && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">İnceleyen</span>
                    <span className="text-sm font-medium text-gray-900">{application.reviewedBy}</span>
                  </div>
                )}
                
                {application.rejectionReason && (
                  <div>
                    <span className="text-sm text-gray-600">Red Nedeni</span>
                    <p className="text-sm text-gray-900 mt-1">{application.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hızlı İşlemler */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
              
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                  <FaPhone className="mr-2" />
                  Arama Yap
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                  <FaEnvelope className="mr-2" />
                  Email Gönder
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                  <FaFileAlt className="mr-2" />
                  Rapor Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function RestaurantApprovePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <RestaurantApprovalContent />
    </Suspense>
  );
}


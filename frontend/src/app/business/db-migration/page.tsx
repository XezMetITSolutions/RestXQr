'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Database, AlertTriangle } from 'lucide-react';

export default function DatabaseMigrationPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        alreadyExists?: boolean;
        timestamp?: string;
        error?: string;
    } | null>(null);

    const runMigration = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/add-kitchen-station`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                message: 'Bağlantı hatası oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Veritabanı Migration</h1>
                <p className="text-muted-foreground">
                    Bu sayfa veritabanı şemasını güncellemek için kullanılır.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Kitchen Station Kolonu Ekle
                    </CardTitle>
                    <CardDescription>
                        menu_items tablosuna kitchen_station kolonu ekler. Bu kolon, ürünlerin hangi mutfak istasyonuna
                        ait olduğunu belirtir (izgara, makarna, soğuk, tatlı).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Dikkat:</strong> Bu işlem veritabanı şemasını değiştirir. Sadece gerektiğinde çalıştırın.
                            Kolon zaten mevcutsa hiçbir değişiklik yapmaz.
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-3">
                        <Button
                            onClick={runMigration}
                            disabled={loading}
                            size="lg"
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Migration Çalıştırılıyor...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-4 w-4" />
                                    Migration'ı Çalıştır
                                </>
                            )}
                        </Button>
                    </div>

                    {result && (
                        <Alert variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>
                                <div className="space-y-2">
                                    <p className="font-semibold">{result.message}</p>
                                    {result.alreadyExists && (
                                        <p className="text-sm text-muted-foreground">
                                            ✅ Kolon zaten mevcut - hiçbir değişiklik yapılmadı
                                        </p>
                                    )}
                                    {result.error && (
                                        <p className="text-sm text-red-600 mt-2">
                                            Hata detayı: {result.error}
                                        </p>
                                    )}
                                    {result.timestamp && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Zaman: {new Date(result.timestamp).toLocaleString('tr-TR')}
                                        </p>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">Migration Detayları:</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Tablo: <code className="bg-background px-1 rounded">menu_items</code></li>
                            <li>• Kolon: <code className="bg-background px-1 rounded">kitchen_station</code></li>
                            <li>• Tip: <code className="bg-background px-1 rounded">VARCHAR(50) NULL</code></li>
                            <li>• Değerler: izgara, makarna, soguk, tatli</li>
                        </ul>
                    </div>

                    <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                        <h4 className="font-semibold text-sm mb-2">Ne Zaman Kullanılır?</h4>
                        <p className="text-sm text-muted-foreground">
                            Eğer ürün düzenlerken &quot;istasyon&quot; kaydetmeye çalıştığınızda <strong>Internal Server Error</strong> alıyorsanız,
                            bu migration&apos;ı çalıştırmanız gerekir. Migration, eksik olan veritabanı kolonunu ekler.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

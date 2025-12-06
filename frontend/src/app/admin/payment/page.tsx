"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BillingCycle = "monthly" | "semiannual" | "annual";

type PlanId = "basic" | "pro" | "premium";

type ExtraId =
  | "extraUsers"
  | "aiMenuTranslate"
  | "prioritySupport"
  | "customDomain"
  | "apiAccess";

const PLANS: Record<PlanId, { name: string; priceMonthly: number; features: string[] }>
  = {
    basic: {
      name: "Standart Paket",
      priceMonthly: 2490,
      features: [
        "Temel menü yönetimi",
        "QR menü",
        "Günlük 5.000 görüntüleme",
      ],
    },
    pro: {
      name: "Profesyonel Paket",
      priceMonthly: 3490,
      features: [
        "Sınırsız menü kategorisi",
        "Gelişmiş raporlar",
        "Öncelikli indeksleme",
      ],
    },
    premium: {
      name: "Premium Paket",
      priceMonthly: 4980,
      features: [
        "Çoklu şube yönetimi",
        "Çok dilli menü",
        "Gelişmiş özelleştirme",
      ],
    },
  };

const BILLING_MULTIPLIERS: Record<BillingCycle, { months: number; discountPct: number }>
  = {
    monthly: { months: 1, discountPct: 0 },
    semiannual: { months: 6, discountPct: 0.17 },
    annual: { months: 12, discountPct: 0.2 },
  };

const EXTRAS: Record<ExtraId, { name: string; description: string; priceMonthly: number }>
  = {
    extraUsers: {
      name: "Ek Kullanıcı Paketi",
      description: "+10 kullanıcı",
      priceMonthly: 290,
    },
    aiMenuTranslate: {
      name: "AI Çeviri Paketi",
      description: "Sınırsız menü çeviri",
      priceMonthly: 690,
    },
    prioritySupport: {
      name: "Öncelikli Destek",
      description: "7/24 öncelikli destek",
      priceMonthly: 390,
    },
    customDomain: {
      name: "Özel Alan Adı",
      description: "menu.sizinmarka.com",
      priceMonthly: 190,
    },
    apiAccess: {
      name: "API Erişimi",
      description: "Entegrasyonlar için API",
      priceMonthly: 490,
    },
  };

export default function AdminPaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("premium");
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedExtras, setSelectedExtras] = useState<Record<ExtraId, boolean>>({
    extraUsers: false,
    aiMenuTranslate: false,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
  });

  const planPriceMonthly = PLANS[selectedPlan].priceMonthly;

  const extrasMonthlyTotal = useMemo(() =>
    Object.entries(selectedExtras).reduce((sum, [key, isOn]) => {
      if (!isOn) return sum;
      const e = EXTRAS[key as ExtraId];
      return sum + (e?.priceMonthly || 0);
    }, 0), [selectedExtras]);

  const totals = useMemo(() => {
    const m = BILLING_MULTIPLIERS[billing];
    const monthlySubtotal = planPriceMonthly + extrasMonthlyTotal;
    const beforeDiscount = monthlySubtotal * m.months;
    const discount = beforeDiscount * m.discountPct;
    const grand = Math.round(beforeDiscount - discount);
    return { monthlySubtotal, beforeDiscount, discount, grand };
  }, [billing, planPriceMonthly, extrasMonthlyTotal]);

  const startCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          planName: PLANS[selectedPlan].name,
          billing,
          items: [
            {
              name: PLANS[selectedPlan].name,
              unit_amount: planPriceMonthly,
            },
            ...Object.entries(selectedExtras)
              .filter(([, v]) => v)
              .map(([k]) => ({
                name: EXTRAS[k as ExtraId].name,
                unit_amount: EXTRAS[k as ExtraId].priceMonthly,
              })),
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Ödeme başlatılamadı");
      }

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Yönlendirme adresi alınamadı");
      }
    } catch (error) {
      // Stripe anahtarı yoksa demo akışına düş
      console.error(error);
      alert(
        "Ödeme entegrasyonu yapılandırılmamış görünüyor. Demo ödeme tamamlandı olarak işaretlenecek."
      );
      router.push("/admin/payment/success");
    }
  };

  const toggleExtra = (id: ExtraId) => {
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
          <span className="text-2xl">💳</span>
          <div>
            <div className="font-semibold">Ödeme & Abonelik</div>
            <div className="text-sm text-purple-700/80">Paketinizi ve ek hizmetleri yönetin</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mevcut plan */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-700 font-semibold">
                  <span className="text-xl">⚙️</span>
                  <span>Mevcut Planınız</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-orange-800">{PLANS[selectedPlan].name}</div>
                <div className="text-orange-700/80">₺{planPriceMonthly}/ay — Aktif</div>
              </div>
              <div className="text-right text-orange-700/90">
                <div>Sonraki ödeme</div>
                <div className="font-semibold">—</div>
              </div>
            </div>
          </div>

          {/* Faturalandırma dönemi */}
          <div className="rounded-xl border p-5">
            <div className="font-semibold mb-1">Faturalandırma Dönemini Değiştir</div>
            <div className="text-sm text-gray-500 mb-4">Yıllık plana geçerek %20 tasarruf edin!</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { id: "monthly", label: "Aylık", info: "Her ay ödeme" },
                  { id: "semiannual", label: "6 Aylık", info: "%17 indirim" },
                  { id: "annual", label: "Yıllık", info: "%20 indirim" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBilling(opt.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${
                    billing === opt.id
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-sm text-gray-500">{opt.info}</div>
                  <div className="mt-2 text-orange-600 font-bold">₺{planPriceMonthly}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ek Hizmetler */}
          <div className="rounded-xl border p-5">
            <div className="font-semibold mb-4">Ek Hizmetler</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(EXTRAS).map(([id, extra]) => (
                <label
                  key={id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors flex items-start gap-3 ${
                    selectedExtras[id as ExtraId]
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!selectedExtras[id as ExtraId]}
                    onChange={() => toggleExtra(id as ExtraId)}
                  />
                  <div>
                    <div className="font-medium text-gray-800">{extra.name}</div>
                    <div className="text-sm text-gray-500">{extra.description}</div>
                  </div>
                  <div className="ml-auto text-orange-600 font-semibold">₺{extra.priceMonthly}/ay</div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sepet */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border p-5 sticky top-6">
            <div className="font-semibold text-gray-800 mb-2">Sepetiniz</div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>{PLANS[selectedPlan].name}</div>
              <div>₺{planPriceMonthly}</div>
            </div>
            {Object.entries(selectedExtras)
              .filter(([, v]) => v)
              .map(([id]) => (
                <div key={id} className="flex items-center justify-between py-2 border-b">
                  <div>{EXTRAS[id as ExtraId].name}</div>
                  <div>₺{EXTRAS[id as ExtraId].priceMonthly}</div>
                </div>
              ))}

            <div className="flex items-center justify-between py-3 mt-1">
              <div className="font-medium">Aylık ödeme</div>
              <div className="font-semibold">₺{Math.round(totals.monthlySubtotal)}</div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>İndirim</div>
              <div>-₺{Math.round(totals.discount)}</div>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold mt-3">
              <div>Toplam</div>
              <div>₺{totals.grand}</div>
            </div>

            <button
              onClick={startCheckout}
              className="mt-5 w-full rounded-lg bg-orange-600 text-white py-3 font-medium hover:bg-orange-700"
            >
              Ödeme Yap (₺{Math.round(totals.monthlySubtotal)})
            </button>
            <div className="text-xs text-gray-500 mt-2">
              Seçilen faturalandırma dönemine göre toplam tutar: ₺{totals.grand}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



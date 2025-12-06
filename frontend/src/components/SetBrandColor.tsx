"use client";

import { useEffect } from 'react';
import useBusinessSettingsStore from '@/store/useBusinessSettingsStore';

export default function SetBrandColor() {
  const { settings } = useBusinessSettingsStore();

  useEffect(() => {
    if (typeof document !== 'undefined' && settings?.branding) {
      console.log('SetBrandColor: Updating styles...', {
        primaryColor: settings?.branding?.primaryColor,
        fontFamily: settings?.branding?.fontFamily,
        fontSize: settings?.branding?.fontSize
      });

      // Brand color ayarla + türetilmiş renkler
      const primaryColor = settings?.branding?.primaryColor || '#8B5CF6';
      const secondaryColor = settings?.branding?.secondaryColor || primaryColor;
      document.documentElement.style.setProperty('--brand-primary', primaryColor);
      document.documentElement.style.setProperty('--brand-secondary', secondaryColor);

      // Yardımcı: hex -> rgba
      const hexToRgb = (hex: string) => {
        const h = hex.replace('#','');
        const r = parseInt(h.substring(0,2),16);
        const g = parseInt(h.substring(2,4),16);
        const b = parseInt(h.substring(4,6),16);
        return { r, g, b };
      };

      const rgbToHex = (r:number,g:number,b:number) => {
        const toHex = (n:number) => n.toString(16).padStart(2,'0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      };

      const hexToHsl = (hex:string) => {
        const { r, g, b } = hexToRgb(hex);
        const r1 = r/255, g1 = g/255, b1 = b/255;
        const max = Math.max(r1,g1,b1), min = Math.min(r1,g1,b1);
        let h = 0, s = 0, l = (max+min)/2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
            case g1: h = (b1 - r1) / d + 2; break;
            case b1: h = (r1 - g1) / d + 4; break;
          }
          h /= 6;
        }
        return { h: h*360, s: s*100, l: l*100 };
      };

      const hslToHex = (h:number,s:number,l:number) => {
        h/=360; s/=100; l/=100;
        const hue2rgb = (p:number, q:number, t:number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        let r:number,g:number,b:number;
        if (s === 0) { r = g = b = l; }
        else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
        }
        return rgbToHex(Math.round(r*255), Math.round(g*255), Math.round(b*255));
      };

      // Yardımcı: kontrast için metin rengi seç
      const getContrastingText = (hex: string) => {
        const { r, g, b } = hexToRgb(hex);
        // W3C luminance
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luminance > 0.6 ? '#111111' : '#FFFFFF';
      };

      // Açık tonlar (surface) ve vurgu tonları
      const { r, g, b } = hexToRgb(primaryColor);
      const surface = `rgba(${r}, ${g}, ${b}, 0.08)`; // arkaplan
      const subtle = `rgba(${r}, ${g}, ${b}, 0.16)`; // sınır/rozet
      const strong = `rgba(${r}, ${g}, ${b}, 1)`;   // metin/ikon
      document.documentElement.style.setProperty('--brand-surface', surface);
      document.documentElement.style.setProperty('--brand-subtle', subtle);
      document.documentElement.style.setProperty('--brand-strong', strong);

      // Degrade
      document.documentElement.style.setProperty('--brand-gradient', `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`);

      // Kontrast metin renkleri
      document.documentElement.style.setProperty('--on-primary', getContrastingText(primaryColor));
      document.documentElement.style.setProperty('--on-secondary', getContrastingText(secondaryColor));
      document.documentElement.style.setProperty('--on-surface', '#111111');

      // Uyumlu yan tonlar (mor seçilse bile hepsi mor olmaz)
      const base = hexToHsl(primaryColor);
      const tone = (shift:number, sat:number, light:number) => {
        const h = (base.h + shift + 360) % 360;
        const s = Math.min(100, Math.max(20, base.s * sat));
        const l = Math.min(98, Math.max(85, light));
        return hslToHex(h, s, l);
      };
      const tone1 = tone(30, 0.7, 95); // sıcak açık ton
      const tone2 = tone(-30, 0.7, 95); // serin açık ton
      const tone3 = tone(180, 0.5, 94); // tamamlayıcı açık ton
      const tone4 = tone(90, 0.6, 96); // doğal açık ton
      document.documentElement.style.setProperty('--tone1-bg', tone1);
      document.documentElement.style.setProperty('--tone2-bg', tone2);
      document.documentElement.style.setProperty('--tone3-bg', tone3);
      document.documentElement.style.setProperty('--tone4-bg', tone4);
      document.documentElement.style.setProperty('--tone1-text', '#303030');
      document.documentElement.style.setProperty('--tone2-text', '#303030');
      document.documentElement.style.setProperty('--tone3-text', '#303030');
      document.documentElement.style.setProperty('--tone4-text', '#303030');
      // Kenar izlenimi için hafif koyu sınır
      document.documentElement.style.setProperty('--tone1-border', surface);
      document.documentElement.style.setProperty('--tone2-border', surface);
      document.documentElement.style.setProperty('--tone3-border', surface);
      document.documentElement.style.setProperty('--tone4-border', surface);
      console.log('Set brand color:', primaryColor);

      // Font family ayarla
      const fontFamily = settings?.branding?.fontFamily || 'Inter';
      document.documentElement.style.setProperty('--font-family', fontFamily);
      console.log('Set font family:', fontFamily);

      // Font size ayarla
      const fontSize = settings?.branding?.fontSize || 'medium';
      let fontSizeValue = '16px'; // medium
      switch (fontSize) {
        case 'small':
          fontSizeValue = '14px';
          break;
        case 'large':
          fontSizeValue = '18px';
          break;
        default:
          fontSizeValue = '16px';
      }
      document.documentElement.style.setProperty('--font-size-base', fontSizeValue);
      console.log('Set font size:', fontSizeValue);

      // CSS değişkenlerini kontrol et
      const computedStyle = getComputedStyle(document.documentElement);
      console.log('CSS Variables:', {
        '--brand-primary': computedStyle.getPropertyValue('--brand-primary'),
        '--brand-secondary': computedStyle.getPropertyValue('--brand-secondary'),
        '--brand-surface': computedStyle.getPropertyValue('--brand-surface'),
        '--brand-subtle': computedStyle.getPropertyValue('--brand-subtle'),
        '--brand-strong': computedStyle.getPropertyValue('--brand-strong'),
        '--brand-gradient': computedStyle.getPropertyValue('--brand-gradient'),
        '--font-family': computedStyle.getPropertyValue('--font-family'),
        '--font-size-base': computedStyle.getPropertyValue('--font-size-base')
      });
    }
  }, [
    settings?.branding?.primaryColor,
    settings?.branding?.fontFamily,
    settings?.branding?.fontSize
  ]);

  return null;
}



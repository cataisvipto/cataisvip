'use client';

import { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';

interface NewsletterProps {
  locale?: string;
}

export default function Newsletter({ locale = 'en' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const t = {
    title: locale === 'zh' ? '订阅 AI 资讯' : locale === 'ja' ? 'AIニュースを購読' : locale === 'es' ? 'Suscríbete a noticias de IA' : locale === 'fr' ? "S'abonner aux actualités IA" : 'Subscribe to AI Updates',
    description: locale === 'zh' ? '获取最新 AI 工具推荐、行业动态和深度分析，每周精选直达邮箱。' : locale === 'ja' ? '最新のAIツール推薦、業界動向、深層分析をお届けします。' : locale === 'es' ? 'Recibe las últimas recomendaciones de herramientas IA y análisis.' : locale === 'fr' ? 'Recevez les dernières recommandations d\'outils IA et analyses.' : 'Get the latest AI tool recommendations, industry insights, and analysis delivered to your inbox.',
    placeholder: locale === 'zh' ? '输入你的邮箱' : locale === 'ja' ? 'メールアドレスを入力' : locale === 'es' ? 'Tu correo electrónico' : locale === 'fr' ? 'Votre email' : 'Your email address',
    button: locale === 'zh' ? '订阅' : locale === 'ja' ? '購読' : locale === 'es' ? 'Suscribirse' : locale === 'fr' ? "S'abonner" : 'Subscribe',
    success: locale === 'zh' ? '订阅成功！感谢你的关注。' : locale === 'ja' ? '購読ありがとうございます！' : locale === 'es' ? '¡Suscripción exitosa!' : locale === 'fr' ? 'Abonnement réussi !' : 'Successfully subscribed! Thank you.',
    error: locale === 'zh' ? '订阅失败，请稍后重试。' : locale === 'ja' ? '購読に失敗しました。' : locale === 'es' ? 'Error en la suscripción.' : locale === 'fr' ? "Échec de l'abonnement." : 'Subscription failed. Please try again.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrorMessage(locale === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email');
      return;
    }

    setStatus('loading');
    
    try {
      // Web3Forms API - free form backend
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '9ec58a55-eb5e-440e-b5d7-887b53f460ee',
          email: email,
          from_name: 'CATAI Newsletter',
          subject: 'New Newsletter Subscription - CATAI',
          message: `New subscription from: ${email}`,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(t.error);
      }
    } catch {
      setStatus('error');
      setErrorMessage(t.error);
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{t.success}</h3>
        <p className="text-[var(--muted)] text-sm">{t.description}</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{t.title}</h3>
        <p className="text-[var(--muted)] mb-6">{t.description}</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder={t.placeholder}
            className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t.button
            )}
          </button>
        </form>
        
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">{errorMessage}</p>
        )}
        
        <p className="mt-4 text-xs text-[var(--muted)]">
          {locale === 'zh' ? '我们尊重你的隐私，随时可以取消订阅。' : 'We respect your privacy. Unsubscribe at any time.'}
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { Tool, getLocalizedDescription } from '@/components/ToolCard';
import LogoTile from '@/components/LogoTile';
import { ExternalLink, Star } from 'lucide-react';

interface CategoryClientProps {
  category: string;
  slug: string;
  tools: Tool[];
  locale: string;
}

const TAG_COLORS: Record<string, string> = {
  Free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Freemium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Open Source': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  API: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// Category descriptions for SEO and UX
const CATEGORY_DESCRIPTIONS: Record<string, Record<string, string>> = {
  Chat: {
    en: 'AI chatbots and conversational assistants for text generation, Q&A, and creative tasks',
    zh: 'AI 对话助手和聊天机器人，支持文本生成、问答和创意任务',
    ja: 'テキスト生成、Q&A、クリエイティブタスクに対応するAIチャットボットと会話アシスタント',
    es: 'Chatbots de IA y asistentes conversacionales para generación de texto, preguntas y tareas creativas',
    fr: 'Chatbots IA et assistants conversationnels pour la génération de texte, les questions et les tâches créatives',
  },
  Image: {
    en: 'AI image generation tools for creating art, illustrations, and visual content from text',
    zh: 'AI 图像生成工具，从文本创建艺术、插图和视觉内容',
    ja: 'テキストからアート、イラスト、ビジュアルコンテンツを生成するAI画像生成ツール',
    es: 'Herramientas de generación de imágenes IA para crear arte, ilustraciones y contenido visual desde texto',
    fr: 'Outils de génération d\'images IA pour créer de l\'art, des illustrations et du contenu visuel à partir de texte',
  },
  Code: {
    en: 'AI coding assistants and code editors that help developers write, debug, and deploy code faster',
    zh: 'AI 编程助手和代码编辑器，帮助开发者更快地编写、调试和部署代码',
    ja: '開発者がより速くコードを書き、デバッグし、デプロイできるようにするAIコーディングアシスタント',
    es: 'Asistentes de programación IA y editores de código que ayudan a los desarrolladores a escribir, depurar y desplegar código más rápido',
    fr: 'Assistants de programmation IA et éditeurs de code qui aident les développeurs à écrire, déboguer et déployer du code plus rapidement',
  },
  Writing: {
    en: 'AI writing tools for content creation, copywriting, translation, and text enhancement',
    zh: 'AI 写作工具，用于内容创作、文案撰写、翻译和文本增强',
    ja: 'コンテンツ作成、コピーライティング、翻訳、テキスト強化のためのAIライティングツール',
    es: 'Herramientas de escritura IA para creación de contenido, copywriting, traducción y mejora de texto',
    fr: 'Outils d\'écriture IA pour la création de contenu, le copywriting, la traduction et l\'amélioration de texte',
  },
  Video: {
    en: 'AI video generation and editing tools for creating professional videos from text or images',
    zh: 'AI 视频生成和编辑工具，从文本或图像创建专业视频',
    ja: 'テキストや画像からプロフェッショナルな動画を作成するAI動画生成・編集ツール',
    es: 'Herramientas de generación y edición de video IA para crear videos profesionales desde texto o imágenes',
    fr: 'Outils de génération et d\'édition vidéo IA pour créer des vidéos professionnelles à partir de texte ou d\'images',
  },
  Audio: {
    en: 'AI audio tools for voice synthesis, music generation, and speech recognition',
    zh: 'AI 音频工具，用于语音合成、音乐生成和语音识别',
    ja: '音声合成、音楽生成、音声認識のためのAIオーディオツール',
    es: 'Herramientas de audio IA para síntesis de voz, generación de música y reconocimiento de voz',
    fr: 'Outils audio IA pour la synthèse vocale, la génération musicale et la reconnaissance vocale',
  },
  Search: {
    en: 'AI-powered search engines that provide intelligent, real-time answers with cited sources',
    zh: 'AI 驱动的搜索引擎，提供带引用来源的智能实时答案',
    ja: '引用元付きのインテリジェントなリアルタイム回答を提供するAI検索エンジン',
    es: 'Motores de búsqueda impulsados por IA que proporcionan respuestas inteligentes en tiempo real con fuentes citadas',
    fr: 'Moteurs de recherche alimentés par l\'IA fournissant des réponses intelligentes en temps réel avec sources citées',
  },
  Platform: {
    en: 'AI platforms and model hubs for hosting, training, and deploying machine learning models',
    zh: 'AI 平台和模型中心，用于托管、训练和部署机器学习模型',
    ja: '機械学習モデルのホスティング、トレーニング、デプロイメントのためのAIプラットフォーム',
    es: 'Plataformas de IA y centros de modelos para alojar, entrenar y desplegar modelos de aprendizaje automático',
    fr: 'Plateformes IA et hubs de modèles pour l\'hébergement, l\'entraînement et le déploiement de modèles de machine learning',
  },
  Developer: {
    en: 'AI developer tools and frameworks for building LLM-powered applications and agents',
    zh: 'AI 开发者工具和框架，用于构建基于大语言模型的应用和智能体',
    ja: 'LLM搭載のアプリケーションやエージェントを構築するためのAI開発者ツールとフレームワーク',
    es: 'Herramientas y frameworks de desarrollo IA para construir aplicaciones y agentes impulsados por LLM',
    fr: 'Outils et frameworks de développement IA pour construire des applications et des agents alimentés par LLM',
  },
  Agent: {
    en: 'AI agent frameworks for building autonomous systems that can complete complex tasks',
    zh: 'AI 智能体框架，用于构建能完成复杂任务的自主系统',
    ja: '複雑なタスクを完了できる自律システムを構築するためのAIエージェントフレームワーク',
    es: 'Frameworks de agentes IA para construir sistemas autónomos que pueden completar tareas complejas',
    fr: 'Frameworks d\'agents IA pour construire des systèmes autonomes capables de compléter des tâches complexes',
  },
  Design: {
    en: 'AI design tools for creating graphics, presentations, and visual content with ease',
    zh: 'AI 设计工具，轻松创建图形、演示文稿和视觉内容',
    ja: 'グラフィック、プレゼンテーション、ビジュアルコンテンツを簡単に作成するAIデザインツール',
    es: 'Herramientas de diseño IA para crear gráficos, presentaciones y contenido visual con facilidad',
    fr: 'Outils de design IA pour créer facilement des graphiques, des présentations et du contenu visuel',
  },
};

export default function CategoryClient({ category, slug, tools: categoryTools, locale }: CategoryClientProps) {
  const tCategories = useTranslations('categories');
  const tTags = useTranslations('tags');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryDescription =
    CATEGORY_DESCRIPTIONS[category]?.[locale] ||
    CATEGORY_DESCRIPTIONS[category]?.en ||
    '';

  const categorySlug = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} locale={locale} />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { name: tCategories(categorySlug) }
          ]}
          locale={locale}
        />

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-3">
            {locale === 'zh'
              ? `最佳 ${tCategories(categorySlug)} AI 工具`
              : `Best ${tCategories(categorySlug)} AI Tools`}
          </h1>
          <p className="text-lg text-[var(--muted)] mb-4">{categoryDescription}</p>
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span>{categoryTools.length} {locale === 'zh' ? '款工具' : 'tools'}</span>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['Chat', 'Image', 'Code', 'Writing', 'Video', 'Audio', 'Search', 'Platform', 'Developer', 'Agent', 'Design'].map((catName) => {
            const catSlug = catName.toLowerCase();
            return (
              <Link
                key={catSlug}
                href={`/category/${catSlug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  catSlug === slug
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[var(--muted-bg)] text-[var(--muted)] hover:bg-[var(--card-border)]'
                }`}
              >
                {tCategories(catName)}
              </Link>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryTools.map((tool) => {
            const displayName = locale === 'zh' && tool.nameZh ? tool.nameZh : tool.name;
            const description = getLocalizedDescription(tool, locale);

            return (
              <Link
                key={tool.slug}
                href={`/tool/${tool.slug}`}
                className="group bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-5 hover:border-[var(--primary)] hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <LogoTile
                    logo={tool.logo}
                    alt={displayName}
                    className="w-12 h-12 rounded-xl"
                    imgPx={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition">
                        {displayName}
                      </h3>
                      {tool.featured && (
                        <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">{description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                        >
                          {locale === 'zh' ? tTags(tag) : tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Tools */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--muted-bg)] text-[var(--foreground)] rounded-full hover:bg-[var(--card-border)] transition font-medium"
          >
            {locale === 'zh' ? '查看所有工具' : 'View All Tools'}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

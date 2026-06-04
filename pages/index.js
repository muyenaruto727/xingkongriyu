import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// 动态导入组件，实现懒加载
const Navigation = dynamic(() => import('../components/layout/Navigation'), {
  ssr: true
});

const Footer = dynamic(() => import('../components/layout/Footer'), {
  ssr: true
});

const DailyQuote = dynamic(() => import('../components/DailyQuote'), {
  ssr: true
});

const Home = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/');
  };

  const features = [
    {
      href: '/learning-center',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      hoverColor: 'group-hover:text-blue-600',
      borderHover: 'group-hover:border-blue-200',
      shadowHover: 'group-hover:shadow-blue-100/50',
      title: '学习中心',
      desc: '系统化的词汇库与语法精讲，搭配精选课程，帮你从零开始构建扎实的日语基础。',
      linkText: '开始学习',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      stats: [
        { label: '词汇库', value: 'N5-N1' },
        { label: '语法点', value: '500+' },
      ]
    },
    {
      href: '/practice-center',
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      hoverColor: 'group-hover:text-emerald-600',
      borderHover: 'group-hover:border-emerald-200',
      shadowHover: 'group-hover:shadow-emerald-100/50',
      title: '练习中心',
      desc: '词汇·语法·听力·阅读全方位训练 + 真题模考，精准检验学习成果，高效提分。',
      linkText: '开始练习',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      stats: [
        { label: '题目', value: '2000+' },
        { label: '真题卷', value: '20+' },
      ]
    },
    {
      href: '/tools',
      gradient: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
      textColor: 'text-violet-600',
      hoverColor: 'group-hover:text-violet-600',
      borderHover: 'group-hover:border-violet-200',
      shadowHover: 'group-hover:shadow-violet-100/50',
      title: '小工具',
      desc: '打字游戏 + 单词消消乐，让记单词变成好玩的日常，轻松提升词汇量。',
      linkText: '开始探索',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      stats: [
        { label: '游戏', value: '3种' },
        { label: '趣味', value: '∞' },
      ]
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      <Head>
        <title>星空日语 — 你的日语学习伙伴</title>
        <meta name="description" content="星空日语，提供词汇、语法、听力等学习资源" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        {/* ───── Hero Section ───── */}
        <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
            {/* Top-right glow */}
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-200/40 to-cyan-200/20 blur-3xl" />
            {/* Bottom-left glow */}
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-purple-200/30 to-pink-200/20 blur-3xl" />
            {/* Decorative grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
            {/* Floating circles */}
            <svg className="absolute top-20 right-[10%] w-3 h-3 text-blue-300/60" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="3" /></svg>
            <svg className="absolute top-40 left-[8%] w-2 h-2 text-purple-300/50" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="2" /></svg>
            <svg className="absolute bottom-32 right-[15%] w-2.5 h-2.5 text-cyan-300/50" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="2.5" /></svg>
          </div>

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200/60 shadow-sm mb-8 animate-[fadeIn_0.6s_ease-out]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-600">每日更新 · 持续进步</span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                在<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">星空</span>下
                <br />
                开启你的
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">日语之旅</span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-yellow-200/60 -skew-x-2 rounded-sm -z-0" />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-[fadeIn_0.6s_ease-out_0.2s_both]">
                从零基础到流利对话，用系统化的学习路径和丰富的互动练习，
                <br className="hidden sm:block" />
                让每一份努力都看得见进步。
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeIn_0.6s_ease-out_0.4s_both]">
                <a
                  href="/learning-center"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  免费开始学习
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="/practice-center"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  查看学习路径
                </a>
              </div>

              {/* Scroll hint */}
              <div className="mt-16 animate-[fadeIn_0.6s_ease-out_0.8s_both]">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-xs font-medium tracking-widest uppercase">向下探索</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom wave divider */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]">
              <path d="M0 60C240 0 480 120 720 60C960 0 1200 120 1440 60V120H0V60Z" fill="#F8FAFC" />
            </svg>
          </div>
        </section>

        {/* ───── Features Section ───── */}
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="container">
            {/* Section header */}
            <div className="text-center mb-14 md:mb-20">
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full mb-4">
                核心功能
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                一站式学习平台
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                从学习到练习，从工具到考试，覆盖日语学习的每一个环节
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <a
                  key={index}
                  href={feature.href}
                  className={`group relative bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-500
                    hover:shadow-xl ${feature.shadowHover} hover:-translate-y-1.5 ${feature.borderHover}`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  {/* Card top accent line */}
                  <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${feature.gradient.split(' ')[1]}/25 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold text-gray-900 mb-3 ${feature.hoverColor} transition-colors duration-300`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 leading-relaxed mb-6">
                    {feature.desc}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-6 mb-6 pb-6 border-b border-gray-100">
                    {feature.stats.map((stat, i) => (
                      <div key={i}>
                        <div className={`text-lg font-bold ${feature.textColor}`}>{stat.value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Link */}
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${feature.textColor} group-hover:gap-3 transition-all duration-300`}>
                    {feature.linkText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ───── Why Learn Japanese Section ───── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              {/* Section header */}
              <div className="text-center mb-14 md:mb-20">
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-600 bg-purple-50 px-4 py-2 rounded-full mb-4">
                  为什么选择我们
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  让学习更高效、更愉快
                </h2>
                <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                  不仅仅是工具，更是你日语学习路上的贴心伙伴
                </p>
              </div>

              {/* Benefits grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    color: 'blue',
                    title: '系统化学习路径',
                    desc: '从 N5 到 N1，每一步都有清晰的目标和丰富的学习材料，循序渐进不迷茫。',
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    color: 'amber',
                    title: '即时练习反馈',
                    desc: '每学完一个知识点立即练习，自动批改 + 详细解析，让错误变成最好的老师。',
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: 'emerald',
                    title: '碎片时间利用',
                    desc: '随时随地打开就能学，通勤路上、午休间隙，把零散时间变成日语进步的积累。',
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    color: 'rose',
                    title: '游戏化学习体验',
                    desc: '打字游戏、消消乐等互动工具，让背单词不再枯燥，在玩中自然掌握日语。',
                  },
                ].map((benefit, i) => {
                  const colorMap = {
                    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
                    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
                    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
                    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
                  };
                  const c = colorMap[benefit.color];
                  return (
                    <div key={i} className="flex gap-5 group">
                      <div className={`flex-shrink-0 w-12 h-12 ${c.bg} ${c.text} rounded-xl flex items-center justify-center ring-1 ${c.ring} group-hover:scale-110 transition-transform duration-300`}>
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                        <p className="text-gray-500 leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ───── Daily Quote Section ───── */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full mb-4">
                  每日一语
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  今天的一句，明天的力量
                </h2>
              </div>
              <DailyQuote />
            </div>
          </div>
        </section>

        {/* ───── CTA Section ───── */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.2),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.15),transparent_50%)]" />
              {/* Decorative dots */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Content */}
              <div className="relative z-10 text-center px-8 py-16 md:py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                  准备好开始了吗？
                </h2>
                <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                  加入星空日语，和成千上万的日语学习者一起，每天进步一点点。
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 hover:shadow-xl hover:shadow-white/10 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    立即注册
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <a
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-white font-semibold rounded-2xl border border-gray-600 hover:border-gray-400 hover:bg-white/5 transition-all duration-300"
                  >
                    已有账号？登录
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Custom keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;


import Head from 'next/head';
import dynamic from 'next/dynamic';

// 动态导入组件，实现懒加载
const Navigation = dynamic(() => import('../components/layout/Navigation'), {
  ssr: true
});

const Footer = dynamic(() => import('../components/layout/Footer'), {
  ssr: true
});

const OneOnOne = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>1V1辅导 - 星空日语</title>
        <meta name="description" content="专业老师一对一辅导，量身定制学习计划，快速提升日语水平" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">1V1辅导</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                专业老师一对一辅导，量身定制学习计划，快速提升日语水平
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">1V1辅导</h4>
              <p className="text-gray-600 mb-6 leading-relaxed">专业老师一对一辅导，量身定制学习计划，快速提升日语水平。</p>
              <p className="text-gray-500 mb-6">暂显示空页面，后面补充文案</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default OneOnOne;
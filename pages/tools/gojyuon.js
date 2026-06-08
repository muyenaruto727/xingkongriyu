import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import GojyuonGame from '../../components/tools/GojyuonGame';

const GojyuonTool = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>五十音消消乐 — 星空日语</title>
        <meta name="description" content="五十音消消乐，通过匹配平假名和片假名练习假名识别" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container max-w-4xl">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
              <GojyuonGame />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GojyuonTool;

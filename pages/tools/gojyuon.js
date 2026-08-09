import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import GojyuonGame from '../../components/tools/GojyuonGame';

const GojyuonTool = () => {
  const router = useRouter();

  return (
    <div className="tool-page-shell">
      <Head>
        <title>五十音消消乐 — 星空日语</title>
        <meta name="description" content="五十音消消乐，通过匹配平假名和片假名练习假名识别" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="tool-main">
          <div className="container max-w-4xl">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push('/tools')}
                className="tool-back"
              >
                <span aria-hidden="true">←</span>
                返回小工具
              </button>
            </div>

            <div className="tool-panel">
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

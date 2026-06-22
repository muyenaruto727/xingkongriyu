import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { message } from 'antd';
import api from '../lib/api';

const Navigation = dynamic(() => import('../components/layout/Navigation'), {
  ssr: true,
});

const Footer = dynamic(() => import('../components/layout/Footer'), {
  ssr: true,
});

const CONTACT_OPTIONS = [
  { value: 'phone', label: '手机号', placeholder: '例如：138 0013 8000' },
  { value: 'email', label: '邮箱', placeholder: '例如：you@example.com' },
  { value: 'wechat', label: '微信号', placeholder: '例如：konoha_jp' },
];

const highlights = [
  {
    title: '日语专业背景',
    desc: '长沙大学日语专业毕业，能把发音、语法、表达拆成零基础也能听懂的步骤。',
  },
  {
    title: '真实日企经历',
    desc: '曾在松下、夏普、日本显示器等知名日企工作，知道职场日语不是背句子那么简单。',
  },
  {
    title: '懂技术行业语境',
    desc: '自学编程并在软件行业工作 8 年，对电子半导体、IT 行业有实践积累。',
  },
];

const audiences = [
  '刚开始学五十音，担心自己发音和节奏走偏',
  '想备考 JLPT，但不知道每天该学什么、练什么',
  '准备进入日企、电子半导体或 IT 相关岗位',
  '学过一段时间，却开口困难、语法总是用不出来',
];

const courseSteps = [
  {
    step: '01',
    title: '先诊断',
    desc: '了解你的基础、目标、可学习时间和目前卡点，不用一上来就套固定课程。',
  },
  {
    step: '02',
    title: '定路径',
    desc: '按考试、兴趣、职场或零基础入门来规划内容，每节课都有明确任务。',
  },
  {
    step: '03',
    title: '课后跟进',
    desc: '把课堂内容变成可复习、可练习、可检查的清单，减少学完就忘。',
  },
];

const OneOnOne = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactType: 'phone',
    contactValue: '',
    goal: '',
    preferredTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedContact = CONTACT_OPTIONS.find((item) => item.value === formData.contactType) || CONTACT_OPTIONS[0];

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      message.error('请填写称呼');
      return;
    }

    if (!formData.contactValue.trim()) {
      message.error('请至少留下一种联系方式');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createOneOnOneBooking(formData);
      message.success('预约信息已提交，老师会尽快联系你');
      setFormData({
        name: '',
        contactType: 'phone',
        contactValue: '',
        goal: '',
        preferredTime: '',
      });
    } catch (error) {
      message.error(error.userMessage || error.message || '提交失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Head>
        <title>1V1辅导 - 木叶老师 | 星空日语</title>
        <meta
          name="description"
          content="木叶老师 1V1 日语辅导，适合零基础、JLPT 备考、日企和 IT/半导体行业日语学习。"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Navigation />

      <main className="flex-grow">
        <section className="relative pt-24 md:pt-32 pb-14 overflow-hidden bg-[radial-gradient(circle_at_top_left,#eff6ff,transparent_34%),linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#ecfeff_100%)]">
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-blue-100 text-blue-700 text-sm font-semibold shadow-sm mb-6">
                  木叶老师 1V1 日语辅导
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-950 leading-tight tracking-tight mb-6">
                  不只是学日语，
                  <span className="block text-blue-600">而是有人带你走对路。</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mb-8">
                  从五十音、JLPT 到日企和技术行业沟通，木叶老师会根据你的目标拆解学习路径，
                  让每一节课都能解决一个真实问题。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <a
                    href="#booking-form"
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
                  >
                    预约一次学习诊断
                  </a>
                  <a
                    href="#teacher"
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white text-gray-700 font-semibold border border-gray-200 hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    先了解老师背景
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-xl">
                  {['零基础友好', '日企经验', 'IT/半导体语境'].map((item) => (
                    <div key={item} className="bg-white/80 border border-gray-100 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 text-center shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-6 bg-blue-200/40 blur-3xl rounded-full" />
                <div className="relative bg-white border border-blue-100 rounded-2xl p-5 md:p-8 shadow-xl shadow-blue-100/60">
                  <img
                    src="/images/konoha-teacher.jpg"
                    alt="木叶老师卡通形象"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="teacher" className="py-16 md:py-20 bg-slate-50">
          <div className="container">
            <div className="max-w-3xl mb-10">
              <span className="text-sm font-bold tracking-[0.2em] text-blue-600 uppercase">Why Konoha</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-950 mt-3 mb-4">老师的优势，来自课堂外的真实经验</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                日语学习最怕“看起来会了，真正使用时却卡住”。木叶老师的课程会把语言知识、
                日本企业文化和行业表达放在一起讲，让你学到能拿去用的日语。
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {highlights.map((item) => (
                <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-950 mb-6">适合这些正在卡住的人</h2>
                <div className="space-y-4">
                  {audiences.map((item) => (
                    <div key={item} className="flex gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-100">
                      <span className="mt-0.5 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">✓</span>
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-950 text-white rounded-2xl p-7 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">1V1 会怎么上？</h2>
                <div className="space-y-6">
                  {courseSteps.map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="text-blue-300 font-extrabold text-xl">{item.step}</div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="booking-form" className="py-16 md:py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">
              <div className="lg:sticky lg:top-24">
                <span className="text-sm font-bold tracking-[0.2em] text-blue-600 uppercase">Book A Trial</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-950 mt-3 mb-4">留下联系方式，先做一次学习诊断</h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  不确定自己适合从哪里开始也没关系。提交后，老师会根据你的目标和基础，先帮你判断学习入口。
                </p>
                <div className="rounded-xl bg-white border border-blue-100 p-5 text-gray-700 leading-relaxed shadow-sm">
                  建议填写你最常用的一种联系方式即可：手机号、邮箱、微信号三选一。
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-blue-100/50 p-6 md:p-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="booking-name">
                    称呼
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    value={formData.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="input"
                    placeholder="例如：小林"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid md:grid-cols-[180px_1fr] gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contact-type">
                      联系方式
                    </label>
                    <select
                      id="contact-type"
                      value={formData.contactType}
                      onChange={(event) => updateField('contactType', event.target.value)}
                      className="input"
                      disabled={isSubmitting}
                    >
                      {CONTACT_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contact-value">
                      {selectedContact.label}
                    </label>
                    <input
                      id="contact-value"
                      type={formData.contactType === 'email' ? 'email' : 'text'}
                      value={formData.contactValue}
                      onChange={(event) => updateField('contactValue', event.target.value)}
                      className="input"
                      placeholder={selectedContact.placeholder}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="booking-goal">
                    你的目标或目前卡点
                  </label>
                  <textarea
                    id="booking-goal"
                    value={formData.goal}
                    onChange={(event) => updateField('goal', event.target.value)}
                    className="input min-h-[116px] resize-none"
                    placeholder="例如：零基础想学到能简单对话；准备 N3；想提升日企面试表达。"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="preferred-time">
                    方便联系的时间
                  </label>
                  <input
                    id="preferred-time"
                    type="text"
                    value={formData.preferredTime}
                    onChange={(event) => updateField('preferredTime', event.target.value)}
                    className="input"
                    placeholder="例如：工作日晚上 8 点后"
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '提交中...' : '提交预约信息'}
                </button>
                <p className="text-sm text-gray-500 text-center">
                  提交不会自动扣费，只用于老师联系你确认学习目标。
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OneOnOne;

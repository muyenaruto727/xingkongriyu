const Footer = () => {
  const footerLinks = {
    learn: {
      title: '学习',
      links: [
        { label: '学习中心', href: '/learning-center' },
        { label: '练习中心', href: '/practice-center' },
        { label: '真题考试', href: '/exam' },
      ],
    },
    tools: {
      title: '工具',
      links: [
        { label: '小工具', href: '/tools' },
        { label: '1V1辅导', href: '/one-on-one' },
      ],
    },
    account: {
      title: '账号',
      links: [
        { label: '登录', href: '/login' },
        { label: '注册', href: '/register' },
        { label: '个人中心', href: '/profile' },
      ],
    },
  };

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container py-12 md:py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">星空日语</h3>
            <p className="text-sm leading-relaxed mb-4">
              在星空下，开启你的日语学习之旅。<br />
              让每一份努力都看得见进步。
            </p>
            {/* Social icons placeholder */}
            <div className="flex items-center gap-3">
              {['微信', '微博', 'B站'].map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-xs hover:bg-gray-700 hover:text-white transition-colors cursor-default"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.values(footerLinks).map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 星空日语 — 版权所有</p>
            <p className="text-xs text-gray-500">
              每一天都是学习日语的好日子 ✨
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

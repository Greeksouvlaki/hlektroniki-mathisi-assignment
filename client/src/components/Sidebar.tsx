import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Learning Modules',
      href: '/modules',
      icon: '📚',
      current: location.pathname === '/modules'
    },
    {
      name: 'Quizzes',
      href: '/quizzes',
      icon: '❓',
      current: location.pathname === '/quizzes'
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: '📈',
      current: location.pathname === '/progress'
    },
    {
      name: 'Recommendations',
      href: '/recommendations',
      icon: '🎯',
      current: location.pathname === '/recommendations'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 
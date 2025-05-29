import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', current: false },
    { name: 'Dashboard', href: '/dashboard', current: false, protected: true },
    { name: 'Interview Practice', href: '/interview', current: false, protected: true },
    { name: 'Resume Analysis', href: '/resume', current: false, protected: true },
  ];

  return (
    <Disclosure as="nav" className="bg-primary-600">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="flex items-center">
                    <span className="text-white text-xl font-bold">InterviewAI</span>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => {
                      if (item.protected && !user) return null;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {user ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-primary-700 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-8 w-8 text-white" aria-hidden="true" />
                        </Menu.Button>
                      </div>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`block px-4 py-2 text-sm text-gray-700 ${
                                  active ? 'bg-gray-100' : ''
                                }`}
                              >
                                Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={`block w-full text-left px-4 py-2 text-sm text-gray-700 ${
                                  active ? 'bg-gray-100' : ''
                                }`}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex space-x-4">
                      <Link
                        to="/login"
                        className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="bg-white text-primary-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-primary-700 p-2 text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => {
                if (item.protected && !user) return null;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white hover:bg-primary-700 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-primary-700 pb-3 pt-4">
              {user ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-300">
                      {user.email}
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="mt-3 space-y-1 px-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-700"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-700 w-full text-left"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header; 
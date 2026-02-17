import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  UserPlusIcon,
  LightBulbIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/fa/mattedwards', icon: HomeIcon },
  { name: 'Daily Action Plan', href: '/fa/mattedwards/daily', icon: CalendarIcon },
  { name: 'Accounts', href: '/fa/mattedwards/accounts', icon: BuildingOfficeIcon },
  { name: 'LinkedIn Network', href: '/fa/mattedwards/network', icon: UsersIcon },
  { name: 'Intro Suggestions', href: '/fa/mattedwards/intros', icon: UserPlusIcon },
  { name: 'Relationships', href: '/fa/mattedwards/relationships', icon: UsersIcon },
  { name: 'Cadence Matrix', href: '/fa/mattedwards/cadence', icon: ArrowPathIcon },
  { name: 'ATS Intelligence', href: '/fa/mattedwards/ats', icon: BuildingOfficeIcon },
  { name: 'Intelligence', href: '/fa/mattedwards/intelligence', icon: LightBulbIcon },
  { name: 'Salesforce', href: '/fa/mattedwards/salesforce', icon: CloudArrowUpIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
      {/* Mobile sidebar */}
      <div className={classNames(
        'relative z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button 
                type="button" 
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl overflow-hidden sherps-glow">
                    <img 
                      src="/images/sherps-icon.svg" 
                      alt="Sherps - Your Sales Guide"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      TheSalesSherpa
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Guided by Sherps ⛰️</p>
                  </div>
                </div>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className={classNames(
                              'nav-item',
                              location.pathname === item.href
                                ? 'nav-item-active'
                                : 'nav-item-inactive'
                            )}
                          >
                            <item.icon
                              className={classNames(
                                location.pathname === item.href 
                                  ? 'text-orange-600' 
                                  : 'text-slate-400 group-hover:text-orange-600',
                                'h-6 w-6 shrink-0 transition-colors duration-200'
                              )}
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-gradient-to-b from-white to-orange-50/30 px-6">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl overflow-hidden sherps-glow">
                <img 
                  src="/images/sherps-logo.svg" 
                  alt="Sherps - Your Professional Sales Guide"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                  TheSalesSherpa
                </h1>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                  <span>Guided by Sherps</span>
                  <span className="text-orange-400">⛰️</span>
                </p>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          'nav-item',
                          location.pathname === item.href
                            ? 'nav-item-active'
                            : 'nav-item-inactive'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            location.pathname === item.href 
                              ? 'text-orange-600' 
                              : 'text-slate-400 group-hover:text-orange-600',
                            'h-6 w-6 shrink-0 transition-colors duration-200'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
          
          {/* Sherps Status Indicator */}
          <div className="border-t border-slate-200 pt-6 pb-4">
            <div className="flex items-center space-x-3 text-sm mb-3">
              <div className="relative">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 h-3 w-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-slate-700 font-medium">Salesforce Connected</span>
              <div className="sherps-badge">Live</div>
            </div>
            <div className="text-xs text-slate-500 pl-6">
              Last sync: 2 hours ago
            </div>
            <div className="mt-3 flex items-center space-x-2 pl-6">
              <div className="h-4 w-4">
                <img src="/images/sherps-icon.svg" alt="Sherps" className="h-full w-full opacity-60" />
              </div>
              <span className="text-xs text-orange-600 font-medium">Sherps is monitoring your pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Premium Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 shadow-sherps sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Sherps Notifications */}
              <button className="relative -m-2.5 p-2.5 text-slate-400 hover:text-orange-500 transition-colors duration-200">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></span>
                  <span className="absolute h-3 w-3 bg-orange-400 rounded-full animate-ping opacity-75"></span>
                </span>
              </button>
              
              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-orange-100">
                  <div className="h-full w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ME</span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-semibold text-slate-900">Matt Edwards</div>
                  <div className="text-xs text-slate-500 font-medium">First Advantage • Enterprise Sales</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
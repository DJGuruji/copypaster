'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserIcon, ArrowRightOnRectangleIcon, KeyIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidePanelOpen(event.detail.isOpen);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const handleSidebarToggle = () => {
    const newState = true;
    setIsSidePanelOpen(newState);
    
    window.dispatchEvent(new CustomEvent('openSidebar', { 
      detail: { isOpen: newState } 
    }));
  };

  const isMainPage = pathname === '/';

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="bg-[#09090b] border-b border-[#27272a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {isMainPage && isMobile && !isSidePanelOpen && (
                <button
                  onClick={handleSidebarToggle}
                  className="p-2 rounded-md bg-[#27272a] text-[#fafafa] hover:bg-[#27272a]/80 transition-colors"
                  aria-label="Open sidebar"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
              )}
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold tracking-tighter">
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                   CopyCat
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="ml-4 flex items-center">
              {status === 'authenticated' ? (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 bg-transparent py-2 px-3 rounded-md hover:bg-[#27272a] transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-[#fafafa]" />
                    <span className="text-sm font-medium text-[#fafafa]">{session.user.name}</span>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#09090b] rounded-xl shadow-2xl py-2 z-50 border border-[#27272a]">
                      <div className="px-4 py-2 text-xs text-[#a1a1aa] border-b border-[#27272a] mb-1">
                        Signed in as <span className="text-[#fafafa] font-medium">{session.user.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsPasswordModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-[#fafafa] hover:bg-[#27272a] transition-colors"
                      >
                        <KeyIcon className="h-4 w-4 mr-2 text-[#a1a1aa]" />
                        Change Password
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-[#27272a] transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-[#a1a1aa] hover:text-[#fafafa] px-3 py-2 rounded-md transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[#09090b] text-sm font-bold px-4 py-2 rounded-md hover:opacity-90 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Dialog
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

          <div className="relative bg-[#09090b] rounded-xl w-full max-w-md mx-4 p-8 shadow-2xl border border-[#27272a]">
            <div className="space-y-2 text-center mb-6">
              <h3 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
                Change Password
              </h3>
              <p className="text-sm text-[#a1a1aa]">Ensure your account is using a secure password</p>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-[#fafafa]">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-[#fafafa]">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-[#fafafa]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-[#27272a] bg-transparent px-3 py-2 text-sm placeholder:text-[#52525b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#27272a] bg-transparent hover:bg-[#27272a] h-10 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#fafafa] text-[#09090b] hover:bg-[#fafafa]/90 h-10 px-4 py-2"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  );
}
 
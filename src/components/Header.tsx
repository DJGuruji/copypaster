'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserIcon, ArrowRightOnRectangleIcon, KeyIcon, Bars3Icon, TrashIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

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
                    onClick={() => setIsProfileSidebarOpen(true)}
                    className="flex items-center space-x-2 bg-transparent py-2 px-3 rounded-md hover:bg-[#27272a] transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-[#fafafa]" />
                    <span className="text-sm font-medium text-[#fafafa]">{session.user.name}</span>
                  </button>
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

      {/* Profile Sidebar */}
      <Dialog
        open={isProfileSidebarOpen}
        onClose={() => setIsProfileSidebarOpen(false)}
        className="fixed z-50 inset-0"
      >
        <div className="flex justify-end min-h-screen">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="relative bg-[#09090b] w-full max-w-xs h-full p-6 shadow-2xl border-l border-[#27272a] animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tighter text-[#fafafa]">Profile</h2>
              <button 
                onClick={() => setIsProfileSidebarOpen(false)}
                className="p-2 -mr-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 rotate-180" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-[#18181b] rounded-xl border border-[#27272a]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-[#09090b] font-bold">
                  {session?.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#fafafa] truncate">{session?.user?.name}</p>
                  <p className="text-xs text-[#a1a1aa] truncate">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsPasswordModalOpen(true);
                    setIsProfileSidebarOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-3 text-sm font-medium text-[#fafafa] hover:bg-[#18181b] rounded-xl transition-all group"
                >
                  <KeyIcon className="h-5 w-5 mr-3 text-[#a1a1aa] group-hover:text-yellow-400" />
                  Change Password
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-3 text-sm font-medium text-[#fafafa] hover:bg-[#18181b] rounded-xl transition-all group"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-[#a1a1aa] group-hover:text-[#fafafa]" />
                  Sign Out
                </button>
                <a
                  href="https://krishnanaths.deno.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center px-4 py-3 text-sm font-medium text-[#fafafa] hover:bg-[#18181b] rounded-xl transition-all group mt-2"
                >
                  <CodeBracketIcon className="h-5 w-5 mr-3 text-[#a1a1aa] group-hover:text-yellow-400" />
                  Developer
                </a>
              </div>

              <div className="pt-6 border-t border-[#27272a]">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                    setIsProfileSidebarOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
                >
                  <TrashIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Delete Account
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-widest text-[#52525b] text-center font-bold">
                CopyCat &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </Dialog>

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

      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

          <div className="relative bg-[#09090b] rounded-2xl w-full max-w-md mx-4 p-8 shadow-2xl border border-red-500/20">
            <div className="space-y-4 text-center mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <TrashIcon className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#fafafa]">
                  Delete Account
                </h3>
                <p className="text-sm text-[#a1a1aa] mt-2">
                  This action is permanent and cannot be undone. All your projects, items, and settings will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#52525b] uppercase tracking-widest text-center">
                  Type <span className="text-red-500">DELETE</span> to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="flex h-12 w-full rounded-xl border border-[#27272a] bg-[#18181b]/30 px-4 py-2 text-center text-sm font-bold text-red-500 placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-[#52525b] uppercase tracking-widest text-center">
                  Verify your password
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex h-12 w-full rounded-xl border border-[#27272a] bg-[#18181b]/30 px-4 py-2 text-center text-sm font-medium text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 pt-8">
              <button
                type="button"
                disabled={isLoading || deleteConfirmText !== 'DELETE' || !deletePassword}
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await axios.delete('/api/auth/delete-account', {
                      data: { password: deletePassword }
                    });
                    toast.success('Account deleted successfully');
                    signOut({ callbackUrl: '/auth/signin' });
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Failed to delete account');
                    setIsLoading(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all bg-red-500 text-[#fafafa] hover:bg-red-600 h-12 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
              >
                {isLoading ? 'Deleting...' : 'Permanently Delete My Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
                className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors text-[#a1a1aa] hover:text-[#fafafa] h-12 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
 
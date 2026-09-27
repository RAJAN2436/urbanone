import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { LandingPage } from './LandingPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { CustomerHome } from './CustomerHome';
import { MerchantDetail } from './MerchantDetail';
import { CartCheckoutModal } from './CartCheckoutModal';
import { OrderTrackingView } from './OrderTrackingView';
import { CustomerProfile } from './CustomerProfile';
import { ProfileCompletionModal } from './ProfileCompletionModal';

export const CustomerAppView = () => {
  const { customerSubView, setCustomerSubView, isAuthenticated, isProfileIncomplete } = usePlatform();

  const isProtectedView = ['tracking', 'profile'].includes(customerSubView);

  return (
    <div className="w-full min-h-screen bg-white text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ErrorBoundary onReset={() => setCustomerSubView('home')}>
          {customerSubView === 'landing' && <LandingPage />}
          {customerSubView === 'login' && <LoginPage />}
          {customerSubView === 'register' && <RegisterPage />}
          {customerSubView === 'home' && <CustomerHome />}
          {customerSubView === 'merchant' && <MerchantDetail />}
          {customerSubView === 'cart' && <CartCheckoutModal />}
          {isProtectedView && !isAuthenticated && <LoginPage />}
          {isAuthenticated && customerSubView === 'tracking' && <OrderTrackingView />}
          {isAuthenticated && customerSubView === 'profile' && <CustomerProfile />}

          {/* One-Time Mandatory Profile Completion Modal after Google or Email Registration */}
          {isAuthenticated && isProfileIncomplete && <ProfileCompletionModal />}
        </ErrorBoundary>
      </div>
    </div>
  );
};

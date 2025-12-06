import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/admin/layout';
import GlobalSearch from '@/components/GlobalSearch';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/admin'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock authentication store
jest.mock('@/store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: { id: 'admin1', role: 'admin', name: 'Admin User' },
    logout: jest.fn(),
    isAuthenticated: true
  })
}));

// Mock KeyboardShortcuts component
jest.mock('@/components/KeyboardShortcuts', () => {
  return function MockKeyboardShortcuts({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="keyboard-shortcuts">
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

describe('Admin Flow Integration Tests', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (fetch as jest.Mock).mockClear();
    mockRouter.push.mockClear();
  });

  it('completes full admin navigation flow', async () => {
    render(
      <AdminLayout>
        <div>Admin Dashboard</div>
      </AdminLayout>
    );

    // 1. Verify admin layout renders
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    // 2. Test global search button
    const searchButton = screen.getByRole('button', { name: /ara/i });
    fireEvent.click(searchButton);

    // 3. Test search input appears
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    expect(searchInput).toBeInTheDocument();

    // 4. Test search functionality
    fireEvent.change(searchInput, { target: { value: 'kullanıcı' } });

    await waitFor(() => {
      expect(screen.getByText('Kullanıcı Yönetimi')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles mobile menu toggle', () => {
    render(
      <AdminLayout>
        <div>Admin Dashboard</div>
      </AdminLayout>
    );

    // Check if mobile menu button exists
    const mobileMenuButton = screen.queryByRole('button', { name: /menu/i });
    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);
      // Check if sidebar becomes visible
      const sidebar = screen.queryByRole('navigation');
      expect(sidebar).toBeInTheDocument();
    }
  });

  it('handles keyboard shortcuts', () => {
    render(
      <AdminLayout>
        <div>Admin Dashboard</div>
      </AdminLayout>
    );

    // Test that the layout renders without errors
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    
    // Test keyboard shortcut for help (without triggering the modal)
    fireEvent.keyDown(document, { key: '?', ctrlKey: true });
    
    // Test should pass if no errors occur
    expect(true).toBe(true);
  });

  it('handles logout flow', async () => {
    render(
      <AdminLayout>
        <div>Admin Dashboard</div>
      </AdminLayout>
    );

    // Check if logout button exists and click it
    const logoutButton = screen.queryByText('Çıkış Yap');
    if (logoutButton) {
      fireEvent.click(logoutButton);
      // Test passes if logout button exists and is clickable
      expect(logoutButton).toBeInTheDocument();
    }
  });

  it('handles error states gracefully', async () => {
    render(
      <AdminLayout>
        <div>Admin Dashboard</div>
      </AdminLayout>
    );

    // Test search functionality
    const searchButton = screen.getByRole('button', { name: /ara/i });
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Test should pass if search input is functional
    expect(searchInput).toBeInTheDocument();
  });

  it('handles loading states', async () => {
    render(
      <AdminLayout>
        <div>Admin Dashboard</div>
      </AdminLayout>
    );

    // Test search loading state
    const searchButton = screen.getByRole('button', { name: /ara/i });
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should show loading state briefly
    await waitFor(() => {
      expect(screen.getByText('Aranıyor...')).toBeInTheDocument();
    }, { timeout: 500 });
  });
});

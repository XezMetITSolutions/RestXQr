import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GlobalSearch from '@/components/GlobalSearch';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

describe('GlobalSearch Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (fetch as jest.Mock).mockClear();
    mockRouter.push.mockClear();
  });

  it('aç/kapa butonu ile arama modalını açar', () => {
    render(<GlobalSearch />);
    const openBtn = screen.getByRole('button', { name: /ara/i });
    fireEvent.click(openBtn);
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    expect(searchInput).toBeInTheDocument();
  });

  it('shows loading state when searching', async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole('button', { name: /ara/i }));
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for loading state to appear and disappear
    await waitFor(() => {
      expect(screen.getByText('Aranıyor...')).toBeInTheDocument();
    }, { timeout: 500 });
    
    await waitFor(() => {
      expect(screen.queryByText('Aranıyor...')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('displays search results', async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole('button', { name: /ara/i }));
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    fireEvent.change(searchInput, { target: { value: 'kullanıcı' } });

    await waitFor(() => {
      // Demo veri başlıkları Türkçe
      expect(screen.getByText('Kullanıcı Yönetimi')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('navigates to result when clicked', async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole('button', { name: /ara/i }));
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    fireEvent.change(searchInput, { target: { value: 'kullanıcı' } });

    await waitFor(() => {
      const resultItem = screen.getByText('Kullanıcı Yönetimi');
      fireEvent.click(resultItem);
    }, { timeout: 1000 });

    expect(mockRouter.push).toHaveBeenCalledWith('/admin/users');
  });

  it('shows no results message when no matches found', async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole('button', { name: /ara/i }));
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('Arama sonucu bulunamadı')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('debounces search input', async () => {
    render(<GlobalSearch />);
    fireEvent.click(screen.getByRole('button', { name: /ara/i }));
    const searchInput = screen.getByPlaceholderText('Ara... (Ctrl+K ile aç/kapat)');
    
    // Rapid input changes
    fireEvent.change(searchInput, { target: { value: 'k' } });
    fireEvent.change(searchInput, { target: { value: 'ku' } });
    fireEvent.change(searchInput, { target: { value: 'kullanıcı' } });

    // Wait for debounced search to complete
    await waitFor(() => {
      expect(screen.getByText('Kullanıcı Yönetimi')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

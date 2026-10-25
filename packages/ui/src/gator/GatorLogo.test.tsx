import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GatorLogo } from './GatorLogo';

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
});

describe('GatorLogo', () => {
  it('is a button with the given name that calls onClick once per click', () => {
    const onClick = vi.fn();
    render(<GatorLogo label="Refresh" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('draws the head inside the tile clip', () => {
    render(<GatorLogo label="Refresh" />);
    const head = document.querySelector('.head')!;
    expect(head.parentElement?.getAttribute('clip-path')).toMatch(/clipTile/);
  });

  it('sizes the mark inside a button 6 px larger', () => {
    render(<GatorLogo label="Refresh" size={42} />);
    expect(getComputedStyle(screen.getByRole('button')).width).toBe('48px');
    expect(document.querySelector('svg')?.getAttribute('width')).toBe('42');
  });

  it('drops the head shadow and rims the head on Dark only', () => {
    render(<GatorLogo label="Refresh" />);
    const head = document.querySelector('.head')!;
    const hd = document.querySelector('.hd')!;
    expect(getComputedStyle(hd).stroke).not.toBe('rgb(159, 211, 106)');
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(getComputedStyle(head).filter).toBe('none');
    expect(getComputedStyle(hd).stroke).toBe('rgb(159, 211, 106)');
  });
});

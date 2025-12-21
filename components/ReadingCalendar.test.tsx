import { render, screen } from '@testing-library/react';
import ReadingCalendar from './ReadingCalendar';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('ReadingCalendar', () => {
    it('renders the calendar title', () => {
        render(<ReadingCalendar activityData={{}} />);
        expect(screen.getByText('독서 달력')).toBeInTheDocument();
        expect(screen.getByText('최근 1년')).toBeInTheDocument();
    });

    it('renders without crashing even with empty data', () => {
        render(<ReadingCalendar activityData={{}} />);
        const titleElement = screen.getByText(/독서 달력/i);
        expect(titleElement).toBeInTheDocument();
    });
});

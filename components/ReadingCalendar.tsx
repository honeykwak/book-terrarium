import React from 'react';

interface Props {
    activityData: Record<string, number>; // date "YYYY-MM-DD" -> count
}

const ReadingCalendar: React.FC<Props> = ({ activityData = {} }) => {
    // Generate last 365 days
    const today = new Date();
    const days = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    // Helper to format date key
    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    // Helper to determine color intensity
    const getColor = (count: number) => {
        if (!count) return 'bg-sage-100/50'; // Empty
        if (count < 3) return 'bg-sage-300';
        if (count < 6) return 'bg-sage-500';
        return 'bg-sage-700';
    };

    return (
        <div className="w-full">
            <h4 className="text-sm font-bold text-sage-800 mb-3 flex items-center gap-2">
                <span>독서 달력</span>
                <span className="text-[10px] font-normal text-sage-500 bg-sage-100 px-2 py-0.5 rounded-full">최근 1년</span>
            </h4>

            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar justify-end">
                {/* We need to group by weeks for the grid layout (columns = weeks, rows = days) */}
                {Array.from({ length: 53 }).map((_, weekIndex) => {
                    return (
                        <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const overallIndex = weekIndex * 7 + dayIndex;
                                if (overallIndex >= days.length) return null;

                                const day = days[overallIndex];
                                const dateKey = formatDate(day);
                                const count = (activityData || {})[dateKey] || 0; // Double safety

                                return (
                                    <div
                                        key={dateKey}
                                        className={`w-2.5 h-2.5 rounded-[1px] ${getColor(count)} transition-all hover:scale-125 hover:z-10 relative group`}
                                    >
                                        {/* Custom Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-20 whitespace-nowrap">
                                            <div className="bg-sage-800 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                                                {dateKey}: {count} messages
                                            </div>
                                            {/* Triangle */}
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-sage-800 absolute left-1/2 transform -translate-x-1/2 top-full"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-sage-400">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-sage-100/50"></div>
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-sage-300"></div>
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-sage-500"></div>
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-sage-700"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default ReadingCalendar;
